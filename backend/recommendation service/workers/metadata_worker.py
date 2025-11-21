import asyncio
import logging
from bullmq import Worker
from libs.redis import connection_url
from libs.db.queries import update_track_metadata_embedding, get_full_track_details
from utils.metadata_to_embedding_text import metadata_to_embedding_text
from embeddings.data_embedder import embed_text


async def process_audio_metadata_embedding_job(job, token):
    """
    Processes a job to create and store a metadata embedding for a track.

    This function retrieves track details using a track ID, generates an embedding from the track metadata,
    and updates the track with the generated metadata embedding.

    Parameters:
        job (dict): The job object containing job data (e.g., trackId).
        token (str): The token used for authentication or authorization. (Currently unused, but can be extended)

    Returns:
        dict: A status dictionary indicating the result of the operation.
            - {"status": "done"} if the process was successful.
            - {"status": "no track ID"} if no track ID is found.
            - {"status": "error", "message": <error message>} if an error occurred during processing.
    """

    track_id = job.data.get("trackId")

    if not track_id:
        logging.error(f"[Job {job.id}] No track ID found")
        return {"status": "no track ID"}

    try:
        track_details = get_full_track_details(track_id)

        embedding_text = metadata_to_embedding_text(track_details)

        # Generate the embedding vector by embedding the text
        embedding_vector = embed_text(embedding_text).tolist()

        update_track_metadata_embedding(track_id, embedding_vector)

        logging.info(f"[Job {job.id}] Metadata embedding updated for track {track_id}")
        return {"status": "done"}

    except Exception as e:
        # Log any error and return the error status
        logging.error(f"[Job {job.id}] Error embedding track {track_id}: {e}")
        return {"status": "error", "message": str(e)}


async def metadata_embedding_worker():
    worker = Worker(
        "metadata-embedding",
        process_audio_metadata_embedding_job,
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

    print("Metadata embedder worker started and listening for jobs...")

    # Graceful shutdown mechanism
    shutdown_event = asyncio.Event()
    try:
        await shutdown_event.wait()
    finally:
        print("Shutting down worker...")
        await worker.close()
        print("Worker shut down successfully.")
