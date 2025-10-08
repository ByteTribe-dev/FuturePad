import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Letter, User } from '../types';

// Conditional imports for Expo Go compatibility
let FileSystem: any = null;
let Sharing: any = null;

try {
  // Try to import these modules, but don't fail if they're not available
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
} catch (error) {
  console.warn('FileSystem and Sharing modules not available in Expo Go');
}

export interface BackupData {
  version: string;
  timestamp: string;
  user: User;
  letters: Letter[];
  settings: any;
  metadata: {
    deviceInfo: string;
    appVersion: string;
    totalLetters: number;
  };
}

export interface BackupOptions {
  includeImages: boolean;
  includeSettings: boolean;
  compressData: boolean;
}

export class BackupService {
  private static instance: BackupService;
  private static readonly BACKUP_KEY = 'app_backup_data';
  private static readonly BACKUP_VERSION = '1.0.0';

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  async createBackup(
    user: User,
    letters: Letter[],
    settings: any,
    options: BackupOptions = {
      includeImages: true,
      includeSettings: true,
      compressData: true,
    }
  ): Promise<string> {
    try {
      const backupData: BackupData = {
        version: BackupService.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        user,
        letters: options.includeImages ? letters : letters.map(letter => ({
          ...letter,
          image: undefined,
        })),
        settings: options.includeSettings ? settings : {},
        metadata: {
          deviceInfo: `${Platform.OS} ${Platform.Version}`,
          appVersion: '1.0.0',
          totalLetters: letters.length,
        },
      };

      const backupString = options.compressData
        ? JSON.stringify(backupData)
        : JSON.stringify(backupData, null, 2);

      // Save to AsyncStorage
      await AsyncStorage.setItem(BackupService.BACKUP_KEY, backupString);

      // Save to file system for sharing (if available)
      if (FileSystem) {
        const fileName = `FeaturePad_Backup_${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, backupString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        return fileUri;
      } else {
        // Return the backup data as string for Expo Go
        return backupString;
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  async restoreBackup(backupData: BackupData): Promise<{
    user: User;
    letters: Letter[];
    settings: any;
  }> {
    try {
      // Validate backup version
      if (backupData.version !== BackupService.BACKUP_VERSION) {
        throw new Error('Incompatible backup version');
      }

      // Validate required data
      if (!backupData.user || !backupData.letters) {
        throw new Error('Invalid backup data');
      }

      // Validate letters data
      const validLetters = backupData.letters.filter(letter => 
        letter.id && letter.title && letter.content && letter.userId
      );

      if (validLetters.length !== backupData.letters.length) {
        console.warn('Some letters were invalid and excluded from restore');
      }

      return {
        user: backupData.user,
        letters: validLetters,
        settings: backupData.settings || {},
      };
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error('Failed to restore backup');
    }
  }

  async loadBackupFromFile(fileUri: string): Promise<BackupData> {
    try {
      let backupString: string;
      
      if (FileSystem) {
        backupString = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else {
        // For Expo Go, assume fileUri is the backup data string
        backupString = fileUri;
      }

      const backupData = JSON.parse(backupString) as BackupData;
      
      // Validate backup data structure
      if (!this.isValidBackupData(backupData)) {
        throw new Error('Invalid backup file format');
      }

      return backupData;
    } catch (error) {
      console.error('Failed to load backup from file:', error);
      throw new Error('Failed to load backup file');
    }
  }

  async exportBackup(fileUri: string): Promise<void> {
    try {
      if (Sharing && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export FeaturePad Backup',
        });
      } else {
        // For Expo Go, we can't share files directly
        // The backup data is already available as a string
        console.log('Backup data ready for export:', fileUri.substring(0, 100) + '...');
        throw new Error('File sharing not available in Expo Go. Use development build for full functionality.');
      }
    } catch (error) {
      console.error('Failed to export backup:', error);
      throw new Error('Failed to export backup');
    }
  }

  async importBackup(fileUri: string): Promise<BackupData> {
    try {
      return await this.loadBackupFromFile(fileUri);
    } catch (error) {
      console.error('Failed to import backup:', error);
      throw new Error('Failed to import backup');
    }
  }

  async getLocalBackup(): Promise<BackupData | null> {
    try {
      const backupString = await AsyncStorage.getItem(BackupService.BACKUP_KEY);
      if (!backupString) return null;

      const backupData = JSON.parse(backupString) as BackupData;
      
      if (!this.isValidBackupData(backupData)) {
        console.warn('Local backup data is corrupted');
        return null;
      }

      return backupData;
    } catch (error) {
      console.error('Failed to get local backup:', error);
      return null;
    }
  }

  async clearLocalBackup(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BackupService.BACKUP_KEY);
    } catch (error) {
      console.error('Failed to clear local backup:', error);
    }
  }

  async scheduleAutoBackup(
    user: User,
    letters: Letter[],
    settings: any,
    intervalHours: number = 24
  ): Promise<void> {
    try {
      // Create backup
      const fileUri = await this.createBackup(user, letters, settings, {
        includeImages: false, // Exclude images for auto backup to save space
        includeSettings: true,
        compressData: true,
      });

      // Schedule next backup
      const nextBackupTime = new Date();
      nextBackupTime.setHours(nextBackupTime.getHours() + intervalHours);
      
      await AsyncStorage.setItem('next_auto_backup', nextBackupTime.toISOString());
      
      console.log(`Auto backup scheduled for ${nextBackupTime.toISOString()}`);
    } catch (error) {
      console.error('Failed to schedule auto backup:', error);
    }
  }

  async checkAutoBackup(
    user: User,
    letters: Letter[],
    settings: any
  ): Promise<boolean> {
    try {
      const nextBackupTimeString = await AsyncStorage.getItem('next_auto_backup');
      if (!nextBackupTimeString) return false;

      const nextBackupTime = new Date(nextBackupTimeString);
      const now = new Date();

      if (now >= nextBackupTime) {
        await this.scheduleAutoBackup(user, letters, settings);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check auto backup:', error);
      return false;
    }
  }

  private isValidBackupData(data: any): data is BackupData {
    return (
      data &&
      typeof data.version === 'string' &&
      typeof data.timestamp === 'string' &&
      data.user &&
      Array.isArray(data.letters) &&
      data.metadata &&
      typeof data.metadata.totalLetters === 'number'
    );
  }

  async getBackupInfo(fileUri: string): Promise<{
    size: number;
    created: string;
    lettersCount: number;
    hasImages: boolean;
  }> {
    try {
      let size = 0;
      
      if (FileSystem) {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          throw new Error('Backup file not found');
        }
        size = fileInfo.size || 0;
      } else {
        // For Expo Go, estimate size from string length
        size = fileUri.length;
      }

      const backupData = await this.loadBackupFromFile(fileUri);
      
      return {
        size,
        created: backupData.timestamp,
        lettersCount: backupData.letters.length,
        hasImages: backupData.letters.some(letter => letter.image),
      };
    } catch (error) {
      console.error('Failed to get backup info:', error);
      throw new Error('Failed to get backup info');
    }
  }

  async validateBackupIntegrity(backupData: BackupData): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check version compatibility
      if (backupData.version !== BackupService.BACKUP_VERSION) {
        issues.push(`Version mismatch: ${backupData.version} vs ${BackupService.BACKUP_VERSION}`);
      }

      // Check required fields
      if (!backupData.user?.id) {
        issues.push('Missing user ID');
      }

      if (!backupData.letters || !Array.isArray(backupData.letters)) {
        issues.push('Invalid letters data');
      } else {
        // Check letter integrity
        backupData.letters.forEach((letter, index) => {
          if (!letter.id) issues.push(`Letter ${index}: Missing ID`);
          if (!letter.title) issues.push(`Letter ${index}: Missing title`);
          if (!letter.content) issues.push(`Letter ${index}: Missing content`);
          if (!letter.userId) issues.push(`Letter ${index}: Missing user ID`);
          if (!letter.scheduledDate) issues.push(`Letter ${index}: Missing scheduled date`);
          if (!letter.mood) issues.push(`Letter ${index}: Missing mood`);
        });
      }

      // Check metadata
      if (!backupData.metadata?.totalLetters) {
        issues.push('Missing metadata');
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Validation error: ${error.message}`);
      return {
        isValid: false,
        issues,
      };
    }
  }
}

export const backupService = BackupService.getInstance();
