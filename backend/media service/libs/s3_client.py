import boto3
from config.config import settings

try:
    client = boto3.client(
        's3',
        endpoint_url=settings.s3_storage.s3_endpoint,
        aws_access_key_id=settings.s3_storage.s3_access_key_id,
        aws_secret_access_key=settings.s3_storage.s3_secret_access_key,
        region_name=settings.s3_storage.s3_region
    )
except Exception as error:
    print("Failed to create S3 client: ", error)
    client = None
