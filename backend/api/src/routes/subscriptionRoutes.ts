import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { subscriptionController } from "../controllers/subscriptionController";

const router = Router();

router.post(
    "/",
    requireAuth,
    authorize("user"),
    subscriptionController.createSubscription
);

export default router;