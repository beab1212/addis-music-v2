import type { Request, Response } from 'express';
import { CustomErrors } from '../errors';
import prisma from '../libs/db';
import { embeddingQueue } from "../jobs/audioQueue";
import { updateUserProfileSchema, updateUserPreferencesSchema } from '../validators/userValidator';

const userPreferenceMetadata = async (userId: string) => {
    const userProfile = await prisma.userPreference.findUnique({
        where: { userId: userId },
    });

    return `${userProfile?.favoriteArtists?.join(', ')} ${userProfile?.favoriteGenres?.join(', ')} ${userProfile?.moodPreference} ${userProfile?.language}`;
}

export const userController = {
    getUser: async (req: Request, res: Response) => {
        const userId = req.params.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        const userProfile = await prisma.userProfile.findUnique({
            where: { userId: userId },
        });

        if (!user) {
            throw new CustomErrors.NotFoundError('User not found');
        }

        res.status(200).json({ success: true, data: { user, userProfile } });
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

        const userProfile = await prisma.userProfile.findUnique({
            where: { userId: userId },
        });

        res.status(200).json({ success: true, data: { user, userProfile } });
    },

    updateUserProfile: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { firstName, lastName, displayName, bio, country } = updateUserProfileSchema.parse(req.body);

        if (!userId) {
            throw new CustomErrors.UnauthenticatedError('Unauthorized');
        }

        const existingProfile = await prisma.userProfile.findUnique({
            where: { userId: userId },
        });

        let updatedProfile;
        if (existingProfile) {
            updatedProfile = await prisma.userProfile.update({
                where: { userId: userId },
                data: { firstName, lastName, displayName, bio, country },
            });
        } else {
            updatedProfile = await prisma.userProfile.create({
                data: { userId, firstName, lastName, displayName, bio, country },
            });
        }

        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            data: { userProfile: updatedProfile }
        });
    },

    getUserPreferences: async (req: Request, res: Response) => {
        const userId = req.user?.id;


        const userPreferences = await prisma.userPreference.findUnique({
            where: { userId: userId },
        });

        res.status(200).json({ success: true, data: { userPreferences } });
    },

    updateUserPreferences: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { favoriteArtists , moodPreference, favoriteGenres, language } = updateUserPreferencesSchema.parse(req.body);
        
        if (!userId) {
            throw new CustomErrors.UnauthenticatedError('Unauthorized');
        }

        const existingPreferences = await prisma.userPreference.findUnique({
            where: { userId: userId },
        });
        let updatedPreferences;
        if (existingPreferences) {
            updatedPreferences = await prisma.userPreference.update({
                where: { userId: userId },
                data: { favoriteArtists, moodPreference, favoriteGenres, language },
            });
        } else {
            updatedPreferences = await prisma.userPreference.create({
                data: { userId, favoriteArtists, moodPreference, favoriteGenres, language },
            });
        }

        const userPrefMetadata = await userPreferenceMetadata(userId);

        // Enqueue a job to update embeddings based on new preferences
        embeddingQueue.add('embedding', { 
            type: 'user_pref',
            user_id: userId,
            user_metadata: userPrefMetadata,
        });

        res.status(200).json({
            success: true,
            message: 'User preferences updated successfully',
            data: { userPreferences: updatedPreferences }
        });
    }
}