import { Request, Response } from 'express';
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uuidSchema } from '../validators';

export const trackTagController = {
    addTagToTrack: async (req: Request, res: Response) => {
        const trackId = uuidSchema.parse(req.params.trackId);
        const tagId = uuidSchema.parse(req.params.tagId);

        const track = await prisma.track.findUnique({ where: { id: trackId } });

        if (!track) {
            throw new CustomErrors.NotFoundError('Track not found');
        }

        const tag = await prisma.tag.findUnique({ where: { id: tagId } });

        if (!tag) {
            throw new CustomErrors.NotFoundError('Tag not found');
        }

        await prisma.trackTag.create({
            data: {
                trackId,
                tagId,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Tag added to track successfully',
        });
    },
    
    removeTagFromTrack: async (req: Request, res: Response) => {
        const trackId = uuidSchema.parse(req.params.trackId);
        const tagId = uuidSchema.parse(req.params.tagId);

        const trackTag = await prisma.trackTag.findFirst({
            where: { trackId: trackId, tagId: tagId },
        });

        if (!trackTag) {
            throw new CustomErrors.NotFoundError('Tag not associated with the track');
        }

        await prisma.trackTag.delete({
            where: { id: trackTag.id },
        });

        res.status(200).json({
            success: true,
            message: 'Tag removed from track successfully',
        });
    },
}
