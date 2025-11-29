import asyncio
import logging
from bullmq import Worker
from libs.redis import connection_url
from workers.processes.embedding_processes import (
    process_audio_metadata_embedding_job,
    process_audio_embedding_job,
    process_album_embedding_job,
    process_artist_embedding_job,
    process_user_pref_embedding_job,
    process_user_playlist_embedding_job,
    process_search_query_embedding_job,
)

ALLOWED_JOB_EMBEDDING_TYPES = ["track", "track_audio", "album", "artist", "user_pref", "user_playlist", "search_query"]

async def process_selector(job, token):
    """
    Selects and processes the appropriate embedding job based on the job data.
    Args:
        job: The job object containing data for processing.
        token: Authentication token if needed for processing.
        Returns: A dictionary containing the status of the processing.
    """
    embedding_type = job.data.get("type")

    if embedding_type not in ALLOWED_JOB_EMBEDDING_TYPES:
        logging.error(f"[Job {job.id}] Invalid embedding type: {embedding_type}")
        return {"status": "invalid embedding type"}
    try:
        if embedding_type == "track":
            return await process_audio_metadata_embedding_job(job)
        elif embedding_type == "track_audio":
            return await process_audio_embedding_job(job)
        elif embedding_type == "album":
            return await process_album_embedding_job(job)
        elif embedding_type == "artist":
            return await process_artist_embedding_job(job)
        elif embedding_type == "user_pref":
            return await process_user_pref_embedding_job(job)
        elif embedding_type == "user_playlist":
            return await process_user_playlist_embedding_job(job)
        elif embedding_type == "search_query":
            return await process_search_query_embedding_job(job)

    except Exception as e:
        # Log any error and return the error status
        logging.error(f"[Job {job.id}] Error processing {embedding_type} embedding: {e}")
        return {"status": "error", "message": str(e)}


async def embedding_worker():
    worker = Worker(
        "embedding",
        process_selector,
        {
            "connection": connection_url,
            "concurrency": 5
        },
    )

    # Worker event listeners
    worker.on("error", lambda e: print("Worker error:", e))
    worker.on("failed", lambda job, err: print(f"Job {job.id} failed: {err}"))

    async def on_completed(job, return_value):
        print(f"Job {job.id} completed → {return_value}")
        try:
            # remove job queue for memory optimization
            await job.remove()
            print(f"Job {job.id} removed from queue")
        except Exception as e:
            print(f"Failed to remove job {job.id}: {e}")

    worker.on("completed", lambda job, return_value: asyncio.create_task(on_completed(job, return_value)))

    print("Embedding worker started and listening for jobs...")

    # Graceful shutdown mechanism
    shutdown_event = asyncio.Event()
    try:
        await shutdown_event.wait()
    finally:
        print("Shutting down worker...")
        await worker.close()
        print("Worker shut down successfully.")
