import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { bothUpload } from "../middlewares/fileHandler";
import { checkFileSize } from "../utils/checkFileSize";
import { advertisementController } from "../controllers/advertisementController";

const router = Router();

// Route to upload a new advertisement
router.post(
  '/upload',
  requireAuth,
    authorize(['admin']),
    bothUpload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 }
    ]),
    checkFileSize,
  advertisementController.createAdvertisement
);
router.get(
  '/search',
  requireAuth,
  authorize(['admin']),
  advertisementController.searchAdvertisements
)
router.get(
  '/:id',
  requireAuth,
  advertisementController.getAdvertisementById
);
router.get(
  '/',
  requireAuth,
    authorize(['admin']),
  advertisementController.getAllAdvertisements
);
router.delete(
  '/:id',
  requireAuth,
    authorize(['admin']),
  advertisementController.deleteAdvertisement
);
router.put(
  '/:id',
  requireAuth,
    authorize(['admin']),
    advertisementController.updateAdvertisement
);


export default router;
