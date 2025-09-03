import type { Request, Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import { inngest } from "../services/inngest";
import { config } from "../config";

// Interface for the request body
interface BackgroundTestGenerationRequest {
  repositoryId: string;
  sessionId?: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  repoBranch?: string;
  options?: {
    testTypes?: string[];
    coverage?: "basic" | "comprehensive";
    includeEdgeCases?: boolean;
    mockExternal?: boolean;
  };
}

// Trigger background AI test generation
export const triggerBackgroundTestGeneration = async (req: Request, res: Response) => {
  try {
    console.log("😵😵Trigger background test generation request received");
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

    const {
      repositoryId,
      sessionId,
      files,
      framework,
      repoBranch = "main",
      options = {},
    } = req.body as BackgroundTestGenerationRequest;

    // Validate required fields
    if (!repositoryId || !files || !framework) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: repositoryId, files, or framework",
      });
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one file is required for test generation",
      });
    }

    // Generate session ID if not provided
    const finalSessionId = sessionId ?? `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🚀 Triggering background test generation for session: ${finalSessionId}`);

    // Send event to Inngest for background processing
    const event = await inngest.send({
      name: "ai-test/generate",
      data: {
        userId: sessionResp.user.id,
        repositoryId,
        sessionId: finalSessionId,
        files,
        framework,
        repoBranch,
        options,
      },
    });

    console.log("✅ Inngest event sent successfully:", event);

    // Return immediate response with session ID
    return res.json({
      success: true,
      message: "Test generation started in background",
      data: {
        sessionId: finalSessionId,
        eventId: event.ids[0],
        status: "processing",
        totalFiles: files.length,
        framework,
        estimatedTime: `${files.length * 30}s`, // Rough estimate
      },
    });

  } catch (error) {
    console.error("Background test generation trigger error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger background test generation",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get real-time status of background test generation
export const getBackgroundTestStatus = async (req: Request, res: Response) => {
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

    // For now, we'll implement a simple status check
    // In a real implementation, you might want to store progress in Redis or database
    
    return res.json({
      success: true,
      message: "Use SSE endpoint for real-time updates",
      data: {
        sessionId,
        note: "Connect to /api/inngest/stream/{sessionId} for real-time progress updates",
      },
    });

  } catch (error) {
    console.error("Get background test status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get background test status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Simple health check for Inngest
export const inngestHealthCheck = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      message: "Inngest service is running",
      data: {
        service: "inngest",
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Inngest health check error:", error);
    return res.status(500).json({
      success: false,
      message: "Inngest service health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
