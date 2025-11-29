import logging
from io import BytesIO
from libs.db.queries import update_embedding, get_full_track_details
from utils.metadata_to_embedding_text import metadata_to_embedding_text
from embeddings.data_embedder import embed_text

from config.config import settings
from utils.download_audio_from_s3 import download_audio_from_s3, get_audio_duration
from embeddings.audio_embedding import extract_audio_features
from libs.db.queries import get_track, update_track_embedding_and_duration


async def process_audio_metadata_embedding_job(job):
    """
    """
    track_id = job.data.get("track_id", None)

    if not track_id:
        logging.error(f"[Job {job.id}] No track ID found")
        return {"status": "no track ID"}

    try:
        track_details = get_full_track_details(track_id)

        embedding_text = metadata_to_embedding_text(track_details)

        # Generate the embedding vector by embedding the text
        embedding_vector = embed_text(embedding_text).tolist()

        update_embedding(track_id, embedding_vector, record="Track")

        return {"status": "done", "data": embedding_vector}

    except Exception as e:
        # Log any error and return the error status
        logging.error(f"[Job {job.id}] Error embedding track {track_id}: {e}")
        return {"status": "error", "message": str(e)}


async def process_audio_embedding_job(job):
    """
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


async def process_album_embedding_job(job):
    """
    """
    album_id = job.data.get("album_id")
    if not album_id:
        return {"status": "no album ID"}
    
    album_metadata = job.data.get("album_metadata")
    if not album_metadata:
        return {"status": "no album metadata"}
    try:
        embedding_vector = embed_text(album_metadata).tolist()
        update_embedding(album_id, embedding_vector, record="Album")

        return {"status": "done", "data": embedding_vector}
    except Exception as e:
        logging.error(f"[Job {job.id}] Error processing album embedding: {e}")
        return {"status": "error", "message": str(e)}


async def process_artist_embedding_job(job):
    """
    """
    artist_id = job.data.get("artist_id")
    if not artist_id:
        return {"status": "no artist ID"}
    
    artist_metadata = job.data.get("artist_metadata")
    if not artist_metadata:
        return {"status": "no artist metadata"}
    try:
        embedding_vector = embed_text(artist_metadata).tolist()
        update_embedding(artist_id, embedding_vector, record="Artist")

        return {"status": "done", "data": embedding_vector}
    except Exception as e:
        logging.error(f"[Job {job.id}] Error processing artist embedding: {e}")
        return {"status": "error", "message": str(e)}


async def process_user_pref_embedding_job(job):
    """
    """
    user_id = job.data.get("user_id")
    if not user_id:
        return {"status": "no user ID"}
    
    user_metadata = job.data.get("user_metadata")
    if not user_metadata:
        return {"status": "no user metadata"}
    try:
        embedding_vector = embed_text(user_metadata).tolist()
        update_embedding(user_id, embedding_vector, record="UserPreference")

        return {"status": "done", "data": embedding_vector}
    except Exception as e:
        logging.error(f"[Job {job.id}] Error processing user preference embedding: {e}")
        return {"status": "error", "message": str(e)}


async def process_user_playlist_embedding_job(job):
    """
    """
    playlist_id = job.data.get("playlist_id")
    if not playlist_id:
        logging.error(f"[Job {job.id}] No playlist ID found")
        return {"status": "no playlist ID"}
    
    playlist_metadata = job.data.get("playlist_metadata")
    if not playlist_metadata:
        logging.error(f"[Job {job.id}] No playlist metadata found")
        return {"status": "no playlist metadata"}
    try:
        embedding_vector = embed_text(playlist_metadata).tolist()
        update_embedding(playlist_id, embedding_vector, record="Playlist")

        return {"status": "done", "data": embedding_vector}
    except Exception as e:
        logging.error(f"[Job {job.id}] Error processing playlist embedding: {e}")
        return {"status": "error", "message": str(e)}


async def process_search_query_embedding_job(job):
    """
    """
    query_text = job.data.get("query_text")
    if not query_text:
        logging.error(f"[Job {job.id}] No query text found")
        return {"status": "no query text"}
    try:
        embedding_vector = embed_text(query_text).tolist()
        
        return {"status": "done", "data": embedding_vector}
    except Exception as e:
        logging.error(f"[Job {job.id}] Error processing search query embedding: {e}")
        return {"status": "error", "message": str(e)}
