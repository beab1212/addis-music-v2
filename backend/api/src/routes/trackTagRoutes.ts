import Router from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { trackTagController } from "../controllers/trackTagController";

const router = Router();

router.post(
    "/:trackId/tags/:tagId",
    requireAuth,
    authorize("admin"),
    trackTagController.addTagToTrack
);

router.delete(
    "/:trackId/tags/:tagId",
    requireAuth,
    authorize("admin"),
    trackTagController.removeTagFromTrack
);

export default router;
