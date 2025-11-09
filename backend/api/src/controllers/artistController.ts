import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { createArtistSchema } from "../validators/artistValidator";
import { uuidSchema, searchSchema, paginationSchema } from '../validators';

export const artistController = {
    createArtist: async (req: Request, res: Response) => {
        const { name, bio } = createArtistSchema.parse(req.body);

        // req.file will contain Cloudinary info after upload
        const imageUrl = req.file?.path;

        const newArtist = await prisma.artist.create({
            data: {
                name,
                bio,
                imageUrl
            },
        });

        res.status(201).json({ success: true, data: { artist: newArtist } });
    },

    getArtistById: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.id);

        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
        });

        if (!artist) {
            throw new CustomErrors.NotFoundError('Artist not found');
        }

        res.status(200).json({ success: true, data: { artist } });
    },

    updateArtist: async (req: Request, res: Response) => {
        const artistId = uuidSchema.parse(req.params.id);
        const { name, bio } = createArtistSchema.parse(req.body);

        const updatedData: any = { name, bio };

        // If a new image is uploaded, update the imageUrl
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

        await prisma.artist.delete({
            where: { id: artistId },
        });

        res.status(200).json({ success: true, message: 'Artist deleted successfully' });
    },

    getAllArtists: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const artists = await prisma.artist.findMany({
            skip: offset,
            take: limit,
        });

        res.status(200).json({ success: true, data: { artists } });
    },

    searchArtists: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);   
        const offset = (page - 1) * limit;

        const artists = await prisma.artist.findMany({
            where: {
                name: {
                    contains: q,
                    mode: 'insensitive',
                },
            },
            skip: offset,
            take: limit,
        });

        res.status(200).json({ success: true, data: { artists } });
    },
};
