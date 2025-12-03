import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { bothUpload } from "../middlewares/fileHandler";
import { checkFileSize } from "../utils/checkFileSize";
import { trackController } from "../controllers/trackController";

const router = Router();

// Route to upload a new track
router.post(
  '/upload',
  requireAuth,
    authorize(['admin']),
    bothUpload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 }
    ]),
    checkFileSize,
  trackController.uploadTrack
);
router.get('/:id', trackController.getTrackById);
router.get('/', trackController.getAllTracks);

// TODO - implement other track-related routes (e.g., update, delete, list)


export default router;
