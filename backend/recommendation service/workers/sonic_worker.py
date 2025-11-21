import asyncio
from io import BytesIO
import logging
from bullmq import Worker
from libs.redis import connection_url
from config.config import settings
from utils.download_audio_from_s3 import download_audio_from_s3, get_audio_duration
from embeddings.audio_embedding import extract_audio_features
from libs.db.queries import get_track, update_track_embedding_and_duration

async def process_audio_embedding_job(job, token):
    """
    Processes an audio embedding job by fetching track information, downloading the audio file, 
    extracting features, and updating the track embedding and duration.

    Parameters:
        job (dict): The job object containing job data (e.g., trackId).
        token (str): The token used for authentication or authorization. (Currently unused in the function, but can be extended)

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
        track = get_track(track_id)

        # Extract object ID from the audio URL in the track data
        _, object_id = track.get("audioUrl", "").split(f"{settings.s3_storage.s3_bucket_name}/", 1)

        audio_stream = download_audio_from_s3(settings.s3_storage.s3_bucket_name, object_id)

        # Make a copy of the audio stream to avoid modifying the original stream
        stream_copy = BytesIO(audio_stream.getvalue())
        
        # Get the audio duration using the stream copy
        audio_duration = get_audio_duration(stream_copy)
        del stream_copy  # Free the memory used by the copy

  
        features = extract_audio_features(audio_stream)
        del audio_stream

        update_track_embedding_and_duration(track_id, features, audio_duration)

        # Log successful completion
        logging.info(f"[Job {job.id}] Sonic embedding updated for track {track_id}")
        return {"status": "done"}

    except Exception as e:
        # Log any error and return the error status
        logging.error(f"[Job {job.id}] Error Sonic embedding track {track_id}: {e}")
        return {"status": "error", "message": str(e)}


async def sonic_embedding_worker():
    worker = Worker(
        "sonic-embedding",
        process_audio_embedding_job,
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

    print("Sonic embedder worker started and listening for jobs...")

    # Graceful shutdown mechanism
    shutdown_event = asyncio.Event()
    try:
        await shutdown_event.wait()
    finally:
        print("Shutting down worker...")
        await worker.close()
        print("Worker shut down successfully.")
