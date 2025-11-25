import { Request, Response } from 'express';
import  { v4 as uuidv4 } from "uuid";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uploadTrackSchema } from '../validators/trackValidator';
import { uploadImageToCloudinary } from '../libs/cloudinary';
import { uploadAudioToS3 } from '../libs/s3Client';
import { addTrackToMeiliIndex } from '../libs/meili';
import { metadataEmbeddingQueue, sonicEmbeddingQueue } from '../jobs/audioQueue';


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
        addTrackToMeiliIndex(newTrack.id);

        // TODO: queue sonic, metadata embedding and LUFS tasks with
        await metadataEmbeddingQueue.add('metadata-embedding', { trackId: newTrack.id });
        await sonicEmbeddingQueue.add('sonic-embedding', { trackId: newTrack.id });


        // Return the response
        res.status(201).json({
            message: 'Track uploaded successfully',
            track: newTrack
        });
    }
}