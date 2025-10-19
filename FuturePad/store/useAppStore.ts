import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppSettings, Language, LanguageOption, ThemeMode, User } from "../types";

// Available languages
export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
];

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  user: User | null;
  authToken: string | null;
  setAuthData: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;

  // Onboarding
  isOnboardingCompleted: boolean;
  setIsOnboardingCompleted: (completed: boolean) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Language
  language: Language;
  setLanguage: (language: Language) => void;
  getAvailableLanguages: () => LanguageOption[];

  // App Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // App State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Reset app state
  resetApp: () => void;
}

const defaultSettings: AppSettings = {
  isOnboardingCompleted: false,
  theme: "system",
  language: "en",
  notifications: true,
  biometricAuth: false,
  autoSave: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Authentication
      isAuthenticated: false,
      user: null,
      authToken: null,
      setAuthData: (token: string, user: User) => {
        set({
          isAuthenticated: true,
          user,
          authToken: token,
        });
      },
      updateUser: (updatedUser: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      },
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          authToken: null,
        });
      },

      // Onboarding
      isOnboardingCompleted: false,
      setIsOnboardingCompleted: (completed: boolean) => {
        set({ isOnboardingCompleted: completed });
        // Also update settings
        get().updateSettings({ isOnboardingCompleted: completed });
      },

      // Theme
      theme: "system",
      setTheme: (theme: ThemeMode) => {
        set({ theme });
        get().updateSettings({ theme });
      },

      // Language
      language: "en",
      setLanguage: (language: Language) => {
        set({ language });
        get().updateSettings({ language });
      },
      getAvailableLanguages: () => AVAILABLE_LANGUAGES,

      // App Settings
      settings: defaultSettings,
      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // App State
      isLoading: false,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      // Error handling
      error: null,
      setError: (error: string | null) => set({ error }),

      // Reset app state
      resetApp: () => {
        set({
          isAuthenticated: false,
          user: null,
          authToken: null,
          isOnboardingCompleted: false,
          theme: "system",
          language: "en",
          settings: defaultSettings,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        authToken: state.authToken,
        isOnboardingCompleted: state.isOnboardingCompleted,
        theme: state.theme,
        language: state.language,
        settings: state.settings,
      }),
    }
  )
);

// Selectors for better performance
export const useOnboarding = () =>
  useAppStore((state) => ({
    isOnboardingCompleted: state.isOnboardingCompleted,
    setIsOnboardingCompleted: state.setIsOnboardingCompleted,
  }));

export const useTheme = () =>
  useAppStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
  }));

export const useLanguage = () =>
  useAppStore((state) => ({
    language: state.language,
    setLanguage: state.setLanguage,
    getAvailableLanguages: state.getAvailableLanguages,
  }));

export const useAppSettings = () =>
  useAppStore((state) => ({
    settings: state.settings,
    updateSettings: state.updateSettings,
  }));

export const useAppState = () =>
  useAppStore((state) => ({
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    error: state.error,
    setError: state.setError,
  }));
// Stable selectors - only select data, not functions
export const useAuthData = () =>
  useAppStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    authToken: state.authToken,
  }));

// Individual selectors for better performance
export const useIsAuthenticated = () =>
  useAppStore((state) => state.isAuthenticated);
export const useUser = () => useAppStore((state) => state.user);
export const useAuthToken = () => useAppStore((state) => state.authToken);
