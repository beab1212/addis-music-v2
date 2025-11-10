import { Request, Response } from 'express';
import { Genre } from '@prisma/client';
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { createGenreSchema } from '../validators/genreValidator';
import { uuidSchema } from '../validators';

export const genreController = {
    createGenre: async (req: Request, res: Response) => {
        console.log('Creating genre with data:', req.body);
        const { name } = createGenreSchema.parse(req.body);

        const existingGenre = await prisma.genre.findFirst({
            where: { 
                name: {
                    equals: name,
                    mode: 'insensitive',
                }
            },    
        });

        if (existingGenre) {
            throw new CustomErrors.ConflictError('Genre already exists');
        }

        const newGenre = await prisma.genre.create({
            data: {
                name
            },
        });

        res.status(201).json({ success: true, data: { genre: newGenre } });
    },

    getGenres: async (req: Request, res: Response) => {
        const genres = await prisma.genre.findMany();

        res.status(200).json({ success: true, data: { genres } });
    },

    getGenreById: async (req: Request, res: Response) => {
        const genreId = uuidSchema.parse(req.params.id);

        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        res.status(200).json({ success: true, data: { genre } });
    },

    updateGenre: async (req: Request, res: Response) => {
        const genreId = uuidSchema.parse(req.params.id);
        const { name } = createGenreSchema.parse(req.body);

        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        const updatedGenre = await prisma.genre.update({
            where: { id: genreId },
            data: { name: name ?? genre.name },
        });

        res.status(200).json({ success: true, data: { genre: updatedGenre } });
    },

    deleteGenre: async (req: Request, res: Response) => {
        const genreId = uuidSchema.parse(req.params.id);

        const genre = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        await prisma.genre.delete({
            where: { id: genreId },
        });

        res.status(200).json({ success: true, message: 'Genre deleted successfully' });
    },
}