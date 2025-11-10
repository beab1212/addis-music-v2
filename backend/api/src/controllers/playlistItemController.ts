import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { addItemToPlaylistSchema, playlistUuidSchema } from "../validators/playlistItemValidator";
import { uuidSchema, searchSchema, paginationSchema } from '../validators';

export const playlistItemController = {
    addItemToPlaylist: async (req: Request, res: Response) => {
        const playlistId = playlistUuidSchema.parse(req.params.playlistId);
        const { trackId, position } = addItemToPlaylistSchema.parse(req.body);
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        // Fetch playlist and verify permissions
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: { items: { orderBy: { position: 'asc' } } },
        });

        if (!playlist) {
            throw new CustomErrors.NotFoundError('Playlist not found');
        }

        if (playlist.userId !== userId && !isAdmin) {
            throw new CustomErrors.UnauthorizedError('You are not authorized to modify this playlist');
        }

        // Validate track
        const track = await prisma.track.findUnique({
            where: { id: trackId },
        });

        if (!track) {
            throw new CustomErrors.NotFoundError('Track not found');
        }

        const items = playlist.items;
        const currentItemCount = items.length;

        if (currentItemCount >= 100) {
            throw new CustomErrors.BadRequestError('Playlist item limit of 100 reached');
        }

        // Determine correct insertion position
        let newPosition = position ?? currentItemCount + 1;
        if (newPosition < 1) newPosition = 1;
        if (newPosition > currentItemCount + 1) newPosition = currentItemCount + 1;

        const [newItem] = await prisma.$transaction(async (tx) => {
        // Shift positions efficiently if inserting in middle
            if (newPosition <= currentItemCount) {
                await tx.playlistItem.updateMany({
                where: {
                    playlistId,
                    position: { gte: newPosition },
                },
                data: {
                    position: { increment: 1 },
                },
                });
            }

            // Insert the new item
            const created = await tx.playlistItem.create({
                data: {
                playlistId,
                trackId,
                position: newPosition,
                },
            });

            return [created];
        });

        if (!newItem) {
            throw new CustomErrors.BadRequestError('Failed to add item to playlist');
        }

        res.status(201).json({
            success: true,
            data: { item: newItem },
        });
    },

    deleteItemFromPlaylist: async (req: Request, res: Response) => {
        const playlistId = playlistUuidSchema.parse(req.params.playlistId);
        const itemId = uuidSchema.parse(req.params.itemId);
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        // Fetch playlist and verify permissions
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
        });

        if (!playlist) {
            throw new CustomErrors.NotFoundError('Playlist not found');
        }

        if (playlist.userId !== userId && !isAdmin) {
            throw new CustomErrors.UnauthorizedError('You are not authorized to modify this playlist');
        }

        // Fetch the item to be deleted
        const itemToDelete = await prisma.playlistItem.findUnique({
            where: { id: itemId },
        });

        if (!itemToDelete || itemToDelete.playlistId !== playlistId) {
            throw new CustomErrors.NotFoundError('Playlist item not found');
        }

        const deletedPosition = itemToDelete.position;

        await prisma.$transaction(async (tx) => {
            // Delete the item
            await tx.playlistItem.delete({
                where: { id: itemId },
            });

            // Shift positions of remaining items
            await tx.playlistItem.updateMany({
                where: {
                    playlistId,
                    position: { gt: deletedPosition },
                },
                data: {
                    position: { decrement: 1 },
                },
            });
        });

        res.status(200).json({
            success: true,
            message: 'Playlist item deleted successfully',
        });
    },

    shiftItemPosition: async (req: Request, res: Response) => {
        const playlistId = playlistUuidSchema.parse(req.params.playlistId);
        const itemId = uuidSchema.parse(req.params.itemId);
        const { newPosition } = req.body as { newPosition: number };
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        // Fetch playlist and verify permissions
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId },
            include: { items: { orderBy: { position: 'asc' } } },
        });

        if (!playlist) {
            throw new CustomErrors.NotFoundError('Playlist not found');
        }

        if (playlist.userId !== userId && !isAdmin) {
            throw new CustomErrors.UnauthorizedError('You are not authorized to modify this playlist');
        }

        const items = playlist.items;
        const currentItemCount = items.length;

        // Validate new position
        let targetPosition = newPosition;
        if (targetPosition < 1) targetPosition = 1;
        if (targetPosition > currentItemCount) targetPosition = currentItemCount;

        const itemToMove = items.find(item => item.id === itemId);
        if (!itemToMove) {
            throw new CustomErrors.NotFoundError('Playlist item not found');
        }

        const originalPosition = itemToMove.position;

        if (originalPosition === targetPosition) {
            return res.status(200).json({
                success: true,
                message: 'Item position unchanged',
            });
        }

        await prisma.$transaction(async (tx) => {
            // Shift other items
            if (targetPosition < originalPosition) {
                await tx.playlistItem.updateMany({
                    where: {
                        playlistId,
                        position: { gte: targetPosition, lt: originalPosition },
                    },
                    data: {
                        position: { increment: 1 },
                    },
                });
            } else {
                await tx.playlistItem.updateMany({
                    where: {
                        playlistId,
                        position: { gt: originalPosition, lte: targetPosition },
                    },
                    data: {
                        position: { decrement: 1 },
                    },
                });
            }

            // Update the position of the moved item
            await tx.playlistItem.update({
                where: { id: itemId },
                data: { position: targetPosition },
            });
        });

        res.status(200).json({
            success: true,
            message: 'Item position updated successfully',
        });
    },
};
