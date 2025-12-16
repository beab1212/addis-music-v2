import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { createArtistSchema } from "../validators/artistValidator";
import { uuidSchema, searchSchema, paginationSchema } from '../validators';
import { embeddingQueue } from "../jobs/audioQueue";
import { Artist } from "@prisma/client";
import { searchArtists } from "../prisma/vectorQueries";
import { get } from "http";

const artistMetadata = async (artist: Artist) => {
    return [
        `Name: ${artist.name}`,
        artist.bio && `Bio: ${artist.bio}`,
        `Verified: ${artist.isVerified ? 'Yes' : 'No'}`,
        artist.genres.length > 0 && `Genres: ${artist.genres.join(', ')}`
    ].filter(Boolean).join('\n')
}

export const artistController = {
    createArtist: async (req: Request, res: Response) => {
        const { name, bio, isVerified, genres } = createArtistSchema.parse(req.body);

        // req.file will contain Cloudinary info after upload
        const imageUrl = req.file?.path;

        const newArtist = await prisma.artist.create({
            data: {
                name,
                bio,
                isVerified: isVerified || false,
                imageUrl,
                genres: [...new Set(genres)],
            },
        });

        const metadata = await artistMetadata(newArtist);

        embeddingQueue.add('embedding', { 
            type: 'artist',
            artist_id: newArtist.id,
            artist_metadata: metadata,
        });

        res.status(201).json({ success: true, data: { artist: newArtist } });
    },

    getArtistById: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.id);

        // add followers count
        const [artist, followersCount] = await Promise.all([
            prisma.artist.findUnique({
                where: { id: artistId },
            }),
            prisma.artistFollow.count({
                where: { artistId },
            }),
        ]);

        if (!artist) {
            throw new CustomErrors.NotFoundError('Artist not found');
        }

        (artist as any).followersCount = followersCount;

        res.status(200).json({ success: true, data: { artist } });
    },

    updateArtist: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.id);
        const { name, bio, isVerified } = createArtistSchema.parse(req.body);

        const updatedData: any = { name, bio, isVerified };

        const existingArtist = await prisma.artist.findUnique({
            where: { id: artistId },
        });

        if (!existingArtist) {
            throw new CustomErrors.NotFoundError('Artist not found');
        }

        // Only include imageUrl if a new image was uploaded 
        if (req.file) {
            updatedData.imageUrl = req.file.path;
        }

        const updatedArtist = await prisma.artist.update({
            where: { id: artistId },
            data: updatedData,
        });

        const metadata = await artistMetadata(updatedArtist);

        embeddingQueue.add('embedding', { 
            type: 'artist',
            artist_id: updatedArtist.id,
            artist_metadata: metadata,
        });

        res.status(200).json({ success: true, data: { artist: updatedArtist } });
    },

    deleteArtist: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.id);

        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
        });

        if (!artist) {
            throw new CustomErrors.NotFoundError('Artist not found');
        }

        await prisma.artist.delete({
            where: { id: artistId },
        });

        res.status(200).json({ success: true, message: 'Artist deleted successfully' });
    },

    getAllArtists: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const [total, artists] = await Promise.all([
            prisma.artist.count(),
            prisma.artist.findMany({ skip: offset, take: limit }),
        ]);

        res.status(200).json({ 
            success: true,
            data: { artists },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    getArtistTracks: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const artistId = uuidSchema.parse(req.params.id);

        const [total, tracks] = await Promise.all([
            prisma.track.count({ where: { artistId } }),
            prisma.track.findMany({
                where: { artistId },
                skip: offset,
                take: limit,
                include: {
                    artist: true,
                    album: true,
                    genre: true,
                },
            }),
        ]);

        // add playCount to each track
        for (const track of tracks) {
            const playCount = await prisma.playHistory.count({
                where: { trackId: track.id },
            });
            (track as any).playCount = playCount;
        }

        res.status(200).json({
            success: true,
            data: { tracks },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    getArtistAlbums: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const artistId = uuidSchema.parse(req.params.id);

        const [total, albums] = await Promise.all([
            prisma.album.count({ where: { artistId } }),
            prisma.album.findMany({
                where: { artistId },
                skip: offset,
                take: limit,
                include: {
                    artist: true,
                    genre: true,
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: { albums },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    searchArtists: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);   
        const offset = (page - 1) * limit;

        const [artists, total] = await Promise.all([
            prisma.artist.findMany({
                where: {
                    name: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
                skip: offset,
                take: limit,
            }),
            prisma.artist.count({
                where: {
                    name: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: { artists },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    semanticSearchArtists: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);

        const offset = (page - 1) * limit;

        const artists = await searchArtists(q, limit, offset);

        res.status(200).json({
            success: true,
            data: { artists },
            // pagination: { page, limit, totalPages: Math.ceil(100 / limit) } // TODO: fix total count
        });
    }
};
