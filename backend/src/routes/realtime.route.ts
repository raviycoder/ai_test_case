import { Router } from "express";
import { getRealtimeToken, getRealTimeUpdates } from "../controllers/realtime.controller";

const router = Router();

// Get subscription token for realtime updates
router.get("/token/:sessionId", getRealtimeToken);

// Get realtime updates from session db
router.get("/updates/:sessionId", getRealTimeUpdates);

export default router;
