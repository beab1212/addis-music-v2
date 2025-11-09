import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { uploadImage } from "../middlewares/fileHandler";
import { artistController } from "../controllers/artistController";


const router = Router();

// Create Artist with image upload
router.post("/", requireAuth, authorize("admin"), uploadImage.single('image'), artistController.createArtist);
router.get("/", artistController.getAllArtists);
router.get("/:id", artistController.getArtistById);
router.get("/search", artistController.searchArtists);
router.put("/:id", requireAuth, authorize("admin"), uploadImage.single('image'), artistController.updateArtist);
router.delete("/:id", requireAuth, authorize("admin"), artistController.deleteArtist);

export default router;