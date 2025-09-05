import TestSession from "../models/test_session.model";
import { Request, Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import TestFile from "../models/test_file.model";

export const createTestSession = async (req: Request, res: Response) => {
  try {
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

  const { repositoryId, framework = 'jest', session_id, repoBranch } = req.body;

    if (session_id !== "new-session") {
        const existingSession = await TestSession.findOne({ sessionId: session_id });
        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: "Session ID already in use"
            });
        }
    }

    if (repositoryId && repoBranch) {
        const existingSession = await TestSession.findOne({ repositoryId, repoBranch });
        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: "A session already exists for this repository and branch"
            });
        }
    }

    if (!repositoryId) {
      return res.status(400).json({
        success: false,
        message: "Repository ID is required"
      });
    }

  // repositoryId can be a string (not necessarily a Mongo ObjectId). No strict validation here.

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session = new TestSession({
      userId: sessionResp.user.id,
      repositoryId,
      repoBranch,
      sessionId,
      status: 'pending',
      framework,
      processingTimeMs: 0
    });

    await session.save();

    return res.status(201).json({
      success: true,
      message: "Test session created successfully",
      data: {
        sessionId: session.sessionId,
        status: session.status,
        framework: session.framework,
        createdAt: session.createdAt,
        repoBranch: session.repoBranch
      }
    });

  } catch (error) {
    console.error('Create test session error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to create test session",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const updateTestSession = async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { repositoryId, framework, userId } = req.body;

    if (!repositoryId || !userId || !framework) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const session = await TestSession.findOne({
            where: { sessionId },
        });

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        session.repositoryId = repositoryId;
        session.framework = framework;
        session.userId = userId;

        await session.save();

        return res.status(200).json(session);
    } catch (error) {
        console.error("Error updating test session:", error);
        return res.status(500).json({ error: "Failed to update test session" });
    }
}

export const deleteTestSession = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const session = await TestSession.findOne({
            where: { sessionId },
        });

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        await session.deleteOne();

        return res.status(204).send();
    } catch (error) {
        console.error("Error deleting test session:", error);
        return res.status(500).json({ error: "Failed to delete test session" });
    }
};

export const getTestSession = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
        const session = await TestSession.findOne({
            where: { sessionId },
        });

        const fileDetails = await TestFile.findOne({
            where: { _id: session?._id }
        });
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        const sessionDetails = {
            ...session.toObject(),
                originalPath: fileDetails?.originalFilePath || "",
                originalName: fileDetails?.repositoryId || ""
        };  

        return res.status(200).json(sessionDetails);
    } catch (error) {
        console.error("Error fetching test session:", error);
        return res.status(500).json({ error: "Failed to fetch test session" });
    }
};

export const getUserSessions = async (req: Request, res: Response) => {
    try {
        const auth = await getAuth();
        const sessionResp = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!sessionResp?.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication required" 
            });
        }

        const sessions = await TestSession.find({ userId: sessionResp.user.id })
            .sort({ createdAt: -1 }) // Most recent first
            .select('sessionId repositoryId repoBranch status framework processingTimeMs createdAt defaultPath completedAt countFiles'); // Select only necessary fields

        return res.status(200).json({
            success: true,
            message: "Sessions retrieved successfully",
            data: sessions
        });
    } catch (error) {
        console.error("Error fetching user sessions:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sessions",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};