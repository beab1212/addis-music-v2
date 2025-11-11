import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { userFollowController } from "../controllers/userFollowController";

const router = Router();

router.post("/:userId/follow", requireAuth, userFollowController.followUser);
router.delete("/:userId/unfollow", requireAuth, userFollowController.unfollowUser);
router.get("/:userId/followers", requireAuth, authorize("admin"), userFollowController.getFollowers);
router.get("/:userId/following", requireAuth, authorize("admin"), userFollowController.getFollowing);
router.get("/me/followers", requireAuth, userFollowController.getMyFollowers);
router.get("/me/following", requireAuth, userFollowController.getMyFollowing);


export default router;