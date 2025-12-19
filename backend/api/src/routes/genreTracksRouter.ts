import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { genreTracksController } from "../controllers/genreTracksController";

const router = Router();

router.get("/", requireAuth, genreTracksController.getAllGenresWithTrackCounts);
router.get("/:genreId/tracks", requireAuth, genreTracksController.getGenreTracks);
router.get("/:genreId/info", requireAuth, genreTracksController.getGenreInfo);
router.get("/:genreId/top-tracks", requireAuth, genreTracksController.getGenreTopTracks);

export default router;
