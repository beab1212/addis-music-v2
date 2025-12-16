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
