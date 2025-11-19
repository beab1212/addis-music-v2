import psycopg2
from pgvector.psycopg2 import register_vector
from config.config import settings

db_params = {
    "host": settings.database.host,
    "port": settings.database.port,
    "user": settings.database.username,
    "password": settings.database.password,
    "dbname": settings.database.db_name,
}

import psycopg2

try:
    conn = psycopg2.connect(**db_params)
    register_vector(conn)
    cursor = conn.cursor()
    # print database name
    print(f"Connected to the database: {conn.get_dsn_parameters()['dbname']}")
except:
    print("I am unable to connect to the database")

