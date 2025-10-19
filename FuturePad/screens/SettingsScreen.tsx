import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Linking,
  Platform,
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
import { useAppStore, AVAILABLE_LANGUAGES } from "../store/useAppStore";
import { LanguageBottomSheet } from "../components/LanguageBottomSheet";
import { useTranslation } from "../hooks/useTranslation";

const { width } = Dimensions.get("window");

export const SettingsScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const user = useUser();
  const { language, setLanguage } = useAppStore();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currentLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === language);

  const handleLogout = () => {
    Alert.alert(t('settings.logout'), t('settings.logoutConfirm'), [
      { text: t('common.cancel'), style: "cancel" },
      {
        text: t('settings.logout'),
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
          } catch (error) {
            Alert.alert(t('common.error'), t('settings.logoutError'));
          }
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Alert.alert(
      t('settings.clearAllData'),
      t('settings.clearDataConfirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('settings.clear'),
          style: "destructive",
          onPress: () => {
            console.log("Clear all data");
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      t('settings.privacyPolicy'),
      t('settings.privacyMessage'),
      [{ text: t('common.ok') }]
    );
  };

  const handleContactUs = () => {
    const email = "support@futurepad.com";
    const subject = "FuturePad Support";
    const body = "Hi, I need help with...";

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert(t('common.error'), t('settings.contactError'));
        }
      })
      .catch(() => Alert.alert(t('common.error'), t('settings.contactFailed')));
  };

  const handleRateUs = () => {
    const appStoreUrl = Platform.select({
      ios: "itms-apps://apps.apple.com/app/id123456789", // Replace with actual App Store ID
      android: "market://details?id=com.futurepad.app", // Replace with actual package name
    });

    if (appStoreUrl) {
      Linking.canOpenURL(appStoreUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(appStoreUrl);
          } else {
            Alert.alert(t('common.error'), t('settings.rateError'));
          }
        })
        .catch(() => Alert.alert(t('common.error'), t('settings.rateFailed')));
    }
  };

  const handleLanguageSelect = (langCode: string) => {
    setLanguage(langCode as any);
    setShowLanguageModal(false);
  };

  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Background Blobs */}
      <ImageBackground
        source={require('../assets/images/home/BlobLeft.png')}
        style={styles.leftBlob}
        resizeMode="contain"
      />
      <ImageBackground
        source={require('../assets/images/home/Blob.png')}
        style={styles.rightBlob}
        resizeMode="contain"
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('settings.subtitle')}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileCard}>
              <View style={styles.profileImageContainer}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={40} color={theme.colors.textSecondary} />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.name || user?.firstName || "User"}
                </Text>
                <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>
              </View>
              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => navigation.navigate("Profile")}
              >
                <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* General Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
            <View style={styles.settingsContainer}>
              {/* Language */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setShowLanguageModal(true)}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="language" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.settingText}>{t('settings.language')}</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{currentLanguage?.nativeName}</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>

              {/* Theme */}
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.settingItem}
                onPress={toggleTheme}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={isDark ? "moon" : "sunny"}
                      size={22}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.settingText}>{t('settings.theme')}</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>
                    {isDark ? t('settings.dark') : t('settings.light')}
                  </Text>
                  <View
                    style={[
                      styles.themeSwitch,
                      {
                        backgroundColor: isDark
                          ? theme.colors.primary
                          : theme.colors.border,
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

          {/* Support & About */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>{t('settings.supportAbout')}</Text>
            <View style={styles.settingsContainer}>
              {/* Privacy Policy */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handlePrivacyPolicy}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.settingText}>{t('settings.privacyPolicy')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Contact Us */}
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleContactUs}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="mail-outline" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.settingText}>{t('settings.contactUs')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Rate Us */}
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleRateUs}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="star-outline" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.settingText}>{t('settings.rateUs')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>{t('settings.dangerZone')}</Text>
            <View style={styles.settingsContainer}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleClearAllData}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + "20" }]}>
                    <Ionicons
                      name="trash-outline"
                      size={22}
                      color={theme.colors.error}
                    />
                  </View>
                  <Text
                    style={[styles.settingText, { color: theme.colors.error }]}
                  >
                    {t('settings.clearAllData')}
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
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>{t('settings.version', { version: '1.0.0' })}</Text>
            <Text style={styles.versionSubtext}>{t('settings.copyright', { year: '2024' })}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Language Selection Bottom Sheet */}
      <LanguageBottomSheet
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        currentLanguage={language}
        onSelectLanguage={handleLanguageSelect}
      />
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
      zIndex: 1,
    },
    leftBlob: {
      position: 'absolute',
      left: -30,
      top: 100,
      width: 180,
      height: 280,
      opacity: 0.7,
      zIndex: 0,
    },
    rightBlob: {
      position: 'absolute',
      right: -20,
      top: 200,
      width: 150,
      height: 220,
      opacity: 0.7,
      zIndex: 0,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
      backgroundColor: "transparent",
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    profileSection: {
      marginBottom: 24,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.primary + "15",
    },
    profileImageContainer: {
      marginRight: 16,
    },
    profileImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
    },
    profileImagePlaceholder: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    editProfileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    settingsSection: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
      marginLeft: 4,
    },
    settingsContainer: {
      backgroundColor: colors.card,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.primary + "10",
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.divider,
      marginHorizontal: 20,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
    },
    settingRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    settingText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    settingValue: {
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    themeSwitch: {
      width: 52,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    themeSwitchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    logoutContainer: {
      paddingBottom: 20,
      marginTop: 10,
    },
    logoutButton: {
      backgroundColor: colors.primary,
      borderRadius: 18,
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    logoutButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
    },
    versionContainer: {
      alignItems: "center",
      paddingVertical: 20,
      marginBottom: 20,
    },
    versionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    versionSubtext: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
