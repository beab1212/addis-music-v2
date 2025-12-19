import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorize";
import { userController } from "../controllers/userController";

const router = Router();

router.get("/me", requireAuth, userController.getMe);
router.get('/preferences', requireAuth, userController.getUserPreferences);
router.get("/:id", requireAuth, authorize("admin"), userController.getUser);
router.put("/profile", requireAuth, userController.updateUserProfile);
router.put("/preferences", requireAuth, userController.updateUserPreferences);



export default router;
