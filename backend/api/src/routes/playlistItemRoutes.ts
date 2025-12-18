import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { playlistItemController } from '../controllers/playlistItemController';

const router = Router();

router.post('/:playlistId/items', requireAuth, playlistItemController.addItemToPlaylist);
router.post('/:playlistId/items/bulk', requireAuth, playlistItemController.addMultipleItemsToPlaylist);
router.delete('/:playlistId/items/:trackId', requireAuth, playlistItemController.deleteItemFromPlaylist);
router.put('/:playlistId/items/:itemId/position', requireAuth, playlistItemController.shiftItemPosition);


export default router;