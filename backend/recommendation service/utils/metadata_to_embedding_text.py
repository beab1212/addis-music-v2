from datetime import datetime

def metadata_to_embedding_text(meta: dict) -> str:
    """
    Convert the new music metadata structure into a structured text block
    suitable for embedding models.
    """

    track_obj = meta.get("track", {}) or {}

    # Basic fields (top-level)
    title = track_obj.get("title", "")
    duration = track_obj.get("durationSec", "")
    release_date = track_obj.get("releaseDate", "")
    description = track_obj.get("description", "") or ""
    credit = track_obj.get("credit", "") or ""
    tags = ", ".join(track_obj.get("tags", [])) if meta.get("tags") else ""
    track_number = track_obj.get("trackNumber", "")
    language = track_obj.get("language", "")  # if added later

    # Related objects
    artist_obj = meta.get("artist", {}) or {}
    album_obj = meta.get("album", {}) or {}
    genre_obj = meta.get("genre", {}) or {}

    artist_name = artist_obj.get("name", "")
    artist_bio = artist_obj.get("bio", "") or ""

    album_name = album_obj.get("name", "") if album_obj else ""
    album_release_date = album_obj.get("releaseDate", "") if album_obj else ""


    genre_name = genre_obj.get("name", "") if genre_obj else ""


    release_date = datetime.fromisoformat(album_release_date) if album_release_date else datetime.fromisoformat(release_date)
    # Build the structured embedding text
    text = f"""
    Title: {title}
    Artist: {artist_name}
    {f"Album: {album_name}" if album_name else ""}
    Genre: {genre_name}
    {f"Release Date: {release_date.strftime("%B %d %Y")}" if release_date else ""}
    {f"Track Number: {track_number}" if track_number else ""}

    Duration: {duration} seconds

    {f"Tags: {tags}" if tags else ""}
    {f"Credit: {credit}" if credit else ""}
    {f"Language: {language}" if language else ""}

    {f"Description: {description}" if description else ""}

    Artist Bio:
    {artist_bio}
    """

    # Remove any empty lines (lines with only whitespace)
    text = "\n".join(line for line in text.splitlines() if line.strip())

    return text
