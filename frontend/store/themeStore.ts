import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      setTheme: (mode) => set({ mode }),
      getEffectiveTheme: () => {
        const { mode } = get();
        if (mode === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return mode;
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
