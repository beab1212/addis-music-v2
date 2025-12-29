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
router.post("/cancel-subscription",
    requireAuth,
    authorize("user"),
    subscriptionController.cancelSubscription
);

export default router;