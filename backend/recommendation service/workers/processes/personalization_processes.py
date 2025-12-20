import logging
import numpy as np
import json
from libs.db.personalization_queries import get_listening_history, get_liked_songs, get_user_preference
from utils.personalization_helpers import average_vector, weighted_blend
from libs.redis import redis_connection


async def process_for_you_job(job):
    """
    """
    user_id = job.data.get("user_id")
    if not user_id:
        return {"status": "no user ID"}
    
    # Check if 'is_recent' flag is provided, default to False
    is_recent = job.data.get("is_recent", False)

    
    try:
        # 1. Get last listened tracks
        listened = get_listening_history(user_id, 2 if is_recent else 5)

        # 2. Get liked tracks
        liked = get_liked_songs(user_id, 1 if is_recent else 15)

        # 3. Get user preferences
        preferences = get_user_preference(user_id)
        
        # 4. Extract embedding vectors (default to empty lists if not present)
        pref_meta = preferences.get("embeddingVector") if preferences else []

        # 5. Extract vectors from listened and liked tracks
        listened_meta = [h.get("embeddingVector", []) for h in listened] if listened else []
        listened_audio = [h.get("sonicEmbeddingVector", []) for h in listened] if listened else []
        liked_meta = [h.get("embeddingVector", []) for h in liked] if liked else []
        liked_audio = [h.get("sonicEmbeddingVector", []) for h in liked] if liked else []

        # 6. Calculate average vectors with recency for listened (exponential decay: recent tracks weighted more)
        if listened_meta:
            recency_weights = [0.9 ** i for i in range(len(listened_meta))]  # Decay: 1, 0.9, 0.81, ...
            recency_weights = recency_weights[::-1]  # Reverse to weight recent higher (assuming recent first)
        else:
            recency_weights = None


        avg_listened_meta = average_vector(listened_meta)
        avg_liked_meta = average_vector(liked_meta)
        avg_listened_audio = average_vector(listened_audio)
        avg_liked_audio = average_vector(liked_audio)


        # print("Listened Tracks:", avg_listened_meta)
        # print("Liked Tracks:", avg_liked_meta)
        # print("Preferences:", pref_meta)
        print("User ID:", user_id)
        print("Is Recent:", is_recent)


        # 7. Generate weighted user vectors
        user_meta_vector = weighted_blend(
            pref_meta, avg_listened_meta, avg_liked_meta,
            0.30, 0.50, 0.20
        )

        user_audio_vector = weighted_blend(
            avg_listened_audio, avg_liked_audio, None,
            0.70, 0.30, 0.00
        )

        # Convert NumPy arrays to Python lists with float values
        # user_meta_vector = user_meta_vector.astype(float).tolist() if isinstance(user_meta_vector, np.ndarray) else user_meta_vector
        # user_audio_vector = user_audio_vector.astype(float).tolist() if isinstance(user_audio_vector, np.ndarray) else user_audio_vector

        user_meta_vector = [float(x) for x in user_meta_vector]
        user_audio_vector = [float(x) for x in user_audio_vector]

        cache_key = f"{'recent:' if is_recent else ''}user_vectors:{user_id}"
        cache_value = json.dumps({
            "user_meta_vector": user_meta_vector,
            "user_audio_vector": user_audio_vector
        })

        redis_connection.set(cache_key, cache_value, ex=10)  # Cache for 10 seconds


        return {"status": "done", "data": {
            'user_meta_vector': user_meta_vector,
            'user_audio_vector': user_audio_vector
        }}
    except Exception as e:
        logging.error(f"[Job {job.id}] Error processing user personalization: {e}")
        return {"status": "error", "message": str(e)}

async def process_trending_tracks_job(job):
    """
    """
    try:
        # Placeholder for trending tracks logic
        trending_tracks = []  # This would be replaced with actual logic to fetch trending tracks

        return {"status": "done", "data": trending_tracks}
    except Exception as e:
        logging.error(f"[Job {job.id}] Error processing trending tracks: {e}")
        return {"status": "error", "message": str(e)}

