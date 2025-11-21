from io import BytesIO
import librosa
from libs.s3_client import client


def download_audio_from_s3(bucket_name: str, object_key: str,) -> BytesIO:
    """
    Download an audio file from S3 (MinIO or AWS S3).

    Args:
        bucket_name (str): The name of the S3 bucket.
        object_key (str): The key for the object (file) in the S3 bucket.
    Returns:
        BytesIO: The audio file as a byte stream.
    """
    try:
        # Fetch the object from S3
        response = client.get_object(Bucket=bucket_name, Key=object_key)
        
        # Convert the response to a BytesIO object
        audio_data = BytesIO(response['Body'].read())

        return audio_data
    except Exception as e:
        print(f"Error downloading audio from S3: {e}")
        raise


def get_audio_duration(audio_stream: BytesIO) -> float:
    """
    Get the duration of an audio stream using librosa.
    
    Args:
        audio_stream (io.BytesIO): The audio stream (in-memory file).
    
    Returns:
        float: The duration of the audio in seconds.
    """
    # Load the audio from the stream using librosa
    audio_data, sr = librosa.load(audio_stream, sr=None)  # 'sr=None' to preserve original sample rate
    
    # Calculate the duration in seconds
    duration = librosa.get_duration(y=audio_data, sr=sr)
    
    return duration
