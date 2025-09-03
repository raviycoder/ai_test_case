import { Router } from "express";
import {
  triggerBackgroundTestGeneration,
  getBackgroundTestStatus,
  inngestHealthCheck,
} from "../controllers/inngest.controller";

const router = Router();

// Trigger background test generation
router.post("/trigger", triggerBackgroundTestGeneration);

// Get background test generation status
router.get("/status/:sessionId", getBackgroundTestStatus);

// Health check
router.get("/health", inngestHealthCheck);

export default router;
