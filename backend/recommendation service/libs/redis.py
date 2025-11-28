"""
Redis connection setup using the `redis-py` library.

This script establishes a connection to a Redis server using parameters
from the application settings, and prints out the connection details.
It also constructs a connection URL for Redis using the settings.
"""

from redis import Redis
from config.config import settings

# Print Redis connection details
print("Connecting to Redis at "
      f"{settings.redis.host}:{settings.redis.port}, DB: {settings.redis.db}")

# Establish a Redis connection
redis_connection: Redis = Redis(
    settings.redis.host,
    settings.redis.port,
    db=settings.redis.db,
    password=settings.redis.password
)

# Construct the Redis connection URL
connection_url: str = (
    f"redis://:{settings.redis.password}@"
    f"{settings.redis.host}:{settings.redis.port}/{settings.redis.db}"
)
