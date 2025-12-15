import { Request, Response } from 'express';
import prisma from '../libs/db';
import { uuidSchema, searchSchema, paginationSchema } from '../validators';
import { getSimilarTracks } from "../prisma/vectorQueries";
import { CustomErrors } from '../errors';
import { getCachedOrGenerateVectors } from '../utils/cache_vectors';

export const personalizationControl = {
    forYou: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        const similarTracks = await getSimilarTracks(
            user_meta_vector,
            user_audio_vector,
            limit,
            offset
        );

        return res.status(200).json({
            success: true,
            data: { tracks: similarTracks }
        });
    },

    trendingNow: async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        // if user has no vectors(history)
        if (user_meta_vector.length === 0 || user_audio_vector.length === 0) {
            // return latest tracks as fallback
            const latestTracks = await prisma.track.findMany({
                orderBy: { createdAt: 'desc' },
                take: 20,
            });

            return res.status(200).json({
                success: true,
                data: { tracks: latestTracks }
            });
        }

        const tradingTracks = await getSimilarTracks(user_meta_vector, user_audio_vector, 20);

        console.log("Trading Tracks: ", tradingTracks);

        return res.status(200).json({
            success: true,
            data: { tracks: tradingTracks }
        });
    },

    featuredArtists: async (req: Request, res: Response) => {
        
    },

    popularPlaylists: async (req: Request, res: Response) => {
        
    },

    newAlbums: async (req: Request, res: Response) => {
        
    }

}
