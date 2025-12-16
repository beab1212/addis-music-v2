test = [
    {
        "id": 101,                     # play_history.id
        "user_id": "user-123",
        "track_id": 201,
        "played_at": "2025-11-28T12:30:00",
        "title": "Shape of You",       # track.title
        "artist": "Ed Sheeran",        # track.artist
        "duration": 235,               # track.duration in seconds
        "album": "Divide",             # track.album (if exists)
        "genre": "Pop"                 # track.genre (if exists)
    },
    {
        "id": 102,
        "user_id": "user-123",
        "track_id": 202,
        "played_at": "2025-11-28T11:45:00",
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "duration": 200,
        "album": "After Hours",
        "genre": "R&B"
    },
    {
        "id": 103,
        "user_id": "user-123",
        "track_id": 203,
        "played_at": "2025-11-28T10:15:00",
        "title": "Levitating",
        "artist": "Dua Lipa",
        "duration": 203,
        "album": "Future Nostalgia",
        "genre": "Pop"
    }
]

artists: list = [h.get("artist") for h in test]

print(artists)

