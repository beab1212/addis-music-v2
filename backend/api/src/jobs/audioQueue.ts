import { Queue } from 'bullmq';
import config from '../config/config';
import { redisClient } from '../libs/redis';

// Helper to create a queue
const createQueue = (name: string) => new Queue(name, { connection: redisClient });

// Queues
export const audioEmbeddingQueue = createQueue('audio-embedding');
export const lufsNormalizationQueue = createQueue('lufs-normalization');
export const metadataEmbeddingQueue = createQueue('metadata-embedding');
export const sonicEmbeddingQueue = createQueue('sonic-embedding');
