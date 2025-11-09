import type { Request, Response } from 'express';
import { CustomErrors } from '../errors';
import prisma from '../libs/db';

export const userController = {
    getUser: async (req: Request, res: Response) => {
        const userId = req.params.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new CustomErrors.NotFoundError('User not found');
        }

        res.status(200).json({ success: true, data: { user } });
    },
    getMe: async (req: Request, res: Response) => {        
        const userId = req.user?.id;

        if (!userId) {
            throw new CustomErrors.UnauthenticatedError('Unauthorized');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new CustomErrors.NotFoundError('User not found');
        }

        res.status(200).json({ success: true, data: { user } });
    },
}