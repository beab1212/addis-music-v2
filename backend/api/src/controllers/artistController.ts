import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { createArtistSchema } from "../validators/artistValidator";
import { uuidSchema, searchSchema, paginationSchema } from '../validators';

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
        const { name, bio } = createArtistSchema.parse(req.body);

        const updatedData: any = { name, bio };

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
};
