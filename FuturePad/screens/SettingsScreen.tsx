import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../store/useAppStore";
import { authService } from "../services";
import { useTheme } from "../theme/ThemeContext";

export const SettingsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const user = useUser();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
            // Navigation will happen automatically due to auth state change
            // No need to manually reset navigation
          } catch (error) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your letters and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // Implement clear all data logic
            console.log("Clear all data");
          },
        },
      ]
    );
  };

  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your app preferences</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Theme Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={toggleTheme}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={20}
                    color={theme.colors.text}
                  />
                  <Text style={styles.settingText}>Theme</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>
                    {isDark ? "Dark" : "Light"}
                  </Text>
                  <View
                    style={[
                      styles.themeSwitch,
                      {
                        backgroundColor: isDark
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.themeSwitchThumb,
                        {
                          backgroundColor: "#FFFFFF",
                          alignSelf: isDark ? "flex-end" : "flex-start",
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleClearAllData}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.error}
                  />
                  <Text
                    style={[styles.settingText, { color: theme.colors.error }]}
                  >
                    Clear All Data
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: "transparent",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
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
      fontWeight: "600",
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
      overflow: "hidden",
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      flex: 1,
    },
    settingRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    settingText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    settingValue: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    themeSwitch: {
      width: 50,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      paddingHorizontal: 2,
    },
    themeSwitchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    logoutContainer: {
      paddingBottom: 40,
      marginTop: 20,
    },
    logoutButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    logoutButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
