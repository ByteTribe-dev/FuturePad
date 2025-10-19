import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomScreenHeader } from '../components/CustomScreenHeader';
import { useTheme } from '../theme/ThemeContext';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [settings, setSettings] = useState({
    letterReminders: true,
    unlockNotifications: true,
    dailyReminders: false,
    weeklyDigest: true,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const notificationSettings: NotificationSetting[] = [
    {
      id: 'letterReminders',
      title: 'Letter Reminders',
      description: 'Get notified when your letters are ready to be unlocked',
      enabled: settings.letterReminders,
      onToggle: (enabled) => updateSetting('letterReminders', enabled),
    },
    {
      id: 'unlockNotifications',
      title: 'Unlock Notifications',
      description: 'Notifications when letters become available to read',
      enabled: settings.unlockNotifications,
      onToggle: (enabled) => updateSetting('unlockNotifications', enabled),
    },
    {
      id: 'dailyReminders',
      title: 'Daily Reminders',
      description: 'Daily prompts to write new letters',
      enabled: settings.dailyReminders,
      onToggle: (enabled) => updateSetting('dailyReminders', enabled),
    },
    {
      id: 'weeklyDigest',
      title: 'Weekly Digest',
      description: 'Weekly summary of your letter activity',
      enabled: settings.weeklyDigest,
      onToggle: (enabled) => updateSetting('weeklyDigest', enabled),
    },
  ];

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'This will cancel all scheduled notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Clear all notifications logic here
            console.log('Clear all notifications');
          },
        },
      ]
    );
  };

  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <CustomScreenHeader
          title="Notifications"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Notification Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Notification Preferences</Text>
            <View style={styles.settingsContainer}>
              {notificationSettings.map((setting) => (
                <View key={setting.id} style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Ionicons 
                      name="notifications" 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                    <View style={styles.settingTextContainer}>
                      <Text style={styles.settingTitle}>{setting.title}</Text>
                      <Text style={styles.settingDescription}>{setting.description}</Text>
                    </View>
                  </View>
                  <Switch
                    value={setting.enabled}
                    onValueChange={setting.onToggle}
                    trackColor={{
                      false: theme.colors.border,
                      true: theme.colors.primary,
                    }}
                    thumbColor={setting.enabled ? '#FFFFFF' : theme.colors.textSecondary}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleClearAllNotifications}
              >
                <View style={styles.actionLeft}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>
                    Clear All Notifications
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>About Notifications</Text>
                <Text style={styles.infoDescription}>
                  Notifications help you stay connected with your letters. You can customize 
                  which types of notifications you receive and when.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
