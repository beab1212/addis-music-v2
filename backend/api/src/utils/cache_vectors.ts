import { redisClient } from "../libs/redis";
import { personalizationQueue, personalizationQueueEvents } from '../jobs/audioQueue';
import { CustomErrors } from '../errors';

export const getCachedVectors = async (userId: string): Promise<{ user_meta_vector: number[]; user_audio_vector: number[] } | null> => {
    const cacheKey = `user_vectors:${userId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        try {
            const parsedData = JSON.parse(cachedData);
            return {
                user_meta_vector: parsedData.user_meta_vector,
                user_audio_vector: parsedData.user_audio_vector,
            };
        } catch (error) {
            console.error("Error parsing cached vectors:", error);
            return null;
        }
    }

    return null;
}


export const getCachedOrGenerateVectors = async (userId: string): Promise<{ user_meta_vector: number[]; user_audio_vector: number[] }> => {
    const cachedVectors = await getCachedVectors(userId);
    if (cachedVectors) {
        console.log("Fetched vectors from cache.");
        return cachedVectors;
    } else {
        const job = await personalizationQueue.add('personalization', { type: 'for_you', user_id: userId });
        const result = await job.waitUntilFinished(personalizationQueueEvents);
        
        if (result.status !== 'done') {
            throw new CustomErrors.BadRequestError('Failed to generate personalized recommendations.');
        }

        const user_meta_vector = result.data.user_meta_vector || [];
        const user_audio_vector = result.data.user_audio_vector || [];


        return {
            user_meta_vector,
            user_audio_vector,
        };
    }
}


