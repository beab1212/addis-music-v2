import psycopg2
from .db import conn
from psycopg2.extras import RealDictCursor

def get_full_track_details(track_id: str):
    """
    Returns full track detail including artist, album, and genre as a nested dict.
    """
    query = """
        SELECT
            -- Track
            t."id" AS track_id,
            t."title" AS track_title,
            t."trackNumber",
            t."releaseDate" AS track_release,
            t."description" AS track_description,
            t."credit" AS track_credit,
            t."tags",

            -- Track artist
            a."id" AS artist_id,
            a."name" AS artist_name,
            a."bio" AS artist_bio,
            a."country" AS artist_country,
            a."genres" AS artist_genres,

            -- Album
            al."id" AS album_id,
            al."title" AS album_title,
            al."releaseDate" AS album_release,
            al."genreId" AS album_genre_id,
            al."description" AS album_description,
            al."credit" AS album_credit,

            -- Track genre
            g."id" AS genre_id,
            g."name" AS genre_name
        FROM "Track" t
        LEFT JOIN "Artist" a ON a."id" = t."artistId"
        LEFT JOIN "Album" al ON al."id" = t."albumId"
        LEFT JOIN "Genre" g ON g."id" = t."genreId"
        WHERE t."id" = %s;
    """


    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, (track_id,))
            row = cur.fetchone()
            if not row:
                return None  # or {"error": "Track not found"}
            
            result = {
                "track": {
                    "id": row["track_id"],
                    "title": row["track_title"],
                    "trackNumber": row["trackNumber"],
                    "releaseDate": row["track_release"].isoformat() if row["track_release"] else None,
                    "description": row["track_description"],
                    "credit": row["track_credit"],
                    "tags": row["tags"] or []
                },
                "artist": {
                    "id": row["artist_id"],
                    "name": row["artist_name"],
                    "bio": row["artist_bio"],
                    "country": row["artist_country"],
                    "genres": row["artist_genres"] or []
                } if row["artist_id"] else None,
                "album": {
                    "id": row["album_id"],
                    "title": row["album_title"],
                    "releaseDate": row["album_release"].isoformat() if row["album_release"] else None,
                    "genreId": row["album_genre_id"],
                    "description": row["album_description"],
                    "credit": row["album_credit"]
                } if row["album_id"] else None,
                "genre": {
                    "id": row["genre_id"],
                    "name": row["genre_name"]
                } if row["genre_id"] else None
            }


            return result

    except Exception as e:
        return {"error": str(e)}


def update_track_metadata_embedding(track_id: str, embedding_vector):
    """
    Updates the metaDataEmbeddingVector for a given track.
    """
    query = """
    UPDATE "Track"
    SET "metaDataEmbeddingVector" = %s
    WHERE id = %s;
    """

    try:
        with conn.cursor() as cur:
            cur.execute(query, (embedding_vector, track_id))
            conn.commit()
            return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}

