"""
Configuration module for environment-based application settings.

This module centralizes all configuration values for:
- Database connections
- Redis caching server
- Cloudinary media services
- S3-based object storage

All configuration classes extend `BaseSettingClass`, which uses Pydantic
Settings to load environment variables from a `.env` file automatically.
"""

from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict  # type: ignore


class BaseSettingClass(BaseSettings):
    """
    Base class for all application settings.

    This class configures Pydantic Settings to load environment variables
    from a `.env` file. Any environment variables that don't match declared
    fields are ignored.

    Attributes:
        model_config (SettingsConfigDict):
            Specifies configuration behavior for Pydantic Settings,
            including `.env` loading and handling of extra fields.
    """
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


class DatabaseConfig(BaseSettingClass):
    """
    Settings for database connection configuration.

    Attributes:
        host (str): Database host address, typically a hostname or IP.
        port (int): Port number for the database service (default PostgreSQL: 5432).
        username (str): Username for database authentication.
        password (str): Password for the database user.
        db_name (str): Name of the database to connect to.
        database_url (str): Optional full database connection URL.
            If provided, this usually overrides the above fields.
    """
    host: str = "localhost"
    port: int = 5432
    username: str = "addismusic"
    password: str = "dbpassword"
    db_name: str = "addisdb"
    database_url: str = ""


class RedisConfig(BaseSettingClass):
    """
    Settings for Redis cache server.

    Attributes:
        host (str): Redis server hostname or IP address.
        port (int): Redis port number (default: 6379).
        username (str): Optional username for Redis authentication.
        password (str): Optional password for Redis authentication.
        db (int): Redis database index (0–15).
    """
    host: str = "localhost"
    port: int = 6379
    username: str = ""
    password: str = ""
    db: int = 0


class CloudinaryConfig(BaseSettingClass):
    """
    Settings for Cloudinary cloud media service.

    Attributes:
        cloudinary_cloud_name (str): Unique Cloudinary cloud name.
        cloudinary_api_key (str): Cloudinary API key.
        cloudinary_api_secret (str): Cloudinary API secret.
    """
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""


class S3StorageConfig(BaseSettingClass):
    """
    Settings for S3-compatible object storage (AWS S3, MinIO, etc.).

    Attributes:
        s3_region (str): Region identifier for S3 or S3-compatible storage.
        s3_endpoint (str): Custom endpoint URL (used for non-AWS providers).
        s3_access_key_id (str): Access key for S3 authentication.
        s3_secret_access_key (str): Secret key for S3 authentication.
        s3_bucket_name (str): Primary bucket used for storing media assets.
    """
    s3_region: str = ""
    s3_endpoint: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    s3_bucket_name: str = "addis-music"


class Settings:
    """
    Container for all configuration groups.

    This class initializes each configuration model, making `settings`
    a single centralized source of truth for the entire application.

    Attributes:
        database (DatabaseConfig): Database settings instance.
        redis (RedisConfig): Redis settings instance.
        cloudinary (CloudinaryConfig): Cloudinary credentials.
        s3_storage (S3StorageConfig): S3 storage configuration.
    """
    database: DatabaseConfig = DatabaseConfig()
    redis: RedisConfig = RedisConfig()
    cloudinary: CloudinaryConfig = CloudinaryConfig()
    s3_storage: S3StorageConfig = S3StorageConfig()


# Global settings instance used across the application
settings = Settings()
