import { Request, Response } from 'express';
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uuidSchema, paginationSchema } from '../validators';
import { get } from 'http';

export const trackLikeController = {
    likeTrack: async (req: Request, res: Response) => {
        const trackId = uuidSchema.parse(req.params.trackId);
        const userId = req.user?.id as string;

        const existingLike = await prisma.trackLike.findFirst({
            where: {
                trackId,
                userId,
            },
        });

        if (existingLike) {
            throw new CustomErrors.ConflictError('Track already liked by the user');
        }

        const newLike = await prisma.trackLike.create({
            data: {
                trackId,
                userId,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Track liked successfully',
            data: { like: newLike },
        });
    },

    unlikeTrack: async (req: Request, res: Response) => {
        const trackId = uuidSchema.parse(req.params.trackId);
        const userId = req.user?.id;

        const existingLike = await prisma.trackLike.findFirst({
            where: {
                trackId,
                userId,
            },
        });

        if (!existingLike) {
            throw new CustomErrors.NotFoundError('Like not found for this track by the user');
        }

        await prisma.trackLike.delete({
            where: { id: existingLike.id },
        });

        res.status(200).json({
            success: true,
            message: 'Track unlike successfully',
        });
    },

    getLikedTracks: async (req: Request, res: Response) => {
        const pagination = paginationSchema.parse(req.query);
        const { page = 1, limit = 10 } = pagination;
        const userId = req.user?.id as string;

        const [likedTracks, total] = await Promise.all([
            prisma.trackLike.findMany({
                where: { userId },
                include: { 
                    track: {
                        include: { artist: true }
                    }
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.trackLike.count({ where: { userId } }),
        ]);

        const tracks = likedTracks.map((like) => like.track);

        res.status(200).json({
            success: true,
            data: { tracks },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }

        });
    },
}
