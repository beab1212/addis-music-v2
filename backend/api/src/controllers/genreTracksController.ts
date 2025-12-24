import { Request, Response } from 'express';
import { v4 as uuidv4 } from "uuid";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uuidSchema, searchSchema, paginationSchema } from '../validators';
import { get } from 'http';

export const genreTracksController = {
    getGenreTracks: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const total = (page - 1) * limit;

        const genreId = uuidSchema.parse(req.params.genreId);

        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        const tracks = await prisma.track.findMany({
            where: { genreId: genre.id },
            include: { artist: true },
            skip: total,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: { tracks },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    getGenreInfo: async (req: Request, res: Response) => {
        const genreId = uuidSchema.parse(req.params.genreId);

        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        // get total tracks in this genre
        const totalTracks = await prisma.track.count({
            where: { genreId: genre.id },
        });

        // get art image for this genre (from any track in this genre)
        const trackWithArt = await prisma.track.findFirst({
            where: {
                genreId: genre.id,
                coverUrl: { not: null },
            },
            orderBy: { createdAt: 'desc' },
        });

        const coverUrl = trackWithArt ? trackWithArt.coverUrl : null;

        res.status(200).json({
            success: true,
            data: {
                genre: {
                    id: genre.id,
                    name: genre.name,
                    coverUrl,
                    totalTracks,
                }
            }
        });
    },

    getAllGenresWithTrackCounts: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const total = (page - 1) * limit;

        const totalGenres = await prisma.genre.count();

        const genres = await prisma.genre.findMany({
            orderBy: { name: 'asc' },
            skip: total,
            take: limit,
        });

        const genresWithCounts = await Promise.all(genres.map(async (genre) => {
            const [trackCount, trackWithArt] = await Promise.all([
                prisma.track.count({
                    where: { genreId: genre.id },
                }),
                prisma.track.findFirst({
                    where: {
                        genreId: genre.id,
                        coverUrl: { not: null },
                    },
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            return {
                id: genre.id,
                name: genre.name,
                trackCount,
                coverUrl: trackWithArt ? trackWithArt.coverUrl : null,
                totalTracks: trackCount,
            };
        }));

        res.status(200).json({
            success: true,
            data: { genres: genresWithCounts },
            pagination: { page, limit, totalPages: Math.ceil(totalGenres / limit) }
        });
    },

    getGenreTopTracks: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const skip = (page - 1) * limit;

        const genreId = uuidSchema.parse(req.params.genreId);

        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        // Get top tracks with pagination applied
        const plays = await prisma.playHistory.groupBy({
            by: ['trackId'],
            where: {
                track: { genreId: genre.id },
            },
            _count: { _all: true },
            orderBy: {
                _count: { trackId: 'desc' },
            },
            skip,
            take: limit,
        });

        const trackIds = plays.map(p => p.trackId);

        // Fetch track details
        const tracks = await prisma.track.findMany({
            where: {
                id: { in: trackIds },
            },
        });

        // Preserve order + attach playCount
        const topTracks = plays
            .map(p => {
                const track = tracks.find(t => t.id === p.trackId);
                if (!track) return null;

                return {
                    ...track,
                    playCount: p._count._all,
                };
            })
            .filter(Boolean);

        res.status(200).json({
            success: true,
            data: {
                tracks: topTracks,
                pagination: { page, limit, totalPages: Math.ceil(plays.length / limit)}

            },
        });
    }

}