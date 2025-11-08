import { Router } from "express";
import { systemController } from "../controllers/systemController";

const router = Router();

router.get("/health", systemController.healthCheck);

export default router;
