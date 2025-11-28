"""
S3 client connection setup using the `boto3` library.

This script attempts to create an S3 client using the configuration from
the application settings. If successful, it will allow interaction with
S3-compatible services. If an error occurs, it gracefully handles it and
sets the client to `None`.
"""

import boto3
from boto3.client import S3Client  # type: ignore
from config.config import settings

try:
    # Initialize the S3 client
    client: S3Client = boto3.client(
        's3',
        endpoint_url=settings.s3_storage.s3_endpoint,
        aws_access_key_id=settings.s3_storage.s3_access_key_id,
        aws_secret_access_key=settings.s3_storage.s3_secret_access_key,
        region_name=settings.s3_storage.s3_region
    )
except Exception as error:
    # If initialization fails, print error and set client to None
    print("Failed to create S3 client: ", error)
    client: S3Client | None = None
