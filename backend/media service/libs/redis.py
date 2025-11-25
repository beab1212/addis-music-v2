from redis import Redis
from config.config import settings

print("Connecting to Redis at "
      f"{settings.redis.host}:{settings.redis.port}, DB: {settings.redis.db}")

redis_connection = Redis(
    settings.redis.host,
    settings.redis.port,
    db=settings.redis.db,
    password=settings.redis.password
)

connection_url = (
    f"redis://:{settings.redis.password}@"
    f"{settings.redis.host}:{settings.redis.port}/{settings.redis.db}"
)
