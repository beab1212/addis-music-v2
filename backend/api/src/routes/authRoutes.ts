import { Router } from "express";
import { authController } from "../controllers/authController";
import { requireAuth } from "../middlewares/authMiddleware";

const router = Router();

router.post("/sign-up/email", authController.signUpEmail);
router.post("/sign-in/email", authController.signInEmail);
router.post("/sign-out", requireAuth, authController.signoutEmail);

export default router;
