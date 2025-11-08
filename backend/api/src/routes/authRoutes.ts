import { Router } from "express";
import { authController } from "../controllers/authController";

const router = Router();

router.post("/sign-up/email", authController.signUpEmail);
router.post("/sign-in/email", authController.signInEmail);
router.post("/sign-out", authController.signoutEmail);

export default router;
