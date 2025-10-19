import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useUser } from "../store/useAppStore";

interface CustomScreenHeaderProps {
  title?: string;
  showProfile?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActions?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }[];
}

export const CustomScreenHeader: React.FC<CustomScreenHeaderProps> = ({
  title,
  showProfile = false,
  showBackButton = false,
  onBackPress,
  rightActions = [],
}) => {
  const { theme } = useTheme();
  const user = useUser();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.header}>
      {/* Left Side - Profile or Back Button */}
      {showProfile ? (
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: user?.profileImage || "https://i.pravatar.cc/150?img=1",
            }}
            style={styles.avatar}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.userName}>
              {user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  user.name ||
                  user.email?.split("@")[0] ||
                  "User"
                : "User"}
            </Text>
          </View>
        </View>
      ) : showBackButton ? (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : null}

      {/* Middle - Title (only if not showing profile) */}
      {!showProfile && title && (
        <Text style={styles.headerTitle}>{title}</Text>
      )}

      {/* Right Side - Action Buttons or Placeholder */}
      <View style={styles.headerActions}>
        {rightActions.length > 0 ? (
          rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.headerButton}
              onPress={action.onPress}
            >
              <Ionicons
                name={action.icon}
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          ))
        ) : !showProfile && !showBackButton ? (
          <View style={styles.placeholder} />
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "transparent",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12,
    },
    userTextContainer: {
      flex: 1,
    },
    welcomeText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    userName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      flex: 1,
      textAlign: "center",
    },
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    headerButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    placeholder: {
      width: 40,
    },
  });
