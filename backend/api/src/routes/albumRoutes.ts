import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { uploadImage } from "../middlewares/fileHandler";
import { albumController } from "../controllers/albumController";

const router = Router();

// Create Album with cover upload
router.post("/", requireAuth, authorize("admin"), uploadImage.single('cover'), albumController.createAlbum);
router.get("/", albumController.getAllAlbums);
router.get("/search", albumController.searchAlbums);
router.get("/:id", albumController.getAlbumById);
router.delete("/:id", requireAuth, authorize("admin"), albumController.deleteAlbum);
router.put("/:id", requireAuth, authorize("admin"), uploadImage.single('cover'), albumController.updateAlbum);

export default router;