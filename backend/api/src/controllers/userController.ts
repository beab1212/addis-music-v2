import type { Request, Response } from 'express';
import prisma from '../libs/db';
import { success } from 'better-auth/*';

export const userController = {
    getUser: async (req: Request, res: Response) => {
        try {
            const userId = req.params.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    },
    getMe: async (req: Request, res: Response) => {
        try {   
            console.log("Current Session User: ", req.user);     
            const userId = req.user?.id;
            console.log("Current Session User: ", req.user);

            if (!userId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({ success: true, data: { user } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Internal server error', error });
        }
    },
}