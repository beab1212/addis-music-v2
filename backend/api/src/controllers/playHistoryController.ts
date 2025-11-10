import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uuidSchema, searchSchema, paginationSchema } from '../validators';

export const playHistoryController = {
    getUserPlayHistory: async (req: Request, res: Response) => {
        const userId = uuidSchema.parse(req.params.userId);
        const { page, limit } = paginationSchema.parse(req.query);

        const [ playHistories, totalCount ] = await Promise.all([
            prisma.playHistory.findMany({
                where: { userId },
                orderBy: { playedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    track: {
                        include: {
                            artist: true,
                            album: true,
                        },
                    },
                },
            }),
            prisma.playHistory.count({
                where: { userId },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: { playHistories },
            pagination: { page, limit, totalPages: Math.ceil(totalCount / limit) }
        });
    },

    searchUserPlayHistory: async (req: Request, res: Response) => {
        const userId = uuidSchema.parse(req.params.userId);
        const { q, page, limit } = searchSchema.parse(req.query);
        const searchTerm = `%${q}%`;

        const [ playHistories, totalCount ] = await Promise.all([
            prisma.playHistory.findMany({
                where: {
                    userId,
                    track: {
                        OR: [
                            { title: { contains: q, mode: 'insensitive' } },
                            { artist: { name: { contains: q, mode: 'insensitive' } } },
                            { album: { title: { contains: q, mode: 'insensitive' } } },
                        ],
                    },
                },
                orderBy: { playedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    track: {
                        include: {
                            artist: true,
                            album: true,
                        },
                    },
                },
            }),
            prisma.playHistory.count({
                where: {
                    userId,
                    track: {
                        OR: [
                            { title: { contains: q, mode: 'insensitive' } },
                            { artist: { name: { contains: q, mode: 'insensitive' } } },
                            { album: { title: { contains: q, mode: 'insensitive' } } },
                        ],
                    },
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: { playHistories },
            pagination: { page, limit, totalPages: Math.ceil(totalCount / limit) }
        });
    },
};
