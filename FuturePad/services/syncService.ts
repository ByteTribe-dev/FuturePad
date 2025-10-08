import AsyncStorage from '@react-native-async-storage/async-storage';
import { Letter, User } from '../types';
import { backupService } from './backupService';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  lastError: string | null;
}

export interface SyncOptions {
  syncLetters: boolean;
  syncSettings: boolean;
  syncUser: boolean;
  forceSync: boolean;
}

export class SyncService {
  private static instance: SyncService;
  private static readonly SYNC_KEY = 'sync_data';
  private static readonly LAST_SYNC_KEY = 'last_sync_time';
  private static readonly PENDING_CHANGES_KEY = 'pending_changes';

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize sync status
      await this.updateSyncStatus({
        isOnline: await this.checkConnectivity(),
        lastSyncTime: await this.getLastSyncTime(),
        pendingChanges: await this.getPendingChangesCount(),
        syncInProgress: false,
        lastError: null,
      });

      // Start periodic sync
      this.startPeriodicSync();
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  async syncData(
    user: User,
    letters: Letter[],
    settings: any,
    options: SyncOptions = {
      syncLetters: true,
      syncSettings: true,
      syncUser: true,
      forceSync: false,
    }
  ): Promise<boolean> {
    try {
      const syncStatus = await this.getSyncStatus();
      
      if (syncStatus.syncInProgress && !options.forceSync) {
        console.log('Sync already in progress');
        return false;
      }

      if (!syncStatus.isOnline && !options.forceSync) {
        console.log('Device is offline, sync will be queued');
        await this.queuePendingChanges(letters, settings);
        return false;
      }

      await this.updateSyncStatus({ ...syncStatus, syncInProgress: true });

      // Create local backup before sync
      await backupService.createBackup(user, letters, settings, {
        includeImages: false,
        includeSettings: true,
        compressData: true,
      });

      // Simulate sync process (replace with actual cloud sync)
      const syncSuccess = await this.performCloudSync(user, letters, settings, options);

      if (syncSuccess) {
        await this.updateSyncStatus({
          isOnline: true,
          lastSyncTime: new Date(),
          pendingChanges: 0,
          syncInProgress: false,
          lastError: null,
        });

        await this.clearPendingChanges();
        return true;
      } else {
        await this.updateSyncStatus({
          ...syncStatus,
          syncInProgress: false,
          lastError: 'Sync failed',
        });
        return false;
      }
    } catch (error) {
      console.error('Sync failed:', error);
      await this.updateSyncStatus({
        isOnline: await this.checkConnectivity(),
        lastSyncTime: await this.getLastSyncTime(),
        pendingChanges: await this.getPendingChangesCount(),
        syncInProgress: false,
        lastError: error.message,
      });
      return false;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const stored = await AsyncStorage.getItem(SyncService.SYNC_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          lastSyncTime: data.lastSyncTime ? new Date(data.lastSyncTime) : null,
        };
      }

      return {
        isOnline: false,
        lastSyncTime: null,
        pendingChanges: 0,
        syncInProgress: false,
        lastError: null,
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        isOnline: false,
        lastSyncTime: null,
        pendingChanges: 0,
        syncInProgress: false,
        lastError: error.message,
      };
    }
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      // In a real app, you would use NetInfo or similar
      // For now, we'll simulate connectivity check
      return Math.random() > 0.1; // 90% chance of being online
    } catch (error) {
      console.error('Failed to check connectivity:', error);
      return false;
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const stored = await AsyncStorage.getItem(SyncService.LAST_SYNC_KEY);
      return stored ? new Date(stored) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  async getPendingChangesCount(): Promise<number> {
    try {
      const stored = await AsyncStorage.getItem(SyncService.PENDING_CHANGES_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Failed to get pending changes count:', error);
      return 0;
    }
  }

  async queuePendingChanges(letters: Letter[], settings: any): Promise<void> {
    try {
      const currentCount = await this.getPendingChangesCount();
      const newCount = currentCount + 1;
      
      await AsyncStorage.setItem(SyncService.PENDING_CHANGES_KEY, newCount.toString());
      
      // Store pending data for later sync
      const pendingData = {
        timestamp: new Date().toISOString(),
        letters: letters.map(letter => ({
          id: letter.id,
          title: letter.title,
          content: letter.content,
          mood: letter.mood,
          scheduledDate: letter.scheduledDate,
          userId: letter.userId,
        })),
        settings,
      };
      
      await AsyncStorage.setItem('pending_sync_data', JSON.stringify(pendingData));
    } catch (error) {
      console.error('Failed to queue pending changes:', error);
    }
  }

  async clearPendingChanges(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SyncService.PENDING_CHANGES_KEY);
      await AsyncStorage.removeItem('pending_sync_data');
    } catch (error) {
      console.error('Failed to clear pending changes:', error);
    }
  }

  async getPendingSyncData(): Promise<any> {
    try {
      const stored = await AsyncStorage.getItem('pending_sync_data');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get pending sync data:', error);
      return null;
    }
  }

  private async performCloudSync(
    user: User,
    letters: Letter[],
    settings: any,
    options: SyncOptions
  ): Promise<boolean> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate sync operations
      if (options.syncUser) {
        console.log('Syncing user data:', user.id);
      }

      if (options.syncLetters) {
        console.log('Syncing letters:', letters.length);
      }

      if (options.syncSettings) {
        console.log('Syncing settings');
      }

      // Simulate 95% success rate
      return Math.random() > 0.05;
    } catch (error) {
      console.error('Cloud sync failed:', error);
      return false;
    }
  }

  private async updateSyncStatus(status: Partial<SyncStatus>): Promise<void> {
    try {
      const currentStatus = await this.getSyncStatus();
      const newStatus = { ...currentStatus, ...status };
      
      await AsyncStorage.setItem(SyncService.SYNC_KEY, JSON.stringify(newStatus));
      
      if (status.lastSyncTime) {
        await AsyncStorage.setItem(
          SyncService.LAST_SYNC_KEY,
          status.lastSyncTime.toISOString()
        );
      }
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  private startPeriodicSync(): void {
    // Check for connectivity and sync every 5 minutes
    setInterval(async () => {
      try {
        const isOnline = await this.checkConnectivity();
        const syncStatus = await this.getSyncStatus();
        
        await this.updateSyncStatus({ isOnline });
        
        // Auto-sync if online and there are pending changes
        if (isOnline && syncStatus.pendingChanges > 0 && !syncStatus.syncInProgress) {
          console.log('Auto-syncing pending changes...');
          // Trigger auto-sync (this would be handled by the app state)
        }
      } catch (error) {
        console.error('Periodic sync check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  async forceSync(
    user: User,
    letters: Letter[],
    settings: any
  ): Promise<boolean> {
    return this.syncData(user, letters, settings, {
      syncLetters: true,
      syncSettings: true,
      syncUser: true,
      forceSync: true,
    });
  }

  async syncOnlyLetters(letters: Letter[]): Promise<boolean> {
    // This would sync only letters data
    // Implementation depends on your cloud service
    return true;
  }

  async syncOnlySettings(settings: any): Promise<boolean> {
    // This would sync only settings data
    // Implementation depends on your cloud service
    return true;
  }

  async getSyncHistory(): Promise<Array<{
    timestamp: Date;
    type: 'auto' | 'manual' | 'force';
    success: boolean;
    error?: string;
  }>> {
    try {
      const stored = await AsyncStorage.getItem('sync_history');
      if (stored) {
        const history = JSON.parse(stored);
        return history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to get sync history:', error);
      return [];
    }
  }

  async addSyncHistoryEntry(
    type: 'auto' | 'manual' | 'force',
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      const history = await this.getSyncHistory();
      const newEntry = {
        timestamp: new Date(),
        type,
        success,
        error,
      };
      
      history.unshift(newEntry);
      
      // Keep only last 50 entries
      if (history.length > 50) {
        history.splice(50);
      }
      
      await AsyncStorage.setItem('sync_history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to add sync history entry:', error);
    }
  }
}

export const syncService = SyncService.getInstance();


