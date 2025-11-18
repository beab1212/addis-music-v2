from pydantic_settings import BaseSettings
from pydantic import BaseModel


class DatabaseConfig(BaseModel):
    host: str
    port: int
    username: str
    password: str
    db_name: str
    database_url: str


class RedisConfig(BaseModel):
    host: str
    port: int
    username: str
    password: str
    db: int


class CloudinaryConfig(BaseModel):
    cloud_name: str
    api_key: str
    api_secret: str



class S3StorageConfig(BaseModel):
    region: str
    endpoint: str
    access_key_id: str
    secret_accesskey: str
    bucket_name: str


class Settings(BaseSettings):
    # Database
    database: DatabaseConfig = DatabaseConfig(
        host="localhost",
        port=5432,
        username="addismusic",
        password="dbpassword",
        db_name="addisdb",
        database_url=""
    )

    # Redis
    redis: RedisConfig = RedisConfig(
        host="localhost",
        port=6379,
        username="",
        password="",
        db=0
    )

    # Cloudinary
    cloudinary: CloudinaryConfig = CloudinaryConfig(
        cloud_name="",
        api_key="",
        api_secret=""
    )

    # S3 Storage
    s3_storage: S3StorageConfig = S3StorageConfig(
        region="",
        endpoint="",
        access_key_id="",
        secret_accesskey="",
        bucket_name="addis-music"
    )

    model_config = {
        "env_file": ".env",
        "extra": "allow",  # ignore unknown env vars
        "env_file_encoding": "utf-8"
    }


settings = Settings()
