import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { playlistController } from "../controllers/playlistController";
import { uploadImage } from "../middlewares/fileHandler";

const router = Router();

router.post("/", requireAuth, uploadImage.single('image'), playlistController.createPlaylist);
router.get("/user", requireAuth, playlistController.getUserPlaylists);
router.get("/:id", requireAuth, playlistController.getPlaylistById);
router.put("/:id", requireAuth, playlistController.updatePlaylist);
router.delete("/:id", requireAuth, playlistController.deletePlaylist);
router.get("/", requireAuth, playlistController.getAllPlaylists);
router.get("/search", requireAuth, playlistController.searchPlaylists);

export default router;
