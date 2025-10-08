import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { notificationService } from '../services/notificationService';
import { AppSettings, Language, LanguageOption, ThemeMode } from '../types';

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

interface SettingsState extends AppSettings {
  // Notification settings
  dailyReminderEnabled: boolean;
  dailyReminderTime: { hour: number; minute: number };
  letterReminderEnabled: boolean;
  unlockNotificationEnabled: boolean;
  
  // Privacy settings
  biometricAuth: boolean;
  autoSave: boolean;
  dataBackup: boolean;
  
  // App preferences
  fontSize: 'small' | 'medium' | 'large';
  hapticFeedback: boolean;
  soundEffects: boolean;
  
  // Actions
  updateTheme: (theme: ThemeMode) => void;
  updateLanguage: (language: Language) => void;
  updateNotificationSettings: (settings: {
    dailyReminderEnabled?: boolean;
    dailyReminderTime?: { hour: number; minute: number };
    letterReminderEnabled?: boolean;
    unlockNotificationEnabled?: boolean;
  }) => Promise<void>;
  updatePrivacySettings: (settings: {
    biometricAuth?: boolean;
    autoSave?: boolean;
    dataBackup?: boolean;
  }) => void;
  updateAppPreferences: (settings: {
    fontSize?: 'small' | 'medium' | 'large';
    hapticFeedback?: boolean;
    soundEffects?: boolean;
  }) => void;
  resetToDefaults: () => Promise<void>;
  exportSettings: () => AppSettings;
  importSettings: (settings: AppSettings) => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  isOnboardingCompleted: false,
  theme: 'system',
  language: 'en',
  notifications: true,
  biometricAuth: false,
  autoSave: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default settings
      ...DEFAULT_SETTINGS,
      dailyReminderEnabled: true,
      dailyReminderTime: { hour: 20, minute: 0 },
      letterReminderEnabled: true,
      unlockNotificationEnabled: true,
      dataBackup: false,
      fontSize: 'medium',
      hapticFeedback: true,
      soundEffects: true,
      
      // Theme management
      updateTheme: (theme: ThemeMode) => {
        set({ theme });
      },
      
      // Language management
      updateLanguage: (language: Language) => {
        set({ language });
      },
      
      // Notification settings
      updateNotificationSettings: async (settings) => {
        const currentSettings = get();
        const newSettings = {
          ...currentSettings,
          ...settings,
        };
        
        set(newSettings);
        
        // Update notification service
        try {
          if (settings.dailyReminderEnabled !== undefined) {
            if (settings.dailyReminderEnabled) {
              await notificationService.scheduleDailyReminder(
                settings.dailyReminderTime?.hour || currentSettings.dailyReminderTime.hour,
                settings.dailyReminderTime?.minute || currentSettings.dailyReminderTime.minute
              );
            } else {
              await notificationService.cancelNotification('daily_reminder');
            }
          }
          
          if (settings.dailyReminderTime && currentSettings.dailyReminderEnabled) {
            await notificationService.scheduleDailyReminder(
              settings.dailyReminderTime.hour,
              settings.dailyReminderTime.minute
            );
          }
          
          await notificationService.updateNotificationSettings(
            settings.letterReminderEnabled !== false && 
            settings.unlockNotificationEnabled !== false
          );
        } catch (error) {
          console.error('Failed to update notification settings:', error);
        }
      },
      
      // Privacy settings
      updatePrivacySettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },
      
      // App preferences
      updateAppPreferences: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },
      
      // Reset to defaults
      resetToDefaults: async () => {
        try {
          // Cancel all notifications
          await notificationService.clearAllNotifications();
          
          // Reset settings
          set({
            ...DEFAULT_SETTINGS,
            dailyReminderEnabled: true,
            dailyReminderTime: { hour: 20, minute: 0 },
            letterReminderEnabled: true,
            unlockNotificationEnabled: true,
            dataBackup: false,
            fontSize: 'medium',
            hapticFeedback: true,
            soundEffects: true,
          });
          
          // Reschedule daily reminder
          await notificationService.scheduleDailyReminder(20, 0);
        } catch (error) {
          console.error('Failed to reset settings:', error);
        }
      },
      
      // Export settings
      exportSettings: () => {
        const state = get();
        return {
          isOnboardingCompleted: state.isOnboardingCompleted,
          theme: state.theme,
          language: state.language,
          notifications: state.notifications,
          biometricAuth: state.biometricAuth,
          autoSave: state.autoSave,
        };
      },
      
      // Import settings
      importSettings: async (settings: AppSettings) => {
        try {
          set((state) => ({ ...state, ...settings }));
          
          // Update notifications if needed
          if (settings.notifications) {
            await notificationService.scheduleDailyReminder(20, 0);
          } else {
            await notificationService.cancelNotification('daily_reminder');
          }
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist all settings except sensitive data
      partialize: (state) => ({
        isOnboardingCompleted: state.isOnboardingCompleted,
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
        biometricAuth: state.biometricAuth,
        autoSave: state.autoSave,
        dailyReminderEnabled: state.dailyReminderEnabled,
        dailyReminderTime: state.dailyReminderTime,
        letterReminderEnabled: state.letterReminderEnabled,
        unlockNotificationEnabled: state.unlockNotificationEnabled,
        dataBackup: state.dataBackup,
        fontSize: state.fontSize,
        hapticFeedback: state.hapticFeedback,
        soundEffects: state.soundEffects,
      }),
    }
  )
);

// Selectors for better performance
export const useSettings = () => useSettingsStore((state) => ({
  isOnboardingCompleted: state.isOnboardingCompleted,
  theme: state.theme,
  language: state.language,
  notifications: state.notifications,
  biometricAuth: state.biometricAuth,
  autoSave: state.autoSave,
}));

export const useNotificationSettings = () => useSettingsStore((state) => ({
  dailyReminderEnabled: state.dailyReminderEnabled,
  dailyReminderTime: state.dailyReminderTime,
  letterReminderEnabled: state.letterReminderEnabled,
  unlockNotificationEnabled: state.unlockNotificationEnabled,
}));

export const useAppPreferences = () => useSettingsStore((state) => ({
  fontSize: state.fontSize,
  hapticFeedback: state.hapticFeedback,
  soundEffects: state.soundEffects,
  dataBackup: state.dataBackup,
}));

export const useSettingsActions = () => useSettingsStore((state) => ({
  updateTheme: state.updateTheme,
  updateLanguage: state.updateLanguage,
  updateNotificationSettings: state.updateNotificationSettings,
  updatePrivacySettings: state.updatePrivacySettings,
  updateAppPreferences: state.updateAppPreferences,
  resetToDefaults: state.resetToDefaults,
  exportSettings: state.exportSettings,
  importSettings: state.importSettings,
}));

