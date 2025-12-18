import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { streamController } from "../controllers/streamController";

const router = Router();

// router.get("/:audioId/master.m3u8", requireAuth, streamController.stream);
router.get("/:audioId/master.m3u8", requireAuth, streamController.mainStream);
router.get("/:audioId/ads/ad.m3u8", requireAuth, streamController.addStream);
router.get("/:audioId/stream-url", requireAuth, streamController.stream);

export default router;
