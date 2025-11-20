from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict # type: ignore

class BaseSettingClass(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class DatabaseConfig(BaseSettingClass):
    host: str = "localhost"
    port: int = 5432
    username: str = "addismusic"
    password: str = "dbpassword"
    db_name: str = "addisdb"
    database_url: str = ""


class RedisConfig(BaseSettingClass):
    host: str = "localhost"
    port: int = 6379
    username: str = ""
    password: str = ""
    db: int = 0


class CloudinaryConfig(BaseSettingClass):
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""


class S3StorageConfig(BaseSettingClass):
    s3_region: str = ""
    s3_endpoint: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_bucket_name: str = "addis-music"


class Settings():
    database: DatabaseConfig = DatabaseConfig()
    redis: RedisConfig = RedisConfig()
    cloudinary: CloudinaryConfig = CloudinaryConfig()
    s3_storage: S3StorageConfig = S3StorageConfig()


settings = Settings()
