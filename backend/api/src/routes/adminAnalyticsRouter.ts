import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorize";
import { adminAnalyticsController } from "../controllers/adminAnalyticsController";

const router = Router();

router.get("/total-users-with-average-growth", requireAuth, authorize(['admin']), adminAnalyticsController.getTotalUsersWithAverageGrowth);
router.get("/total-tracks-with-average-growth", requireAuth, authorize(['admin']), adminAnalyticsController.getTotalTracksWithAverageGrowth);
router.get("/total-albums-with-average-growth", requireAuth, authorize(['admin']), adminAnalyticsController.getTotalAlbumsWithAverageGrowth);
router.get("/total-plays-with-average-growth", requireAuth, authorize(['admin']), adminAnalyticsController.getTotalPlaysWithAverageGrowth);
router.get("/genre-distribution", requireAuth, authorize(['admin']), adminAnalyticsController.getGenreDistribution);
router.get("/total-revenue-with-average-growth", requireAuth, authorize(['admin']), adminAnalyticsController.getTotalRevenueWithAverageGrowth);

export default router;