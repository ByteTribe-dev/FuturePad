import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../components/Header";
import { useUser, useAppStore } from "../store/useAppStore";
import { useTheme } from "../theme/ThemeContext";
import { useTranslation } from "../hooks/useTranslation";
import { profileService } from "../services";

const { width } = Dimensions.get("window");

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const user = useUser();
  const { updateUser } = useAppStore();

  const [name, setName] = useState(user?.name || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          t('writeLetter.permissionRequired'),
          t('writeLetter.permissionMessage')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        setIsEditing(true);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('writeLetter.imagePickerError'));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('profile.errorNameRequired'));
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        name: name.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profileImage,
      };

      const response = await profileService.updateProfile(profileData);

      if (response.success && response.user) {
        // Update Zustand store
        updateUser(response.user);

        Alert.alert(t('profile.successTitle'), t('profile.successMessage'));
        setIsEditing(false);
        navigation.goBack();
      } else {
        Alert.alert(t('common.error'), response.message || t('profile.errorUpdate'));
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('profile.errorUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setProfileImage(user?.profileImage || "");
    setIsEditing(false);
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
        <Header title={t('profile.title')} onBack={() => navigation.goBack()} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <View style={styles.imageContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={60} color={theme.colors.textSecondary} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={handleImagePicker}
                >
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.imageHint}>{t('profile.tapToChange')}</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.fullName')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setIsEditing(true);
                    }}
                    placeholder={t('profile.enterFullName')}
                    placeholderTextColor={theme.colors.placeholder}
                  />
                </View>
              </View>

              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.firstName')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      setIsEditing(true);
                    }}
                    placeholder={t('profile.enterFirstName')}
                    placeholderTextColor={theme.colors.placeholder}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.lastName')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      setIsEditing(true);
                    }}
                    placeholder={t('profile.enterLastName')}
                    placeholderTextColor={theme.colors.placeholder}
                  />
                </View>
              </View>

              {/* Email (Read-only) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('profile.email')}</Text>
                <View style={[styles.inputContainer, styles.inputDisabled]}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, styles.inputReadOnly]}
                    value={user?.email || ""}
                    editable={false}
                    placeholderTextColor={theme.colors.placeholder}
                  />
                  <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textSecondary} />
                </View>
                <Text style={styles.hint}>{t('profile.emailCannotChange')}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            {isEditing && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>{t('profile.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
      zIndex: 1,
    },
    leftBlob: {
      position: 'absolute',
      left: -30,
      top: 80,
      width: 180,
      height: 280,
      opacity: 0.7,
      zIndex: 0,
    },
    rightBlob: {
      position: 'absolute',
      right: -20,
      top: 150,
      width: 150,
      height: 220,
      opacity: 0.7,
      zIndex: 0,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    imageSection: {
      alignItems: "center",
      marginTop: 20,
      marginBottom: 40,
    },
    imageContainer: {
      position: "relative",
      marginBottom: 12,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: colors.primary,
    },
    profileImagePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: colors.primary + "30",
    },
    changeImageButton: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    imageHint: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    formSection: {
      gap: 24,
    },
    inputGroup: {
      gap: 10,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderWidth: 2,
      borderColor: "transparent",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    inputDisabled: {
      backgroundColor: colors.surface,
      opacity: 0.7,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      padding: 0,
    },
    inputReadOnly: {
      color: colors.textSecondary,
    },
    hint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
      marginTop: -4,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 32,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
