from io import BytesIO
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
