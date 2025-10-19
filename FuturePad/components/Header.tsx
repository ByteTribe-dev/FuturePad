import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightComponent,
  showBackButton = true,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {rightComponent ? rightComponent : <View style={styles.backButton} />}
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
    leftContainer: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    rightContainer: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "flex-end",
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
  });
