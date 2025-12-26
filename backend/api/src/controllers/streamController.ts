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



// Helper to build M3U8 content from playlist
const buildM3U8Content = async (playlist: string[]) => {
    let m3u8Content = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n';

    playlist.forEach((segmentUrl) => {
        m3u8Content += `#EXTINF:10.0,\n${segmentUrl}\n`;
    });

    m3u8Content += '#EXT-X-ENDLIST\n';
    return m3u8Content;
};

const setPlayHistory = async (userId: string, trackId: string) => {
    const history = await prisma.playHistory.findFirst({
        where: {
            userId: userId,
            trackId: trackId
        },
    });

    if (!history) {
        await prisma.playHistory.create({
            data: {
                userId: userId,
                trackId: trackId,
                playedAt: new Date()
            }
        });
    } else {
        await prisma.playHistory.update({
            where: {
                id: history.id
            },
            data: {
                playedAt: new Date()
            }
        });
    }
}


export const streamController = {
    // mainStreamx: async (req: Request, res: Response) => {
    //     const userId = req.user?.id;
    //     const audioId = uuidSchema.parse(req.params?.audioId || "");

    //     // get subscription plan
    //     let subscriptionLevel = "FREE";
    //     if ((req.user as any)?.subscription) {
    //         if ((req.user as any).subscription.status !== "ACTIVE") {
    //             subscriptionLevel = "FREE";
    //         } else {
    //             subscriptionLevel = (req.user as any).subscription.plan || "FREE";
    //         }
    //     }

    //     // check if the song exists
    //     const track = await prisma.track.findUnique({
    //         where: {
    //             id: audioId
    //         }
    //     })

    //     if (!track) {
    //         throw new CustomErrors.NotFoundError("Requested song doesn't exist.");
    //     }

    //     const baseAudioSegments = await getPlaylistFromCacheOrGenerate(track.id, false);

    //     if (!baseAudioSegments || baseAudioSegments.length === 0) {
    //         throw new CustomErrors.NotFoundError("Audio segments not found for the requested song.");
    //     }


    //     // for free users, get ad audio segment
    //     let addAudioSegment: string[] = [];

    //     console.log("Subscription Level:", subscriptionLevel);



    //     if (subscriptionLevel !== "FREE") {
    //         // add selection must be dynamic based on various factors 
    //         addAudioSegment = await getPlaylistFromCacheOrGenerate("552e0a29-571e-4c0d-b29a-cfcf46358501", true);
    //         console.log("Ad Audio Segment:", addAudioSegment);
    //     }

    //     // generate playlist with ads if any
    //     const playlist = await generatePlaylist(baseAudioSegments, addAudioSegment);

    //     console.log("Merged Ads Segments: ", addAudioSegment);
    //     console.log("Base Audio Segments: ", baseAudioSegments);
    //     console.log("Final Playlist Segments: ", playlist);


    //     // build m3u8 content
    //     const m3u8Content = await buildM3U8Content(playlist);

    //     // TODO: use advanced playHistory latter
    //     setPlayHistory(userId!, track.id);

    //     // Return the playlist content to the client
    //     res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
    //     res.send(m3u8Content);
    // },

    mainStream: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const audioId = uuidSchema.parse(req.params?.audioId || "");

        // check if the track exists
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
            throw new CustomErrors.NotFoundError("Audio segments not found for the requested track.");
        }


        // build m3u8 content
        const m3u8Content = await buildM3U8Content(baseAudioSegments);

        // TODO: use advanced playHistory latter
        setPlayHistory(userId!, track.id);

        // Return the playlist content to the client
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
        res.send(m3u8Content);
    },

    addStream: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const audioId = uuidSchema.parse(req.params?.audioId || "");

        // check if the ad exists
        const ad = await prisma.advertisement.findUnique({
            where: {
                id: audioId,
                active: true
            },
            include: {
                tracks: true
            }
        })

        if (!ad) {
            throw new CustomErrors.NotFoundError("Requested advertisement doesn't exist.");
        }

        const adAudioSegments = await getPlaylistFromCacheOrGenerate(ad.tracks[0].id, true);

        if (!adAudioSegments || adAudioSegments.length === 0) {
            throw new CustomErrors.NotFoundError("Audio segments not found for the requested advertisement.");
        }

        // build m3u8 content
        const m3u8Content = await buildM3U8Content(adAudioSegments);

        // create add impression
        await prisma.adImpression.create({
            data: {
                adId: audioId,
                userId
            }
        })

        // Return the playlist content to the client
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
        res.send(m3u8Content);
    },


    stream: async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const audioId = uuidSchema.parse(req.params?.audioId || "");

        const track = await prisma.track.findUnique({ where: { id: audioId } });

        if (!track) throw new CustomErrors.NotFoundError("Song not found");

        let subscriptionLevel = "FREE";

        if ((req.user as any)?.subscription?.status === "ACTIVE") {
            subscriptionLevel = (req.user as any).subscription.plan || "FREE";
        }

        const isPremium = subscriptionLevel !== "FREE";

        // Cache or serve the main M3U8 somewhere, or generate signed URL to a virtual endpoint
        const mainStreamUrl = `http://localhost:5000/stream/${track.id}/master.m3u8`;

        let adStreamUrl: string | null = null;
        let advertisement: any = null;
        if (!isPremium) {
            // TODO: Select ad based on various factors

            // for now, randomly select the first ad
            const ads = await prisma.advertisement.findMany({
                where: { active: true },
            });
            if (ads.length === 0) {
                advertisement = null;
            } else {
                const idx = Math.floor(Math.random() * ads.length);
                advertisement = ads[idx];
            }

            adStreamUrl = advertisement ? `http://localhost:5000/stream/${advertisement.id}/ads/ad.m3u8` : null;
        }

        // Return metadata for the frontend player
        res.json({
            success: true,
            data: {
                mainStreamUrl,
                adStreamUrl,
                advertisement,
                adIntervalSeconds: 120,
                isPremium
            }
        });
    }
};

