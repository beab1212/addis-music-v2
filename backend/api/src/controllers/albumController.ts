import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { createAlbumSchema } from "../validators/albumValidator";
import { uuidSchema, searchSchema, paginationSchema } from '../validators';
import { embeddingQueue } from "../jobs/audioQueue";
import { Album } from "@prisma/client";
import { searchAlbums } from "../prisma/vectorQueries";


const albumMetadata = async (album: Album) => {
    const artist = await prisma.artist.findUnique({ where: { id: album.artistId } });
    const genre = album.genreId ? await prisma.genre.findUnique({ where: { id: album.genreId } }) : null;

    return [
        `Title: ${album.title}`,
        `Artist: ${artist?.name}`,
        `Release Date: ${album.releaseDate}`,
        genre && `Genre: ${genre.name}`,
        album.description && `Description: ${album.description}`,
        album.credit && `Credit: ${album.credit}`
    ].filter(Boolean).join('\n')
}

export const albumController = {
    createAlbum: async (req: Request, res: Response) => {
        const { title, artistId, releaseDate, genreId, description, credit } = createAlbumSchema.parse(req.body);

        // Find artist and genre in parallel
        const [artist, genre] = await Promise.all([
            prisma.artist.findUnique({ where: { id: artistId } }),
            genreId ? prisma.genre.findUnique({ where: { id: genreId } }) : Promise.resolve(null),
        ]);

        if (!artist) throw new CustomErrors.NotFoundError('Artist not found');
        if (genreId && !genre) throw new CustomErrors.NotFoundError('Genre not found');

        const coverUrl = req.file?.path;

        const newAlbum = await prisma.album.create({
            data: {
                title,
                artistId,
                releaseDate,
                genreId,
                coverUrl,
                description,
                credit,
            },
        });

        const metadata = await albumMetadata(newAlbum);

        embeddingQueue.add('embedding', { 
            type: 'album',
            album_id: newAlbum.id,
            album_metadata: metadata,
        });

        res.status(201).json({ success: true, data: { album: newAlbum } });
    },
    
    getAlbumById: async (req: Request, res: Response) => {
        const albumId = uuidSchema.parse(req.params.id);

        const album = await prisma.album.findUnique({
            where: { id: albumId },
            include: { artist: true, genre: true },
        });

        if (!album) {
            throw new CustomErrors.NotFoundError('Album not found');
        }

        res.status(200).json({ success: true, data: { album } });
    },

    getAlbumTrack: async(req: Request, res: Response) => {
        const albumId = uuidSchema.parse(req.params.id);

        const tracks = await prisma.track.findMany({
            where: { albumId },
            include: { artist: true }
        })

        res.status(200).json({ success: true, data: { tracks } });
    },

    deleteAlbum: async (req: Request, res: Response) => {
        const albumId = uuidSchema.parse(req.params.id);

        const album = await prisma.album.findUnique({
            where: { id: albumId },
        });

        if (!album) {
            throw new CustomErrors.NotFoundError('Album not found');
        }

        await prisma.album.delete({
            where: { id: albumId },
        });

        res.status(200).json({ success: true, message: 'Album deleted successfully' });
    },

    updateAlbum: async (req: Request, res: Response) => {
        const albumId = uuidSchema.parse(req.params.id);
        const { title, artistId, releaseDate, genreId, description, credit } = createAlbumSchema.parse(req.body);

        // Find album and artist in parallel
        const [album, artist, genre] = await Promise.all([
            prisma.album.findUnique({ where: { id: albumId } }),
            prisma.artist.findUnique({ where: { id: artistId } }),
            genreId ? prisma.genre.findUnique({ where: { id: genreId } }) : Promise.resolve(null),
        ]);

        if (!album) throw new CustomErrors.NotFoundError('Album not found');
        if (!artist) throw new CustomErrors.NotFoundError('Artist not found');
        if (genreId && !genre) throw new CustomErrors.NotFoundError('Genre not found');

        // Only include coverUrl if a new image was uploaded 
        const updatedData: any = {
            title,
            artistId,
            releaseDate,
            genreId,
            description,
            credit,
            ...(req.file && { coverUrl: req.file.path }),
        };


        const updatedAlbum = await prisma.album.update({
            where: { id: albumId },
            data: updatedData,
        });

        const metadata = await albumMetadata(updatedAlbum);

        embeddingQueue.add('embedding', { 
            type: 'album',
            album_id: updatedAlbum.id,
            album_metadata: metadata,
        });

        res.status(200).json({ success: true, data: { album: updatedAlbum } });
    },

    getAllAlbums: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);

        const skip = (page - 1) * limit;

        const [albums, total] = await Promise.all([
            prisma.album.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { artist: true, genre: true },
            }),
            prisma.album.count(),
        ]);

        res.status(200).json({
            success: true,
            data: { albums },
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    },

    searchAlbums: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);

        const [albums, total] = await Promise.all([
            prisma.album.findMany({
                where: {
                    title: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
            }),
            prisma.album.count({
                where: {
                    title: {
                        contains: q,
                        mode: 'insensitive',
                    },
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: { albums },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    semanticSearchAlbums: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);

        const offset = (page - 1) * limit;

        const albums = await searchAlbums(q, limit, offset);

        res.status(200).json({
            success: true,
            data: { albums },
            // pagination: { page, limit, totalPages: Math.ceil(100 / limit) }
        });
    }
}
