import type { Request, Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest, testGenerationChannel } from "../services/inngest";
import TestSession from "../models/test_session.model";

// Get subscription token for realtime updates
export const getRealtimeToken = async (req: Request, res: Response) => {
  try {    
    // Validate authentication
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }


    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }


    // Create subscription token for the specific session channel
    const token = await getSubscriptionToken(inngest, {
      channel: testGenerationChannel(sessionId),
      topics: ["progress"], // Subscribe to progress updates
    });


    return res.json({
      success: true,
      message: "Realtime subscription token created",
      data: {
        token,
        sessionId,
        channel: `test-generation:${sessionId}`,
        topics: ["progress"],
      },
    });

  } catch (error) {
    console.error("❌ REALTIME: Token creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create realtime subscription token",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// get realtime updates from session db
export const getRealTimeUpdates = async (req: Request, res: Response) => {
  const user = getAuth();
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  try {
    const session = await TestSession.findOne({ sessionId}).select('defaultPath status');
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("❌ REALTIME: Error fetching session updates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch session updates",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}