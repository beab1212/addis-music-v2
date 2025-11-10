import { Request, Response } from 'express';
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { createTagSchema } from '../validators/tagValidator';
import { uuidSchema } from '../validators';


export const tagController = {
    createTag: async (req: Request, res: Response) => {
        const { name } = createTagSchema.parse(req.body);

        const existingTag = await prisma.tag.findFirst({
            where: { 
                name: {
                    equals: name,
                    mode: 'insensitive',
                }
            },
        });

        if (existingTag) {
            throw new CustomErrors.ConflictError('Tag with this name already exists');
        }

        const newTag = await prisma.tag.create({
            data: { name },
        });

        res.status(201).json({
            success: true,
            message: 'Tag created successfully',
            data: { tag: newTag },
        });
    },

    getAllTags: async (req: Request, res: Response) => {
        const tags = await prisma.tag.findMany();
        res.status(200).json({
            success: true,
            data: { tags },
        });
    },

    getTagById: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);
        const tag = await prisma.tag.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new CustomErrors.NotFoundError('Tag not found');
        }

        res.status(200).json({
            success: true,
            data: { tag },
        });
    },

    updateTag: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);
        const { name } = createTagSchema.parse(req.body);

        const tag = await prisma.tag.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new CustomErrors.NotFoundError('Tag not found');
        }

        const updatedTag = await prisma.tag.update({
            where: { id },
            data: { name },
        });

        res.status(200).json({
            success: true,
            message: 'Tag updated successfully',
            data: { tag: updatedTag },
        });
    },

    deleteTag: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);

        const tag = await prisma.tag.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new CustomErrors.NotFoundError('Tag not found');
        }

        await prisma.tag.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Tag deleted successfully',
        });
    },
}