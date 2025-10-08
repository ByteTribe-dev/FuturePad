import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface DrawerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ icon, label, onPress, active }) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.drawerItem,
        active && { backgroundColor: theme.colors.primaryLight },
      ]}
      onPress={onPress}
    >
      <View style={styles.drawerItemContent}>
        <Ionicons
          name={icon}
          size={22}
          color={active ? theme.colors.primary : theme.colors.icon}
        />
        <Text
          style={[
            styles.drawerItemLabel,
            { color: active ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

export const CustomDrawer: React.FC<any> = (props) => {
  const { theme } = useTheme();
  const { navigation, state } = props;
  
  const currentRoute = state?.routes[state.index]?.name;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
      style={{ backgroundColor: theme.colors.surface }}
    >
      {/* Close Button */}
      <View style={styles.closeContainer}>
        <TouchableOpacity
          onPress={() => navigation.closeDrawer()}
          style={styles.closeButton}
        >
          <Ionicons name="close-circle" size={28} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* App Title Section */}
      <View style={styles.titleSection}>
        <Text style={[styles.appTitle, { color: theme.colors.text }]}>
          FeaturePad
        </Text>
        <Text style={[styles.appSubtitle, { color: theme.colors.textSecondary }]}>
          Your personal letter journal
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <DrawerItem
          icon="home"
          label="Home"
          onPress={() => {
            navigation.navigate('Home');
            navigation.closeDrawer();
          }}
          active={currentRoute === 'Home'}
        />
        <DrawerItem
          icon="mail"
          label="Letter Archive"
          onPress={() => {
            navigation.navigate('LetterArchive');
            navigation.closeDrawer();
          }}
          active={currentRoute === 'LetterArchive'}
        />
        <DrawerItem
          icon="notifications"
          label="Notifications"
          onPress={() => {
            navigation.navigate('Notifications');
            navigation.closeDrawer();
          }}
          active={currentRoute === 'Notifications'}
        />
        <DrawerItem
          icon="settings"
          label="Settings"
          onPress={() => {
            navigation.navigate('Settings');
            navigation.closeDrawer();
          }}
          active={currentRoute === 'Settings'}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    paddingTop: 0,
  },
  closeContainer: {
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingTop: 50, // Add more top padding to clear the notch
    paddingBottom: 8,
    zIndex: 1000,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 24,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});

