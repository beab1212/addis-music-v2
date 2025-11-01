import { create } from 'zustand';
import { Playlist, Song } from '@/types';
import { mockPlaylists } from '@/utils/mockData';

interface PlaylistState {
  playlists: Playlist[];

  createPlaylist: (name: string, description: string) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  getPlaylistById: (playlistId: string) => Playlist | undefined;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: mockPlaylists,

  createPlaylist: (name, description) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      coverUrl: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=800',
      songs: [],
      createdBy: 'user-1',
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ playlists: [...state.playlists, newPlaylist] }));
  },

  deletePlaylist: (playlistId) => {
    set((state) => ({
      playlists: state.playlists.filter(p => p.id !== playlistId)
    }));
  },

  updatePlaylist: (playlistId, updates) => {
    set((state) => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    }));
  },

  addSongToPlaylist: (playlistId, song) => {
    set((state) => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId
          ? { ...p, songs: [...p.songs, song], updatedAt: new Date().toISOString() }
          : p
      )
    }));
  },

  removeSongFromPlaylist: (playlistId, songId) => {
    set((state) => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId
          ? { ...p, songs: p.songs.filter(s => s.id !== songId), updatedAt: new Date().toISOString() }
          : p
      )
    }));
  },

  getPlaylistById: (playlistId) => {
    return get().playlists.find(p => p.id === playlistId);
  },
}));
