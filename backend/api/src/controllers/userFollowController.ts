import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uuidSchema, paginationSchema, searchSchema } from '../validators';

export const userFollowController = {
    followUser: async (req: Request, res: Response) => {
        const followingId = uuidSchema.parse(req.params.userId);
        const followerId = req.user?.id as string;

        if (followingId === followerId) {
            throw new CustomErrors.BadRequestError('You cannot follow yourself');
        }

        const existingFollow = await prisma.userFollow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            throw new CustomErrors.BadRequestError('You are already following this user');
        }

        const newFollow = await prisma.userFollow.create({
            data: {
                followerId,
                followingId,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Successfully followed the user',
            data: { follow: newFollow }
        });
    },

    unfollowUser: async (req: Request, res: Response) => {
        const followingId = uuidSchema.parse(req.params.userId);
        const followerId = req.user?.id as string;

        const existingFollow = await prisma.userFollow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (!existingFollow) {
            throw new CustomErrors.NotFoundError('You are not following this user');
        }

        await prisma.userFollow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Successfully unfollowed the user',
        });
    },

    getFollowers: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const userId = uuidSchema.parse(req.params.userId);

        const [followers, totalFollowers] = await Promise.all([
            prisma.userFollow.findMany({
                where: { followingId: userId },
                include: { follower: true },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.userFollow.count({
                where: { followingId: userId },
            }),
        ]);

        if (followers.length === 0) {
            throw new CustomErrors.NotFoundError('This user has no followers');
        }

        res.status(200).json({
            success: true,
            data: { followers, totalFollowers },
            pagination: { page, limit, totalPages: Math.ceil(totalFollowers / limit) }
        });
    },

    getMyFollowers: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const userId = req.user?.id as string;

        const [followers, totalFollowers] = await Promise.all([
            prisma.userFollow.findMany({
                where: { followingId: userId },
                include: { follower: true },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.userFollow.count({
                where: { followingId: userId },
            }),
        ]);

        if (followers.length === 0) {
            throw new CustomErrors.NotFoundError('You have no followers');
        }

        res.status(200).json({
            success: true,
            data: { followers, totalFollowers },
            pagination: { page, limit, totalPages: Math.ceil(totalFollowers / limit) }
        });
    },

    getFollowing: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const userId = uuidSchema.parse(req.params.userId);

        const [following, totalFollowing] = await Promise.all([
            prisma.userFollow.findMany({
                where: { followerId: userId },
                include: { following: true },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.userFollow.count({
                where: { followerId: userId },
            }),
        ]);

        if (following.length === 0) {
            throw new CustomErrors.NotFoundError('This user is not following anyone');
        }

        res.status(200).json({
            success: true,
            data: { following, totalFollowing },
            pagination: { page, limit, totalPages: Math.ceil(totalFollowing / limit) }
        });
    },

    getMyFollowing: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const userId = req.user?.id as string;

        const [following, totalFollowing] = await Promise.all([
            prisma.userFollow.findMany({
                where: { followerId: userId },
                include: { following: true },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.userFollow.count({
                where: { followerId: userId },
            }),
        ]);

        if (following.length === 0) {
            throw new CustomErrors.NotFoundError('You are not following anyone');
        }

        res.status(200).json({
            success: true,
            data: { following, totalFollowing },
            pagination: { page, limit, totalPages: Math.ceil(totalFollowing / limit) }
        });
    },
};