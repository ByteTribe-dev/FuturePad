import { Theme } from '../types';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#E69A8D',
    primaryLight: '#FFF5F3',
    background: '#FFF9F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#8B8B8B',
    border: '#E8E8E8',
    notification: '#FF6B6B',
    error: '#E74C3C',
    success: '#5CB85C',
    warning: '#FFA726',
    accent: '#E69A8D',
    placeholder: '#B0B0B0',
    icon: '#666666',
    shadow: '#000000',
    divider: '#F0F0F0',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#E69A8D',
    primaryLight: '#3D2A26',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    card: '#383838',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#404040',
    notification: '#FF6B6B',
    error: '#FF6B6B',
    success: '#5CB85C',
    warning: '#FFA726',
    accent: '#E69A8D',
    placeholder: '#888888',
    icon: '#CCCCCC',
    shadow: '#000000',
    divider: '#3A3A3A',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
};