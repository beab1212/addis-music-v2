import { embeddingQueueEvents, embeddingQueue } from "../jobs/audioQueue";

export const queryEmbedding = async (searchQuery: string) => {
    const job = await embeddingQueue.add('embedding', { type: 'search_query', query_text: searchQuery });

    try {
        const result = await job.waitUntilFinished(embeddingQueueEvents);
        console.log("Job completed with result:", result);
        return { jobId: job.id, result };
    } catch (err: any) {
        console.error("Job failed with error:", err);
        return { jobId: job.id, error: err?.message ?? String(err) };
    }
}

export const isAmharic = (query: string) => {
    if (!query || typeof query !== 'string') return false;

    // Remove spaces, punctuation, numbers, and common Latin characters to avoid false negatives on mixed input
    const cleaned = query.replace(/[\s\d\w.,!?'"()-]/g, '');

    // If after cleaning there's nothing left, it's not Amharic
    if (cleaned.length === 0) return false;

    // Ethiopic Unicode blocks used in Amharic
    const ethiopicRegex = /[\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\u1E7E0-\u1E7FF]/;

    // Count how many Ethiopic characters are in the original query
    const ethiopicMatches = query.match(ethiopicRegex) || [];
    const ethiopicCount = ethiopicMatches.length;
    const totalLength = query.length;

    // Consider it Amharic if at least 30% of characters are Ethiopic
    // Adjust threshold as needed: 0.3 = tolerant (allows mixed), 0.5 = stricter
    return ethiopicCount / totalLength >= 0.3;
}
