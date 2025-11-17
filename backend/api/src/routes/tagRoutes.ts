import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { tagController } from "../controllers/tagController";

const router = Router();

router.post("/", requireAuth, authorize("admin"), tagController.createTag);
router.get("/", requireAuth, tagController.getAllTags);
router.get("/:id", requireAuth, tagController.getTagById);
router.put("/:id", requireAuth, authorize("admin"), tagController.updateTag);
router.delete("/:id", requireAuth, authorize("admin"), tagController.deleteTag);

export default router;