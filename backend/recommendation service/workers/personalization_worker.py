import asyncio
import logging
from bullmq import Worker
from libs.redis import connection_url
from workers.processes.personalization_processes import (
    process_for_you_job,
    process_trending_tracks_job
)


ALLOWED_JOB_EMBEDDING_TYPES = ["for_you", "trending_now", "new_releases", "recommended_for_you", "next_playlist"]

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
        if embedding_type == "for_you":
            return await process_for_you_job(job)
        elif embedding_type == "trending_now":
            return await process_trending_tracks_job(job)

    except Exception as e:
        # Log any error and return the error status
        logging.error(f"[Job {job.id}] Error processing {embedding_type} embedding: {e}")
        return {"status": "error", "message": str(e)}


async def personalization_worker():
    worker = Worker(
        "personalization",
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

    print("Personalization worker started and listening for jobs...")

    # Graceful shutdown mechanism
    shutdown_event = asyncio.Event()
    try:
        await shutdown_event.wait()
    finally:
        print("Shutting down worker...")
        await worker.close()
        print("Worker shut down successfully.")
