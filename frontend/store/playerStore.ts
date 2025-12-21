import { create } from 'zustand';
import { Song } from '@/types';
import { api } from '@/lib/api';


interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  queue: Song[];
  currentTime: number;
  duration: number;
  muted: boolean;
  isLiked: boolean;
  advertisementData: any | null;
  audioRef: HTMLAudioElement | null;
  isAdvertisementPlaying: boolean;

  setCurrentSong: (song: Song) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleMute: () => void;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  setQueue: (queue: Song[]) => void;
  playNext: () => void;
  toggleIsLiked: () => void;
  playPrevious: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  setAdvertisementData: (data: any) => void;
  setIsAdvertisementPlaying: (isPlaying: boolean) => void;
  setAudioRef: (audioRef: HTMLAudioElement) => void;
}

const fetchIsLiked = async (trackId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/track-likes/${trackId}/is-liked`);
    return response.data.data.isLiked || false;
  } catch (error) {
    console.error('Error fetching like status:', error);
    return false;
  }
};

 const toggleLike = async (trackId: string): Promise<boolean> => {
  // This function toggles the like status and returns the new status
  try {
    const response = await api.post(`/track-likes/${trackId}/toggle-like`);
    return response.data.data.isLiked;
  } catch (error) {
    console.error('Error toggling like status:', error);
    return false;
  }
};

const getTrackStreamUrl = async(trackId: string): Promise<boolean> => {
  try {
    const response = await api.get(`http://localhost:5000/stream/${trackId}/stream-url`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stream URL:', error);
    return false;
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  volume: 70,
  isShuffle: false,
  repeatMode: 'off',
  queue: [],
  currentTime: 0,
  duration: 0,
  muted: false,
  isLiked: false,
  advertisementData: null,
  isAdvertisementPlaying: false,
  audioRef: null,

  setIsAdvertisementPlaying: (isPlaying) => set({ isAdvertisementPlaying: isPlaying }),
  setAdvertisementData: (data) => set({ advertisementData: data }),

  setCurrentSong: (song) => {
    if (get().isAdvertisementPlaying) return;
    fetchIsLiked(song.id).then((isLiked) => {
      set({ isLiked });
    });
    getTrackStreamUrl(song.id).then((streamData) => {
      set({ advertisementData: streamData });
    });
    set({ currentSong: song, isPlaying: true, currentTime: 0 })
  },

  togglePlayPause: () => {
    if (get().isAdvertisementPlaying) return;
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setVolume: (volume) => set({ volume }),

  toggleShuffle: () => {
    if (get().isAdvertisementPlaying) return;
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  toggleMute: () => set((state) => ({ muted: !state.muted })),

  setAudioRef: (audioRef) => set({ audioRef }),

  toggleIsLiked: () => {
    if (get().isAdvertisementPlaying) return;
    const { currentSong } = get();
    if (!currentSong) return;
    toggleLike(currentSong.id).then(() => {
      set({ isLiked: !get().isLiked });
    });
  },

  setRepeatMode: (mode) => {
    if (get().isAdvertisementPlaying) return;
    set({ repeatMode: mode });
  },

  setQueue: (queue) => {
    if (get().isAdvertisementPlaying) return;
    set({ queue });
  },

  playNext: () => {
    if (get().isAdvertisementPlaying) return;
    const { queue, currentSong, repeatMode, isShuffle } = get();
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex(s => s.id === currentSong.id);

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = repeatMode === 'all' ? 0 : currentIndex;
      }
    }

    console.log("Playing next track", queue[nextIndex]);

    if (nextIndex !== currentIndex || repeatMode === 'all') {
      get().setCurrentSong(queue[nextIndex]);
    }
  },

  playPrevious: () => {
    if (get().isAdvertisementPlaying) return;
    const { queue, currentSong, currentTime } = get();
    if (!currentSong || queue.length === 0) return;

    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;

    get().setCurrentSong(queue[prevIndex]);
  },

  setCurrentTime: (time) => {
    if (get().isAdvertisementPlaying) return;
    set({ currentTime: time });
  },

  setDuration: (duration) => set({ duration }),

  addToQueue: (song) => {
    if (get().isAdvertisementPlaying) return;
    set((state) => ({ queue: [...state.queue, song] }));
  },

  removeFromQueue: (songId) => {
    if (get().isAdvertisementPlaying) return;
    set((state) => ({
      queue: state.queue.filter(s => s.id !== songId)
    }));
  },

  clearQueue: () => {
    if (get().isAdvertisementPlaying) return;
    set({ queue: [] });
  },
}));
