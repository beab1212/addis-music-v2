import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { mockUser } from '@/utils/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup';

  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      authMode: 'signin',

      login: async (email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({
          user: { ...mockUser, email },
          isAuthenticated: true,
          isAuthModalOpen: false
        });
      },

      signup: async (username: string, email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        set({
          user: { ...mockUser, username, email },
          isAuthenticated: true,
          isAuthModalOpen: false
        });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      openAuthModal: (mode) => set({ isAuthModalOpen: true, authMode: mode }),

      closeAuthModal: () => set({ isAuthModalOpen: false }),

      setAuthMode: (mode) => set({ authMode: mode }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
