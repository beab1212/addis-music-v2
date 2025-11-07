import { create } from 'zustand';
import { authClient } from "@/lib/auth-client";
import { mockUser } from '@/utils/mockData';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup';

  login: (email: string, password: string, provider: string | null) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setSession: (session: any | null) => void;
  // updateUser: (updates: Partial<User>) => void;
  openAuthModal: (mode: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    user:  null,
    isAuthenticated: false,
    isAuthModalOpen: false,
    authMode: 'signin',

    login: async (email: string, password: string, provider: string | null = null) => {
      let data;
      try {
        if (provider) {
            if (provider === 'google') {
                data = await authClient.signIn.social({
                    provider: "google",
                });
            }
        } else {
          data = await authClient.signIn.email({
              email: email, // required
              password: password, // required
              callbackURL: "http://localhost:3000/app",
          });
        }
      } catch (error: any) {
        throw new Error(error.message);
      }
      set({
          user: data?.data && 'user' in data.data ? (data.data as any).user : null,
          isAuthenticated: true,
          isAuthModalOpen: false
      });
    },

    signup: async (username: string, email: string, password: string) => {
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const { data, error } = await authClient.signUp.email({
          name: "John Doe", // required
          email: email, // required
          password: password, // required
          callbackURL: "http://localhost:3000/",
      });
      if (error) {
        throw new Error(error.message);
      }


      set({
        user: { ...mockUser, username, email },
        isAuthenticated: true,
        isAuthModalOpen: false
      });
    },

    logout: async () => {
      await authClient.signOut();
      set({ user: null, isAuthenticated: false });
    },

    setSession: (session) => {
      if (session && session.user) {
        set({ user: session.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    },

    openAuthModal: (mode) => set({ isAuthModalOpen: true, authMode: mode }),

    closeAuthModal: () => set({ isAuthModalOpen: false }),

    setAuthMode: (mode) => set({ authMode: mode }),
  })
);
