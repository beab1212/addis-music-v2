import { Queue } from 'bullmq';
import config from '../config/config';

export const audioEmbeddingQueue = new Queue('audio-embedding', {
    connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
    },
});

export const lufsNormalizationQueue = new Queue('lufs-normalization', {
    connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
    },
});

export const metadataEmbeddingQueue = new Queue('metadata-embedding', {
    connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
    },
});

export const sonicEmbeddingQueue = new Queue('sonic-embedding', {
    connection: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
    },
});
