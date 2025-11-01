export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  albumId: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  releaseDate: string;
  plays: number;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  imageUrl: string;
  followers: number;
  genres: string[];
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverUrl: string;
  releaseDate: string;
  songs: Song[];
  genre: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  songs: Song[];
  createdBy: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  photoUrl: string;
  bio: string;
  isPremium: boolean;
  playlists: string[];
  likedSongs: string[];
  followedArtists: string[];
  createdAt: string;
}

export interface Theme {
  mode: 'light' | 'dark' | 'system';
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  queue: Song[];
  currentTime: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type SortOption = 'recent' | 'title' | 'artist' | 'duration';
export type FilterType = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';
