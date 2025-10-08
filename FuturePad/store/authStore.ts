import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
}

// Default user for the app (local-first)
const DEFAULT_USER: User = {
  id: 'local-user',
  firstName: 'User',
  lastName: '',
  email: 'user@featurepad.app',
  profileImage: undefined,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      isAuthenticated: true,
      hasCompletedOnboarding: false,
      login: async (email: string, password: string) => {
        // Local-first login
        const localUser: User = {
          id: 'local-user',
          firstName: email.split('@')[0] || 'User',
          lastName: '',
          email: email,
          profileImage: undefined
        };
        set({ user: localUser, isAuthenticated: true });
      },
      signup: async (firstName: string, lastName: string, email: string, password: string) => {
        // Local-first signup
        const localUser: User = {
          id: 'local-user',
          firstName,
          lastName,
          email,
          profileImage: undefined,
        };
        set({ user: localUser, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);