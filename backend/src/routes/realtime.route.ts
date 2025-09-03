import { Router } from "express";
import { getRealtimeToken } from "../controllers/realtime.controller";

const router = Router();

// Get subscription token for realtime updates
router.get("/token/:sessionId", getRealtimeToken);

export default router;
