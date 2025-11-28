"""
Database connection using psycopg2 and pgvector.

This script connects to the PostgreSQL database using parameters from
the application settings and registers the pgvector extension to handle
vector columns.

It prints the connected database name if successful and handles
connection failures gracefully.
"""

import psycopg2
from psycopg2.extensions import connection as Psycopg2Connection
from config.config import settings
from pgvector.psycopg2 import register_vector

# Database connection parameters
db_params: dict[str, str | int] = {
    "host": settings.database.host,
    "port": settings.database.port,
    "user": settings.database.username,
    "password": settings.database.password,
    "dbname": settings.database.db_name,
}

try:
    # Attempt to connect to the database
    conn: Psycopg2Connection = psycopg2.connect(**db_params)
    register_vector(conn)  # Register pgvector support
    cursor = conn.cursor()  # type: ignore
    # Print the database name to confirm connection
    print(f"Connected to the database: {conn.get_dsn_parameters()['dbname']}")
except Exception as e:
    # Print an error if connection fails
    print(f"I am unable to connect to the database: {e}")
