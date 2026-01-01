from libs.s3_client import client
from utils.generate_hls import generate_hls
from config.config import settings
from libs.redis import redis_connection


HLS_BUCKET_NAME = settings.s3_storage.hls_bucket_name or "hls-playlist"

def generate_signed_url(bucket_name, object_key, expiration=300):
    """
    Generate a signed URL for an object stored in an S3 bucket.
    Args:
        :param bucket_name: The name of the S3 bucket.
        :param object_key: The key (path) of the object in the S3 bucket.
        :param expiration: URL expiration time in seconds (default 5 minutes).
    :return: Signed URL.
    """
    try:
        # Generate the signed URL
        signed_url = client.generate_presigned_url(
            'get_object', 
            Params={'Bucket': bucket_name, 'Key': object_key}, 
            ExpiresIn=expiration
        )
        return signed_url
    except Exception as e:
        print(f"Error generating signed URL for {object_key}: {e}")
        return None


def generate_signed_urls_for_folder(audio_id, bucket_name = HLS_BUCKET_NAME,  expiration=300, is_add: bool = False):
    """
    Generate signed URLs for all objects within a specific folder (prefix) in an S3 bucket.
    Args:
        :param bucket_name: The name of the S3 bucket.
        :param audio_id: The folder prefix (path) within the S3 bucket. This should be the audio ID.
        :param expiration: URL expiration time in seconds (default 5 minutes).
        :param is_add: Boolean flag to indicate whether to add new HLS content if no objects are found.
    :return: A dictionary of object keys and their corresponding signed URLs.
    """
    signed_urls = {}

    folder_prefix = f"{'add' if is_add else 'music'}/{audio_id}/"

    try:
        # List objects within the folder (prefix)
        response = client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=folder_prefix
        )

        # Check if the folder has any content
        if 'Contents' not in response or not response['Contents']:

            # mark process in redis to avoid multiple HLS generations
            redis_key = f"hls_generation_in_progress:{audio_id}"
            if redis_connection.get(redis_key):
                print(f"HLS generation already in progress for audio_id: {audio_id}")
                return signed_urls  # Return empty if generation is in progress
            
            redis_connection.set(redis_key, "1", ex=300)  # Set key with 5 minutes expiration
            print(f"No objects found in the folder: {folder_prefix}")
            print(f"Generating HLS for folder: {folder_prefix}")
            generate_hls(audio_id=audio_id, is_add=is_add)
            redis_connection.delete(redis_key)  # Remove the key after generation
            # List objects again after HLS generation
            response = client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=folder_prefix
            )
            if 'Contents' not in response or not response['Contents']:
                # If no objects are found return an empty dict
                return signed_urls

        # Iterate over the objects in the folder if they exist
        if 'Contents' in response:
            for obj in response['Contents']:
                object_key = obj['Key']

                # Skip master.m3u8
                if object_key.endswith("master.m3u8") or object_key.endswith(".m3u8"):
                    continue

                signed_url = generate_signed_url(bucket_name, object_key, expiration)
                if signed_url:
                    signed_urls[object_key] = signed_url

    except Exception as e:
        print(f"Error listing objects in folder {folder_prefix}: {e}")
    
    return signed_urls
