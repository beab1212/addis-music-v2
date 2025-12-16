import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { personalizationControl } from "../controllers/personalizationControl";

const router = Router();

router.get("/for-you", requireAuth, personalizationControl.forYou);
router.get("/trending-now", requireAuth, personalizationControl.trendingNow);
router.get("/featured-artists", requireAuth, personalizationControl.featuredArtists);
router.get("/popular-playlists", requireAuth, personalizationControl.popularPlaylists);
router.get("/new-albums", requireAuth, personalizationControl.newAlbums);

export default router;
