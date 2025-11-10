import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { playHistoryController } from '../controllers/playHistoryController';

const router = Router();

router.get('/users/:userId/play-history', requireAuth, playHistoryController.getUserPlayHistory);
router.get('/users/:userId/play-history/search', requireAuth, playHistoryController.searchUserPlayHistory);

export default router;
