import psycopg2
from config.config import settings

db_params = {
    "host": settings.database.host,
    "port": settings.database.port,
    "user": settings.database.username,
    "password": settings.database.password,
    "dbname": settings.database.db_name,
}

connection = psycopg2.connect(**db_params)
