from fastapi import APIRouter, Query
import json
from pydantic import BaseModel, Field, UUID4
from utils.generate_signed_url import generate_signed_urls_for_folder

router = APIRouter()

class SignResponse(BaseModel):
    success: bool
    data: list[str] = Field(..., example=[
        "https://signed-url-example.com/audio/segment_000.ts?signature=abc123",
        "https://signed-url-example.com/audio/segment_001.ts?signature=def456",
        "https://signed-url-example.com/audio/segment_002.ts?signature=ghi789"
    ])


@router.get("/", response_model=SignResponse)
def get_signed_url(
    audio_id: UUID4 = Query(..., example="65614671-2214-4818-b3d1-454e-be39-c82afdd2748e"),
    is_add: bool = Query(False, example=False),
    expiration: int = Query(1200, example=1200)  # 20 minutes in seconds  
):
    """
    Generate a signed URL for the requested object using query parameters.
    """

    audio_id_str = str(audio_id)

    signed_urls = generate_signed_urls_for_folder(
        audio_id_str,
        is_add=is_add,
        expiration=expiration
    )

    return SignResponse(
        success=True,
        data=list(signed_urls.values())
    )
