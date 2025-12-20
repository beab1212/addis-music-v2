import { Request, Response } from 'express';
import  { v4 as uuidv4 } from "uuid";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uploadTrackSchema } from '../validators/trackValidator';
import { uuidSchema, searchSchema, paginationSchema } from '../validators';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../libs/cloudinary';
import { uploadAudioToS3, deleteAudioFromS3 } from '../libs/s3Client';
import { addTrackToMeiliIndex } from '../libs/meili';
import { embeddingQueue } from '../jobs/audioQueue';
import { searchTracks } from '../prisma/vectorQueries';


export const trackController = {
    uploadTrack: async (req: Request, res: Response) => {
        const { title, artistId, albumId, genreId, tags, releaseDate, description, credit } = uploadTrackSchema.parse(req.body);

        // Perform a batch query for artist, album, and genre at once
        const [existingArtist, existingAlbum, existingGenre] = await Promise.all([
            prisma.artist.findFirst({ where: { id: artistId } }),
            albumId ? prisma.album.findFirst({ where: { id: albumId } }) : null,
            genreId ? prisma.genre.findFirst({ where: { id: genreId } }) : null,
        ]);

        if (!existingArtist) {
            throw new CustomErrors.NotFoundError('Artist not found');
        }

        if (albumId && !existingAlbum) {
            throw new CustomErrors.NotFoundError('Album not found');
        }

        if (genreId && !existingGenre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        let audioPath: string | null = null;
        let coverPath: string | null = null;

        // check if audio file is present
        if (!req.files || !(req.files as any).audio) {
            throw new CustomErrors.BadRequestError('Audio file is required');
        }


        const audioId = uuidv4();

        audioPath = (req.files as any).audio[0].path;

        console.log("Audio info: ", (req.files as any).audio);
        
        
        // upload to s3 bucket
        audioPath = await uploadAudioToS3(audioPath as string, audioId, (req.files as any).audio[0].mimetype);

        // check if cover image exists
        if ((req.files as any).cover) {
            coverPath = (req.files as any).cover[0].path;
            coverPath = await uploadImageToCloudinary(coverPath as string);
        }

        // Create the track record
        const newTrack = await prisma.track.create({
            data: {
                id: audioId,
                title,
                audioUrl: audioPath!,
                coverUrl: coverPath || undefined,
                artistId,
                albumId: albumId || undefined,
                genreId: genreId || undefined,
                tags: tags || [],
                durationSec: 0,
                releaseDate: releaseDate ? releaseDate : undefined,
                description: description || undefined,
                credit: credit || undefined,
            },
        });

        // add to Meilisearch index
        // addTrackToMeiliIndex(newTrack.id);

        // TODO: queue sonic, metadata embedding and LUFS tasks with
        embeddingQueue.add('embedding', { type: 'track_audio', track_id: newTrack.id });
        embeddingQueue.add('embedding', { type: 'track', track_id: newTrack.id });

        // Return the response
        res.status(201).json({
            message: 'Track uploaded successfully',
            track: newTrack
        });
    },
    
    getTrackById: async (req: Request, res: Response) => {
        const trackId  = uuidSchema.parse(req.params.id);
        
        const track = await prisma.track.findUnique({
            where: { id: trackId },
            include: {
                artist: true,
                album: true,
                genre: true,
            },
        });

        if (!track) {
            throw new CustomErrors.NotFoundError('Track not found');
        }

        res.status(200).json({
            success: true,
            data: { track }
        });
    },

    getAllTracks: async (req: Request, res: Response) => {
        const { page, limit } = paginationSchema.parse(req.query);
        const skip = (page - 1) * limit;
        const [tracks, total] = await Promise.all([
            prisma.track.findMany({
                skip,
                take: limit,
                include: {
                    artist: true,
                    album: true,
                    genre: true,
                },
            }),
            prisma.track.count(),
        ]);

        res.status(200).json({
            success: true,
            data: { tracks },
            pagination: { page, limit, totalPages: Math.ceil(total / limit) }
        });
    },

    updateTrackDetails: async (req: Request, res: Response) => {
        const id = uuidSchema.parse(req.params.id);
        const { title, artistId, albumId, genreId, tags, releaseDate, description, credit } = uploadTrackSchema.parse(req.body);

        const existingTrack = await prisma.track.findUnique({
            where: { id: id },
        });

        if (!existingTrack) {
            throw new CustomErrors.NotFoundError('Track not found');
        }

        const [existingArtist, existingAlbum, existingGenre] = await Promise.all([
            prisma.artist.findFirst({ where: { id: artistId } }),
            albumId ? prisma.album.findFirst({ where: { id: albumId } }) : null,
            genreId ? prisma.genre.findFirst({ where: { id: genreId } }) : null,
        ]);

        if (!existingArtist) {
            throw new CustomErrors.NotFoundError('Artist not found');
        }

        if (albumId && !existingAlbum) {
            throw new CustomErrors.NotFoundError('Album not found');
        }

        if (genreId && !existingGenre) {
            throw new CustomErrors.NotFoundError('Genre not found');
        }

        const updatedTrack = await prisma.track.update({
            where: { id: id },
            data: {
                title,
                albumId: albumId || undefined,
                genreId: genreId || undefined,
                tags: tags || [],
                releaseDate: releaseDate ? releaseDate : undefined,
                description: description || undefined,
                credit: credit || undefined,
            },
        });

        await embeddingQueue.add('embedding', { type: 'track', track_id: updatedTrack.id });

        res.status(200).json({
            success: true,
            data: { track: updatedTrack }
        });
    },

    updateTrackCover: async (req: Request, res: Response) => {
        // const trackId = uuidSchema.parse(req.params.id);

        // const existingTrack = await prisma.track.findUnique({
        //     where: { id: trackId },
        // });

        // if (!existingTrack) {
        //     throw new CustomErrors.NotFoundError('Track not found');
        // }

        // if (!req.file) {
        //     throw new CustomErrors.BadRequestError('Cover image file is required');
        // }

        // const coverPath = await uploadImageToCloudinary(req.file.path);

        // const updatedTrack = await prisma.track.update({
        //     where: { id: trackId },
        //     data: {
        //         coverUrl: coverPath,
        //     },
        // });

        // res.status(200).json({
        //     success: true,
        //     data: { track: updatedTrack }
        // });

        res.status(501).json({
            success: false,
            message: 'Not implemented'
        });
    },

    deleteTrack: async (req: Request, res: Response) => {
        const trackId = uuidSchema.parse(req.params.id);

        const existingTrack = await prisma.track.findUnique({
            where: { id: trackId },
        });

        if (!existingTrack) {
            throw new CustomErrors.NotFoundError('Track not found');
        }

        await prisma.playHistory.deleteMany({
            where: { trackId: trackId },
        });
        
        await prisma.playlistItem.deleteMany({
            where: { trackId: trackId },
        });

        await prisma.trackLike.deleteMany({
            where: { trackId: trackId },
        });

        await prisma.track.delete({
            where: { id: trackId },
        });

        await deleteAudioFromS3(`music/${trackId}`);
        
        if (existingTrack.coverUrl) {
            await deleteImageFromCloudinary(existingTrack.coverUrl);
        }

        // TODO: remove from Meilisearch index and hls segments

        res.status(200).json({
            success: true,
            message: 'Track deleted successfully'
        });
    },

    searchTracks: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);   
        const offset = (page - 1) * limit;

        // make the searchability more advanced later

        const [tracks, total] = await Promise.all([
            prisma.track.findMany({
                where: {
                    title: { contains: q, mode: 'insensitive' },
                },
                skip: offset,
                take: limit,
                include: {
                    artist: true,
                    album: true,
                    genre: true,
                },
            }),
            prisma.track.count({
                where: {
                    title: { contains: q, mode: 'insensitive' },
                },
            }),
        ]);

        res.status(200).json({ 
            success: true,
            data: { tracks },
            pagination: { page, limit, totalPages: Math.ceil(100 / limit) }
        });
    },

    semanticSearchTracks: async (req: Request, res: Response) => {
        const { q, page, limit } = searchSchema.parse(req.query);   
        const offset = (page - 1) * limit;

        const tracks = await searchTracks(q, limit, offset);

        res.status(200).json({ 
            success: true,
            data: { tracks },
            // pagination: { page, limit, totalPages: Math.ceil(100 / limit) }
        });
    },
}