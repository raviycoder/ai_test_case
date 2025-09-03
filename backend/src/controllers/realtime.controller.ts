import type { Request, Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import { getSubscriptionToken } from "@inngest/realtime";
import { inngest, testGenerationChannel } from "../services/inngest";

// Get subscription token for realtime updates
export const getRealtimeToken = async (req: Request, res: Response) => {
  try {
    console.log("🔑 REALTIME: Getting subscription token request");
    
    // Validate authentication
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      console.log("❌ REALTIME: Authentication failed");
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log(`✅ REALTIME: Authentication passed for user: ${sessionResp.user.id}`);

    const { sessionId } = req.params;

    if (!sessionId) {
      console.log("❌ REALTIME: No session ID provided");
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    console.log(`🎫 REALTIME: Creating subscription token for session: ${sessionId}`);

    // Create subscription token for the specific session channel
    const token = await getSubscriptionToken(inngest, {
      channel: testGenerationChannel(sessionId),
      topics: ["progress"], // Subscribe to progress updates
    });

    console.log(`✅ REALTIME: Token created successfully for session: ${sessionId} ${token}`);

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
