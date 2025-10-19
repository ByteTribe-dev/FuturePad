import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  scheduledDate: Date;
  letterId: string;
  type: 'letter_reminder' | 'letter_unlock' | 'daily_reminder';
}

export class NotificationService {
  private static instance: NotificationService;
  private scheduledNotifications: NotificationData[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Load existing notifications
      await this.loadScheduledNotifications();

      // Set up notification listeners
      this.setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Failed to request notification permissions:', error);
      return false;
    }
  }

  private async loadScheduledNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('scheduled_notifications');
      if (stored) {
        this.scheduledNotifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  }

  private async saveScheduledNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('scheduled_notifications', JSON.stringify(this.scheduledNotifications));
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Handle notification received while app is running
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification response (when user taps on notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification response:', data);
      
      // Handle different notification types
      if (data?.type === 'letter_unlock') {
        // Navigate to read letter screen
        // This will be handled by the navigation service
      }
    });
  }

  async scheduleLetterNotification(letterId: string, title: string, scheduledDate: Date): Promise<string> {
    try {
      const notificationId = `letter_${letterId}_${Date.now()}`;
      
      // Calculate trigger date (1 day before delivery)
      const triggerDate = new Date(scheduledDate);
      triggerDate.setDate(triggerDate.getDate() - 1);

      // Don't schedule if trigger date is in the past
      if (triggerDate <= new Date()) {
        console.warn('Cannot schedule notification in the past');
        return '';
      }

      const notificationData: NotificationData = {
        id: notificationId,
        title: 'Letter Reminder',
        body: `Your letter "${title}" will be unlocked tomorrow!`,
        scheduledDate: triggerDate,
        letterId,
        type: 'letter_reminder',
      };

      // Schedule the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: {
            letterId,
            type: 'letter_reminder',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        } as Notifications.DateTriggerInput,
        identifier: notificationId,
      });

      // Store notification data
      this.scheduledNotifications.push(notificationData);
      await this.saveScheduledNotifications();

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule letter notification:', error);
      return '';
    }
  }

  async scheduleLetterUnlockNotification(letterId: string, title: string, scheduledDate: Date): Promise<string> {
    try {
      const notificationId = `unlock_${letterId}_${Date.now()}`;

      // Don't schedule if date is in the past
      if (scheduledDate <= new Date()) {
        console.warn('Cannot schedule notification in the past');
        return '';
      }

      const notificationData: NotificationData = {
        id: notificationId,
        title: 'Letter Unlocked!',
        body: `Your letter "${title}" is now ready to read!`,
        scheduledDate,
        letterId,
        type: 'letter_unlock',
      };

      // Schedule the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: {
            letterId,
            type: 'letter_unlock',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledDate,
        } as Notifications.DateTriggerInput,
        identifier: notificationId,
      });

      // Store notification data
      this.scheduledNotifications.push(notificationData);
      await this.saveScheduledNotifications();

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule unlock notification:', error);
      return '';
    }
  }

  async scheduleDailyReminder(hour: number = 20, minute: number = 0): Promise<string> {
    try {
      const notificationId = 'daily_reminder';

      // Cancel existing daily reminder
      await this.cancelNotification(notificationId);

      const notificationData: NotificationData = {
        id: notificationId,
        title: 'Daily Reminder',
        body: 'Time to write a letter to your future self!',
        scheduledDate: new Date(), // This will be calculated for daily trigger
        letterId: '',
        type: 'daily_reminder',
      };

      // Schedule daily reminder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: {
            type: 'daily_reminder',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
        identifier: notificationId,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error);
      return '';
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      // Remove from stored notifications
      this.scheduledNotifications = this.scheduledNotifications.filter(
        (notification) => notification.id !== notificationId
      );
      await this.saveScheduledNotifications();
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelLetterNotifications(letterId: string): Promise<void> {
    try {
      const notificationsToCancel = this.scheduledNotifications.filter(
        (notification) => notification.letterId === letterId
      );

      for (const notification of notificationsToCancel) {
        await this.cancelNotification(notification.id);
      }
    } catch (error) {
      console.error('Failed to cancel letter notifications:', error);
    }
  }

  async getAllScheduledNotifications(): Promise<NotificationData[]> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.map((notification) => {
        const storedData = this.scheduledNotifications.find(
          (data) => data.id === notification.identifier
        );
        
        return {
          id: notification.identifier,
          title: notification.content.title || '',
          body: notification.content.body || '',
          scheduledDate: new Date(notification.trigger as any),
          letterId: notification.content.data?.letterId || '',
          type: notification.content.data?.type || 'letter_reminder',
        };
      });
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications = [];
      await this.saveScheduledNotifications();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  }

  async updateNotificationSettings(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('notifications_enabled', JSON.stringify(enabled));
      
      if (!enabled) {
        await this.clearAllNotifications();
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  async getNotificationSettings(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem('notifications_enabled');
      return stored ? JSON.parse(stored) : true;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return true;
    }
  }
}

export const notificationService = NotificationService.getInstance();


