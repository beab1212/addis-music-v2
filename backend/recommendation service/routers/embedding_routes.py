from fastapi import APIRouter, Query, HTTPException
import logging
from pydantic import BaseModel, Field, UUID4
from io import BytesIO
from typing import Dict, List
from config.config import settings
from libs.db.queries import update_track_metadata_embedding, get_full_track_details, get_track, update_track_embedding_and_duration
from utils.download_audio_from_s3 import download_audio_from_s3, get_audio_duration
from utils.metadata_to_embedding_text import metadata_to_embedding_text
from embeddings.data_embedder import embed_text
from embeddings.audio_embedding import extract_audio_features


router = APIRouter()

class TrackMetaEmbeddingResponse(BaseModel):
    success: bool
    track_id: UUID4 = Field(..., description="The uuid identifier of the track")
    embedding_vector: List[float] = Field(..., description="The generated embedding vector")


@router.get("/track_metadata_embedding", response_model=TrackMetaEmbeddingResponse)
async def track_metadata_embedding(
    track_id: UUID4 = Query(..., description="The uuid identifier of the track"), 
):
    """
    Create a metadata embedding for a given track.

    Args:
        track_id (UUID4): The unique identifier of the track.
    Returns:
        dict: A dictionary containing the status of the embedding creation.
    """
    track_id: str = str(track_id)

    if not track_id:
        raise HTTPException(status_code=400, detail="track_id is required")
    
    try:
        track_details = get_full_track_details(track_id)
        if not track_details:
            raise HTTPException(status_code=404, detail="Track not found")
        
        embedding_text = metadata_to_embedding_text(track_details)

        # Generate the embedding vector by embedding the text
        embedding_vector = embed_text(embedding_text).tolist()

        update_track_metadata_embedding(track_id, embedding_vector)

        logging.info(f"[Metadata embedding updated for track {track_id}]")

    except Exception as e:
        logging.error(f"[Metadata embedding error for track {track_id}]: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating embedding: {str(e)}")

    return AudioEmbeddingResponse(
        success=True,
        track_id=track_id,
        embedding_vector=embedding_vector.tolist()
    )



class AudioEmbeddingResponse(BaseModel):
    success: bool
    track_id: UUID4 = Field(..., description="The uuid identifier of the track")
    embedding_vector: List[float] = Field(..., description="The generated embedding vector")

@router.get("/track_sonic_embedding", response_model=AudioEmbeddingResponse)
async def track_sonic_embedding(
    track_id: UUID4 = Query(..., description="The uuid identifier of the track"), 
):
    """
    Create a sonic embedding for a given track.

    Args:
        track_id (UUID4): The unique identifier of the track.
    Returns:
        dict: A dictionary containing the status of the embedding creation.
    """
    track_id: str = str(track_id)

    if not track_id:
        raise HTTPException(status_code=400, detail="track_id is required")
    
    try:
        track = get_full_track_details(track_id)
        if not track:
            raise HTTPException(status_code=404, detail="Track not found")
        
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
        logging.info(f"[Sonic embedding updated for track {track_id}]")
    except Exception as e:
        logging.error(f"[Sonic embedding error for track {track_id}]: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating embedding: {str(e)}")

    return AudioEmbeddingResponse(
        success=True,
        track_id=track_id,
        embedding_vector=features.tolist()
    )


class TextEmbeddingRequest(BaseModel):
    text: str = Field(..., description="Texts to be embedded")

class TextEmbeddingResponse(BaseModel):
    success: bool
    embedding: List[float] = Field(..., description="The generated embedding vectors for the text")

@router.post("/embed_texts", response_model=TextEmbeddingResponse)
async def embed_texts_endpoint(
    request: TextEmbeddingRequest
):
    """
    Embed a text into its corresponding embedding vector.

    Args:
        request (TextEmbeddingRequest): The request model containing the text.
        
    Returns:
        TextEmbeddingResponse: A response model containing the success status and the embedding vectors.
    """
    try:
        embedding = embed_text(request.text).tolist()
        return TextEmbeddingResponse(
            success=True,
            embedding=embedding
        )
    except Exception as e:
        logging.error(f"[Text embedding error]: {e}")
        raise HTTPException(status_code=500, detail=f"Error embedding texts: {str(e)}")

