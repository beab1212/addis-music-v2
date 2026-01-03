import logging
import numpy as np
import json
from libs.db.personalization_queries import get_listening_history, get_liked_songs, get_user_preference
from utils.personalization_helpers import average_vector, weighted_blend, weighted_average_vector
from libs.redis import redis_connection
from typing import List, Optional




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
        listened = get_listening_history(user_id, 1 if is_recent else 10)

        # 2. Get liked tracks
        liked = [] if is_recent else get_liked_songs(user_id, 4)

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
            # We use exponential decay with a low base (0.6) so that weight drops off very quickly
            # Multiplying by 0.6 means 40% decay each step
            recency_weights = [0.6 ** i for i in range(len(listened_meta))]  # Example: 1.0, 0.6, 0.36, 0.216, 0.1296, 0.07776, ...
        else:
            recency_weights = None


        print("Recency Weights:", recency_weights)    
        avg_listened_meta = weighted_average_vector(listened_meta, recency_weights)
        avg_listened_audio = weighted_average_vector(listened_audio, recency_weights)
        avg_liked_meta = weighted_average_vector(liked_meta)
        avg_liked_audio = weighted_average_vector(liked_audio)

        

        # avg_listened_meta = average_vector(listened_meta)
        # avg_liked_meta = average_vector(liked_meta)
        # avg_listened_audio = average_vector(listened_audio)
        # avg_liked_audio = average_vector(liked_audio)


        # print("Listened Tracks:", avg_listened_meta)
        # print("Liked Tracks:", avg_liked_meta)
        # print("Preferences:", pref_meta)
        print("User ID:", user_id)
        print("Is Recent:", is_recent)


        # 7. Generate weighted user vectors
        user_meta_vector = weighted_blend(
            pref_meta, avg_listened_meta, avg_liked_meta,
            0.20, 0.60, 0.20
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

        redis_connection.set(cache_key, cache_value, ex=5)  # Cache for 10 seconds


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

