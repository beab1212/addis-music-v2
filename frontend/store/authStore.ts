import { create } from 'zustand';
import { authClient } from "@/lib/auth-client";
import { mockUser } from '@/utils/mockData';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup';

  login: (email: string, password: string, provider: string | null) => Promise<any | null>;
  signup: (name: string, email: string, password: string) => Promise<void>;
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
      try {
        let response;
        if (provider) {
          if (provider === "google") {
            response = await authClient.signIn.social({
              provider: "google",
            });
          } else {
            throw new Error(`Unsupported provider: ${provider}`);
          }
        }
        else {
          response = await authClient.signIn.email({
            email,
            password,
            callbackURL: "http://localhost:3000/app",
          });
        }

        const { data, error } = response;

        if (error) {
          throw new Error(error.message || "Login failed");
        }

        const user = data && 'user' in data ? (data as { user: any }).user : null;

        set({
          user: user,
          isAuthenticated: !!user,
          isAuthModalOpen: false,
        });

        return user;
      } catch (err: any) {
        console.error("Login error:", err);
        throw new Error(err.message || "Unexpected login error");
      }
    },


    signup: async (name: string, email: string, password: string) => {
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const { data, error } = await authClient.signUp.email({
          name: name, // required
          email: email, // required
          password: password, // required
          callbackURL: "http://localhost:3000/",
      });
      if (error) {
        throw new Error(error.message);
      }
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
