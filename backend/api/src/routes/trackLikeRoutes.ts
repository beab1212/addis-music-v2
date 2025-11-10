import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { trackLikeController } from "../controllers/trackLikeController";

const router = Router();

router.post("/:trackId/like", requireAuth, trackLikeController.likeTrack);
router.delete("/:trackId/unlike", requireAuth, trackLikeController.unlikeTrack);
router.get("/liked-tracks", requireAuth, trackLikeController.getLikedTracks);

export default router;
