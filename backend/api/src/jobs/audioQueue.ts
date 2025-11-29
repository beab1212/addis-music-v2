import { Queue, QueueEvents } from 'bullmq';
import config from '../config/config';
import { redisClient } from '../libs/redis';

// Helper to create a queue
const createQueue = (name: string) => new Queue(name, { connection: redisClient });

// Queues
export const embeddingQueue = createQueue('embedding');
export const embeddingQueueEvents = new QueueEvents('embedding', { connection: redisClient });

export const personalizationQueue = createQueue('personalization');
export const personalizationQueueEvents = new QueueEvents('personalization', { connection: redisClient });
