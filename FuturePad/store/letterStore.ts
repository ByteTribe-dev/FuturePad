import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { notificationService } from '../services/notificationService';
import { Letter, Mood } from '../types';

// Available moods based on the design
export const AVAILABLE_MOODS: Mood[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '🤔', label: 'Reflective', value: 'reflective' },
  { emoji: '🤩', label: 'Excited', value: 'excited' },
  { emoji: '🙏', label: 'Grateful', value: 'grateful' },
  { emoji: '✨', label: 'Hopeful', value: 'hopeful' },
];

interface LetterState {
  // Letters data
  letters: Letter[];
  
  // CRUD operations
  addLetter: (letter: Omit<Letter, 'id' | 'createdAt' | 'isDelivered'>) => Promise<string>;
  updateLetter: (id: string, updates: Partial<Letter>) => Promise<void>;
  deleteLetter: (id: string) => Promise<void>;
  getLetterById: (id: string) => Letter | undefined;
  
  // Filtered queries
  getLettersByUser: (userId: string) => Letter[];
  getDeliveredLetters: (userId: string) => Letter[];
  getUpcomingLetters: (userId: string) => Letter[];
  getLockedLetters: (userId: string) => Letter[];
  
  // Search and filter
  searchLetters: (userId: string, query: string) => Letter[];
  getLettersByMood: (userId: string, mood: Letter['mood']) => Letter[];
  getLettersByDateRange: (userId: string, startDate: Date, endDate: Date) => Letter[];
  
  // Statistics
  getLetterStats: (userId: string) => {
    total: number;
    delivered: number;
    upcoming: number;
    locked: number;
    byMood: Record<string, number>;
  };
  
  // Utility functions
  calculateProgress: (letter: Letter) => number;
  getDaysUntilDelivery: (letter: Letter) => number;
  
  // Bulk operations
  clearAllLetters: () => Promise<void>;
  exportLetters: (userId: string) => Letter[];
  importLetters: (letters: Letter[]) => Promise<void>;
  
