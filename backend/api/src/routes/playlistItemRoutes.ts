import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { playlistItemController } from '../controllers/playlistItemController';

const router = Router();

router.post('/:playlistId/items', requireAuth, playlistItemController.addItemToPlaylist);
router.delete('/:playlistId/items/:itemId', requireAuth, playlistItemController.deleteItemFromPlaylist);
router.put('/:playlistId/items/:itemId/position', requireAuth, playlistItemController.shiftItemPosition);


export default router;