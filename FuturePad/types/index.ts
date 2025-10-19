export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profileImage?: string;
}

export interface Letter {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'sad' | 'calm' | 'reflective' | 'excited' | 'grateful' | 'anxious' | 'refresh';
  scheduledDate: Date;
  isDelivered: boolean;
  createdAt: Date;
  userId: string;
  image?: string;
  caption?: string;
  progress?: number; // For locked letters progress
}

export type Mood = {
  emoji: string;
  label: string;
  value: 'happy' | 'sad' | 'calm' | 'reflective' | 'excited' | 'grateful' | 'anxious' | 'refresh';
};

export type ThemeMode = 'system' | 'light' | 'dark';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryLight: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    accent: string;
    placeholder: string;
    icon: string;
    shadow: string;
    divider: string;
    overlay: string;
  };
}

export interface AppSettings {
  isOnboardingCompleted: boolean;
  theme: ThemeMode;
  language: Language;
  notifications: boolean;
  biometricAuth: boolean;
  autoSave: boolean;
}