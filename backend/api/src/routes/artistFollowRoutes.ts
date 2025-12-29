import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { artistFollowController } from "../controllers/artistFollowController";

const router = Router();


router.get("/:artistId/status", requireAuth, artistFollowController.getFollowStatus);
router.get("/follow-count", requireAuth, artistFollowController.getFollowedArtistsCount);
router.get("/search", requireAuth, artistFollowController.searchFollowedArtists);
router.get("/", requireAuth, artistFollowController.getFollowedArtists);
router.post("/:artistId/follow", requireAuth, artistFollowController.followArtist);
router.delete("/:artistId/unfollow", requireAuth, artistFollowController.unfollowArtist);

export default router;