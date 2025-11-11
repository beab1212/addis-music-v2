import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { artistFollowController } from "../controllers/artistFollowController";

const router = Router();


router.post("/:artistId/follow", requireAuth, artistFollowController.followArtist);
router.delete("/:artistId/unfollow", requireAuth, artistFollowController.unfollowArtist);

export default router;