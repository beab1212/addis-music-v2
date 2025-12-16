import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uuidSchema, searchSchema, paginationSchema } from '../validators';

export const artistFollowController = {
    followArtist: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.artistId);
        const userId = req.user?.id as string;

        const existingFollow = await prisma.artistFollow.findUnique({
            where: {
                userId_artistId: {
                    userId,
                    artistId,
                },
            },
        });

        if (existingFollow) {
            throw new CustomErrors.BadRequestError('You are already following this artist');
        }

        const newFollow = await prisma.artistFollow.create({
            data: {
                userId,
                artistId,
            },
        });

        res.status(201).json({
            success: true,
            data: { follow: newFollow }
        });
    },

    unfollowArtist: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.artistId);
        const userId = req.user?.id as string;

        const existingFollow = await prisma.artistFollow.findUnique({
            where: {
                userId_artistId: {
                    userId,
                    artistId,
                },
            },
        });

        if (!existingFollow) {
            throw new CustomErrors.NotFoundError('You are not following this artist');
        }

        await prisma.artistFollow.delete({
            where: {
                userId_artistId: {
                    userId,
                    artistId,
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Successfully unfollowed the artist'
        });
    },

    getFollowedArtists: async (req: Request, res: Response) => {
        const userId = req.user?.id as string;

        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const [followedArtists, totalFollows] = await Promise.all([
            prisma.artistFollow.findMany({
                where: { userId },
                skip: offset,
                take: limit,
                include: {
                    artist: true,
                },
            }),
            prisma.artistFollow.count({
                where: { userId },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                follows: followedArtists,
                pagination: {
                    total: totalFollows,
                    page,
                    limit,
                },
            },
        });
    },
    getFollowStatus: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.artistId);
        const userId = req.user?.id as string;

        const existingFollow = await prisma.artistFollow.findUnique({
            where: {
                userId_artistId: {
                    userId,
                    artistId,
                },
            },
        });

        res.status(200).json({
            success: true,
            data: { isFollowing: !!existingFollow }
        });
    }
};