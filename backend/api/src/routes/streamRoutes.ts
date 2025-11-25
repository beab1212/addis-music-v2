import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { streamController } from "../controllers/streamController";

const router = Router();

router.get("/:audioId/master.m3u8", requireAuth, streamController.stream);

export default router;
