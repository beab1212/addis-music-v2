import { Request, Response } from "express";
import prisma from '../libs/db';
import { CustomErrors } from '../errors';
import { uuidSchema } from "../validators";
import { redisClient } from "../libs/redis";
import { generateSignedUrl } from "../utils/generateSignedUrl";


const getPlaylistFromCacheOrGenerate = async (audioId: string, isAdd: boolean = false) => {
    
    const cacheKey = `playlist:${audioId}`;

    // Try to get the playlist from Redis
    const cachedPlaylist = await new Promise((resolve, reject) => {
        redisClient.get(cacheKey, (err, result) => {
            if (err) reject(err);
            resolve(result ? JSON.parse(result) : null);
        });
    });

    if (cachedPlaylist) {
        return cachedPlaylist;
    }

    // If not found in cache, generate a new playlist
    const newPlaylist = await generateSignedUrl(audioId, isAdd, 1200); // Generate signed URL with 20 minutes expiration

    // Cache the playlist in Redis for performance 19 minutes
    // cache minutes must be less than signed url expiration time
    redisClient.setex(cacheKey, 1140, JSON.stringify(newPlaylist)); // Cache for 19 minutes

    return newPlaylist;
};



const generatePlaylist = async (baseAudioSegments: any[], addAudioSegment: any) => {
    const playlist: any[] = [];

    if (!addAudioSegment) {
        return baseAudioSegments;
    }

    // Insert ad after every 12 base segments which equals to 2 minutes of audio
    const AD_INTERVAL = 12

    for (let i = 0; i < baseAudioSegments.length; i++) {
        playlist.push(baseAudioSegments[i]);

        // Insert ad after every AD_INTERVAL segments
        if ((i + 1) % AD_INTERVAL === 0) {
            playlist.push(addAudioSegment);
        }
    }

    return playlist;
};


// Helper to build M3U8 content from playlist
const buildM3U8Content = async (playlist: string[]) => {
    let m3u8Content = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n';

    playlist.forEach((segmentUrl) => {
        m3u8Content += `#EXTINF:10.0,\n${segmentUrl}\n`;
    });

    m3u8Content += '#EXT-X-ENDLIST\n';
    return m3u8Content;
};


export const streamController = {
    stream: async(req: Request, res: Response) => {
        const audioId = uuidSchema.parse(req.params?.audioId || "");

        // get subscription plan
        const subscriptionLevel = "free"; // This should be fetched from the user's session or token

        // check if the song exists
        const track = await prisma.track.findUnique({
            where: {
                id: audioId
            }
        })

        if (!track) {
            throw new CustomErrors.NotFoundError("Requested song doesn't exist.");
        }

        const baseAudioSegments = await getPlaylistFromCacheOrGenerate(track.id, false);

        if (!baseAudioSegments || baseAudioSegments.length === 0) {
            throw new CustomErrors.NotFoundError("Audio segments not found for the requested song.");
        }


        // for free users, get ad audio segment
        let addAudioSegment: string[] = [];
        if (subscriptionLevel === "free") {
            // add selection must be dynamic based on various factors
            // addAudioSegment = await getPlaylistFromCacheOrGenerate("ad-audio-segment-id", true);
        }

        // generate playlist with ads if any
        const playlist = await generatePlaylist(baseAudioSegments, addAudioSegment);

        // build m3u8 content
        const m3u8Content = await buildM3U8Content(playlist);

        console.log("Build m3u8Content: ", m3u8Content);
        

        // Return the playlist content to the client
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
        res.send(m3u8Content);
    }
};