  // State management
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useLetterStore = create<LetterState>()(
  persist(
    (set, get) => ({
      letters: [],
      
      // CRUD operations
      addLetter: async (letterData) => {
        try {
          get().setIsLoading(true);
          get().setError(null);
          
          const newLetter: Letter = {
            ...letterData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            isDelivered: new Date() >= letterData.scheduledDate,
            progress: get().calculateProgress({
              ...letterData,
              id: '',
              createdAt: new Date(),
              isDelivered: false,
            }),
          };
          
          set((state) => ({
            letters: [...state.letters, newLetter],
          }));
          
          // Schedule notifications for the new letter
          try {
            await notificationService.scheduleLetterNotification(
              newLetter.id,
              newLetter.title,
              newLetter.scheduledDate
            );
            await notificationService.scheduleLetterUnlockNotification(
              newLetter.id,
              newLetter.title,
              newLetter.scheduledDate
            );
          } catch (notificationError) {
            console.warn('Failed to schedule notifications for letter:', notificationError);
          }
          
          return newLetter.id;
        } catch (error) {
          get().setError('Failed to add letter');
          throw error;
        } finally {
          get().setIsLoading(false);
        }
      },
      
      updateLetter: async (id: string, updates: Partial<Letter>) => {
        try {
          get().setIsLoading(true);
          get().setError(null);
          
          set((state) => ({
            letters: state.letters.map((letter) =>
              letter.id === id
                ? { ...letter, ...updates, progress: get().calculateProgress({ ...letter, ...updates }) }
                : letter
            ),
          }));
        } catch (error) {
          get().setError('Failed to update letter');
          throw error;
        } finally {
          get().setIsLoading(false);
        }
      },
      
      deleteLetter: async (id: string) => {
        try {
          get().setIsLoading(true);
          get().setError(null);
          
          // Cancel notifications for this letter
          try {
            await notificationService.cancelLetterNotifications(id);
          } catch (notificationError) {
            console.warn('Failed to cancel notifications for letter:', notificationError);
          }
          
          set((state) => ({
            letters: state.letters.filter((letter) => letter.id !== id),
          }));
        } catch (error) {
          get().setError('Failed to delete letter');
          throw error;
        } finally {
          get().setIsLoading(false);
        }
      },
      
      getLetterById: (id: string) => {
        return get().letters.find((letter) => letter.id === id);
      },
      
      // Filtered queries
      getLettersByUser: (userId: string) => {
        return get().letters.filter((letter) => letter.userId === userId);
      },
      
      getDeliveredLetters: (userId: string) => {
        return get().letters.filter(
          (letter) =>
            letter.userId === userId &&
            (letter.isDelivered || new Date() >= letter.scheduledDate)
        );
      },
      
      getUpcomingLetters: (userId: string) => {
        return get().letters.filter(
          (letter) =>
            letter.userId === userId &&
            !letter.isDelivered &&
            new Date() < letter.scheduledDate
        );
      },
      
      getLockedLetters: (userId: string) => {
        return get().letters.filter(
          (letter) =>
            letter.userId === userId &&
            !letter.isDelivered &&
            new Date() < letter.scheduledDate
        );
      },
      
      // Search and filter
      searchLetters: (userId: string, query: string) => {
        const userLetters = get().getLettersByUser(userId);
        const lowercaseQuery = query.toLowerCase();
        
        return userLetters.filter(
          (letter) =>
            letter.title.toLowerCase().includes(lowercaseQuery) ||
            letter.content.toLowerCase().includes(lowercaseQuery) ||
            letter.caption?.toLowerCase().includes(lowercaseQuery)
        );
      },
      
      getLettersByMood: (userId: string, mood: Letter['mood']) => {
        return get().letters.filter(
          (letter) => letter.userId === userId && letter.mood === mood
        );
      },
      
      getLettersByDateRange: (userId: string, startDate: Date, endDate: Date) => {
        return get().letters.filter(
          (letter) =>
            letter.userId === userId &&
            letter.scheduledDate >= startDate &&
            letter.scheduledDate <= endDate
        );
      },
      
      // Statistics
      getLetterStats: (userId: string) => {
        const userLetters = get().getLettersByUser(userId);
        const delivered = get().getDeliveredLetters(userId).length;
        const upcoming = get().getUpcomingLetters(userId).length;
        const locked = get().getLockedLetters(userId).length;
        
        const byMood = userLetters.reduce((acc, letter) => {
          acc[letter.mood] = (acc[letter.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          total: userLetters.length,
          delivered,
          upcoming,
          locked,
          byMood,
        };
      },
      
      // Utility functions
      calculateProgress: (letter: Letter) => {
        const now = new Date();
        const created = letter.createdAt;
        const scheduled = letter.scheduledDate;
        
        if (now >= scheduled) return 100;
        
        const totalDuration = scheduled.getTime() - created.getTime();
        const elapsedDuration = now.getTime() - created.getTime();
        
        return Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100);
      },
      
      getDaysUntilDelivery: (letter: Letter) => {
        const now = new Date();
        const scheduled = letter.scheduledDate;
        const diffTime = scheduled.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },
      
      // Bulk operations
      clearAllLetters: async () => {
        try {
          get().setIsLoading(true);
          get().setError(null);
          set({ letters: [] });
        } catch (error) {
          get().setError('Failed to clear letters');
          throw error;
        } finally {
          get().setIsLoading(false);
        }
      },
      
      exportLetters: (userId: string) => {
        return get().getLettersByUser(userId);
      },
      
      importLetters: async (letters: Letter[]) => {
        try {
          get().setIsLoading(true);
          get().setError(null);
          
          // Validate letters before importing
          const validLetters = letters.filter((letter) => 
            letter.id && letter.title && letter.content && letter.userId
          );
          
          set((state) => ({
            letters: [...state.letters, ...validLetters],
          }));
        } catch (error) {
          get().setError('Failed to import letters');
          throw error;
        } finally {
          get().setIsLoading(false);
        }
      },
      
      // State management
      isLoading: false,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      
      error: null,
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'letter-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist letters data
      partialize: (state) => ({
        letters: state.letters,
      }),
    }
  )
);

// Selectors for better performance
export const useLetters = () => useLetterStore((state) => ({
  letters: state.letters,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useLetterActions = () => useLetterStore((state) => ({
  addLetter: state.addLetter,
  updateLetter: state.updateLetter,
  deleteLetter: state.deleteLetter,
  getLetterById: state.getLetterById,
}));

export const useLetterQueries = () => useLetterStore((state) => ({
  getLettersByUser: state.getLettersByUser,
  getDeliveredLetters: state.getDeliveredLetters,
  getUpcomingLetters: state.getUpcomingLetters,
  getLockedLetters: state.getLockedLetters,
  searchLetters: state.searchLetters,
  getLettersByMood: state.getLettersByMood,
  getLettersByDateRange: state.getLettersByDateRange,
  getLetterStats: state.getLetterStats,
}));

export const useLetterUtils = () => useLetterStore((state) => ({
  calculateProgress: state.calculateProgress,
  getDaysUntilDelivery: state.getDaysUntilDelivery,
  clearAllLetters: state.clearAllLetters,
  exportLetters: state.exportLetters,
  importLetters: state.importLetters,
}));