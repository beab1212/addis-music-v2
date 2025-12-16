import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { trackLikeController } from "../controllers/trackLikeController";

const router = Router();

router.post("/:trackId/like", requireAuth, trackLikeController.likeTrack);
router.delete("/:trackId/unlike", requireAuth, trackLikeController.unlikeTrack);
router.get("/liked-tracks", requireAuth, trackLikeController.getLikedTracks);
router.post("/:trackId/toggle-like", requireAuth, trackLikeController.toggleLikeTrack);
router.get("/:trackId/is-liked", requireAuth, trackLikeController.getIsTrackLiked);

export default router;
