import { create } from 'zustand';
import { Song } from '@/types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'one' | 'all';
  queue: Song[];
  currentTime: number;
  duration: number;

  setCurrentSong: (song: Song) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'off' | 'one' | 'all') => void;
  setQueue: (queue: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
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

  setCurrentSong: (song) => set({ currentSong: song, isPlaying: true, currentTime: 0 }),

  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setVolume: (volume) => set({ volume }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  setRepeatMode: (mode) => set({ repeatMode: mode }),

  setQueue: (queue) => set({ queue }),

  playNext: () => {
    const { queue, currentSong, repeatMode, isShuffle } = get();
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex(s => s.id === currentSong.id);

    if (repeatMode === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = repeatMode === 'all' ? 0 : currentIndex;
      }
    }

    if (nextIndex !== currentIndex || repeatMode === 'all') {
      set({ currentSong: queue[nextIndex], currentTime: 0, isPlaying: true });
    }
  },

  playPrevious: () => {
    const { queue, currentSong, currentTime } = get();
    if (!currentSong || queue.length === 0) return;

    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;

    set({ currentSong: queue[prevIndex], currentTime: 0, isPlaying: true });
  },

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),

  removeFromQueue: (songId) => set((state) => ({
    queue: state.queue.filter(s => s.id !== songId)
  })),

  clearQueue: () => set({ queue: [] }),
}));
