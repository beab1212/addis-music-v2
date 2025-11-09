import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorize";
import { userController } from "../controllers/userController";

const router = Router();

router.get("/me", requireAuth, userController.getMe);
router.get("/:id", requireAuth, authorize("admin"), userController.getUser);



export default router;
