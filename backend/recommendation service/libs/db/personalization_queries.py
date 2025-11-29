"""
personalization_queries: simple helpers to fetch user play history, liked songs,
and preferences.
"""

from .db import conn
from psycopg2.extras import RealDictCursor


def get_listening_history(user_id: str, limit: int = 5) -> any:
    """
    Fetch the user's most recent listening history.

    This retrieves play history entries for a given user, along with the
    associated track information. Results are ordered by the most recently
    played items.

    Args:
        user_id (str):
            The ID of the user whose listening history is being queried.
        limit (int, optional):
            Maximum number of records to return. Defaults to 5.

    Returns:
        any:
            A list of dictionaries (each row contains combined play_history
            and track fields). Returns `None` if no results are found.

    Notes:
        - Uses a SQL JOIN to include full track details.
        - Returns rows as `RealDictRow` objects for easy conversion to JSON.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT ph.*, t.*
            FROM "PlayHistory" ph
            JOIN "Track" t ON t.id = ph."trackId"
            WHERE ph."userId" = %s
            ORDER BY ph."playedAt" DESC
            LIMIT %s;
        """, (user_id, limit))

        return cur.fetchall() or None


def get_liked_songs(user_id: str, limit: int = 5) -> any:
    """
    Retrieve the user's most recently liked tracks.

    This returns track-like records joined with the corresponding track
    information, ordered by the time the user liked the track.

    Args:
        user_id (str):
            The ID of the user whose liked songs are being retrieved.
        limit (int, optional):
            Maximum number of records to return. Defaults to 5.

    Returns:
        any:
            A list of dictionaries representing liked track records and
            their associated track data, or `None` if no likes exist.

    Notes:
        - Uses `track_like` joined with `track` to include full track metadata.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT tl.*, t.*
            FROM "TrackLike" tl
            JOIN "Track" t ON t.id = tl."trackId"
            WHERE tl."userId" = %s
            ORDER BY tl."createdAt" DESC
            LIMIT %s;
        """, (user_id, limit))

        return cur.fetchall() or None


def get_user_preference(user_id: str) -> any:
    """
    Retrieve user-specific preference settings.

    Args:
        user_id (str):
            The ID of the user whose preference entry is being requested.

    Returns:
        any:
            A dictionary containing the user's preference record, or `None`
            if the user has no preference entry stored.

    Notes:
        - This returns a single row (`LIMIT 1`).
        - Preference structure depends on the `user_preference` table schema.
    """
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT *
            FROM "UserPreference"
            WHERE "userId" = %s;
        """, (user_id,))

        return cur.fetchone() or None
