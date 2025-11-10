import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { createPlaylistSchema } from "../validators/playlistValidator";
import { uuidSchema, searchSchema, paginationSchema } from '../validators';

export const playlistController = {
    createPlaylist: async (req: Request, res: Response) => {
        const { title, description, isPublic } = createPlaylistSchema.parse(req.body);
        const userId = req.user?.id as string;

        const newPlaylist = await prisma.playlist.create({
            data: {
                title,
                description,
                userId,
                isPublic,
                ...(req.file && { coverUrl: req.file.path }),
            },
        });

        res.status(201).json({
            success: true,
            data: { playlist: newPlaylist }
        });
    },

    getPlaylistById: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        const playlist = await prisma.playlist.findUnique({
            where: { id },
            include: { items: true },
        });

        if (!playlist?.isPublic && playlist?.userId !== userId && !isAdmin) {
            throw new CustomErrors.UnauthorizedError('You are not authorized to view this playlist');
        }

        if (!playlist) {
            throw new CustomErrors.NotFoundError('Playlist not found');
        }

        res.status(200).json({
            success: true,
            data: { playlist }
        });
    },

    updatePlaylist: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);
        const { title, description, isPublic } = createPlaylistSchema.parse(req.body);
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        const existingPlaylist = await prisma.playlist.findUnique({
            where: { id },
        });

        if (!existingPlaylist) {
            throw new CustomErrors.NotFoundError('Playlist not found');
        }

        if (existingPlaylist.userId !== userId && !isAdmin) {
            throw new CustomErrors.UnauthorizedError('You are not authorized to update this playlist');
        }

        const updatedPlaylist = await prisma.playlist.update({
            where: { id },
            data: { title, description, isPublic, ...(req.file && { coverUrl: req.file.path }) },
        });

        res.status(200).json({
            success: true,
            data: { playlist: updatedPlaylist }
        });
    },

    deletePlaylist: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        const existingPlaylist = await prisma.playlist.findUnique({
            where: { id },
        });

        if (!existingPlaylist) {
            throw new CustomErrors.NotFoundError('Playlist not found');
        }

        if (existingPlaylist.userId !== userId && !isAdmin) {
            throw new CustomErrors.UnauthorizedError('You are not authorized to delete this playlist');
        }

        await prisma.playlist.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Playlist deleted successfully'
        });
    },

    searchPlaylists: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        const [playlists, total] = await Promise.all([
            prisma.playlist.findMany({
                where: {
                    title: {
                        contains: q,
                        mode: 'insensitive',
                    },
                    OR: isAdmin
                        ? [] // admins can see all playlists
                        : [
                            { isPublic: true },
                            { userId: userId },
                        ],
                },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.playlist.count({
                where: {
                    title: {
                        contains: q,
                        mode: 'insensitive',
                    },
                    OR: isAdmin
                        ? []
                        : [
                            { isPublic: true },
                            { userId: userId },
                        ],
                },
            }),
        ]);


        res.status(200).json({
            success: true,
            data: { playlists },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    getAllPlaylists: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const userId = req.user?.id as string;
        const isAdmin = req.user?.role === 'admin';

        const [total, playlists] = await Promise.all([
            prisma.playlist.count({
                where: {
                    OR: isAdmin ? [] 
                    : [
                        { isPublic: true },
                        { userId: userId }, // private but owned by current user
                    ],
                },
            }),
            prisma.playlist.findMany({
                where: {
                    OR: isAdmin ? [] 
                    : [
                        { isPublic: true },
                        { userId: userId }, // private but owned by current user
                    ],
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: { playlists },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

}
