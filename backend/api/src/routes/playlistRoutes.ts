import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { playlistController } from "../controllers/playlistController";

const router = Router();

router.post("/", requireAuth, playlistController.createPlaylist);
router.get("/:id", requireAuth, playlistController.getPlaylistById);
router.put("/:id", requireAuth, playlistController.updatePlaylist);
router.delete("/:id", requireAuth, playlistController.deletePlaylist);
router.get("/", requireAuth, playlistController.getAllPlaylists);
router.get("/search", requireAuth, playlistController.searchPlaylists);

export default router;
