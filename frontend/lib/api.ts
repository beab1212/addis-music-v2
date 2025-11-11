import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const endpoints = {
  artists: '/artists',
  albums: '/albums',
  genres: '/genres',
  playlists: '/playlists',
  playlistItems: '/playlist-items',
  tags: '/tags',
  trackTags: '/track-tags',
  trackLikes: '/track-likes',
  playHistory: '/play-history',
  artistFollows: '/artist-follows',
  userFollows: '/user-follows',
  user: '/user',
};
