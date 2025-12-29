import { Request, Response } from 'express';
import prisma from '../libs/db';
import { uuidSchema, searchSchema, paginationSchema } from '../validators';
import { getSimilarTracks, getTrendingNow, getNewAlbums, popularPlaylists, featuredArtists, getSimilarSoundingTracks, trackFromArtistYouFollow } from "../prisma/vectorQueries";
import { CustomErrors } from '../errors';
import { getCachedOrGenerateVectors } from '../utils/cache_vectors';

export const personalizationControl = {
    forYou: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        const similarTracks = await getSimilarTracks(
            userId as string,
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

    soundsYouMayLike: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const { user_audio_vector } = await getCachedOrGenerateVectors(userId as string, true);

        const recommendedTracks = await getSimilarSoundingTracks(
            user_audio_vector,
            limit,
            offset
        );

        return res.status(200).json({
            success: true,
            data: { tracks: recommendedTracks }
        });
    },

    trendingNow: async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        const trendingTracks = await getTrendingNow(user_meta_vector, user_audio_vector, 20);

        return res.status(200).json({
            success: true,
            data: { tracks: trendingTracks }
        });
    },

    featuredArtists: async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        const artists = await featuredArtists(user_meta_vector, user_audio_vector, 20);

        return res.status(200).json({
            success: true,
            data: { artists }
        });

    },

    popularPlaylists: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        
        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        const playlists = await popularPlaylists(user_meta_vector, user_audio_vector, 20);

        return res.status(200).json({
            success: true,
            data: { playlists }
        });
    },

    newAlbums: async (req: Request, res: Response) => {
        const userId = req.user?.id;

        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        const newAlbums = await getNewAlbums(user_meta_vector, user_audio_vector, 20);

        return res.status(200).json({
            success: true,
            data: { albums: newAlbums }
        });
    },

    tracksFromArtistYouFollow: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const { page, limit } = paginationSchema.parse(req.query);
        const offset = (page - 1) * limit;

        const { user_meta_vector, user_audio_vector } = await getCachedOrGenerateVectors(userId as string);

        const tracks = await trackFromArtistYouFollow(
            userId as string,
            user_meta_vector,
            user_audio_vector,
            limit,
        );
        return res.status(200).json({
            success: true,
            data: { tracks }
        });
    },
}
