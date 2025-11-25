from fastapi import APIRouter, Query
import json
from pydantic import BaseModel, Field, UUID4
from utils.generate_signed_url import generate_signed_urls_for_folder

router = APIRouter()

class SignResponse(BaseModel):
    success: bool
    data: dict = Field(..., example={
        "music/65614671-2214-4818-b3d1-454e-be39-c82afdd2748e/playlist.m3u8": "https://signed-url-example.com/playlist.m3u8",
        "music/65614671-2214-4818-b3d1-454e-be39-c82afdd2748e/segment1.ts": "https://signed-url-example.com/segment1.ts",
    })


@router.get("/", response_model=SignResponse)
def get_signed_url(
    audio_id: UUID4 = Query(..., example="65614671-2214-4818-b3d1-454e-be39-c82afdd2748e"),
    is_add: bool = Query(False, example=False)
):
    """
    Generate a signed URL for the requested object using query parameters.
    """

    audio_id_str = str(audio_id)

    signed_urls = generate_signed_urls_for_folder(
        audio_id_str,
        is_add=is_add,
        expiration=1200  # 20 minutes
    )

    return SignResponse(
        success=True,
        data=signed_urls
    )
