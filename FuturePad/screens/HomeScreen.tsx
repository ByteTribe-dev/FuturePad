import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../store/useAppStore";
import { AVAILABLE_MOODS, useLetterStore } from "../store/letterStore";
import { useTheme } from "../theme/ThemeContext";

const { width } = Dimensions.get("window");

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { getLockedLetters, getDaysUntilDelivery, calculateProgress } =
    useLetterStore();
  const { theme, isDark } = useTheme();
  const user = useUser();

  // Get user ID from auth store
  const userId = user?.id || "default-user";
  const lockedLetters = getLockedLetters(userId);

  const handleWriteLetter = () => {
    navigation.navigate("WriteLetter");
  };

  const handleViewArchive = () => {
    navigation.navigate("LetterArchive");
  };

  const handleLetterPress = (letterId: string) => {
    navigation.navigate("ReadLetter", { letterId });
  };

  const handleDeleteLetter = (letterId: string) => {
    // Add confirmation dialog here
    console.log("Delete letter:", letterId);
  };

  const getMoodEmoji = (mood: string) => {
    const moodData = AVAILABLE_MOODS.find((m) => m.value === mood);
    return moodData?.emoji || "😊";
  };

  const formatDaysUntilDelivery = (letter: any) => {
    const days = getDaysUntilDelivery(letter);
    if (days <= 0) return "Opens Today";
    if (days === 1) return "Opens Tomorrow";
    return `Opens In ${days} Days`;
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
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons
                  name="person"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            )}
            <View style={styles.userTextContainer}>
              <Text style={styles.welcomeText}>Welcome Back 👋</Text>
              <Text style={styles.userName}>
                {user ? `${user.name}`.trim() || "User" : "User"}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons
                name="search-outline"
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Your Locked Letters</Text>

          {lockedLetters.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="mail-open-outline"
                size={80}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>No locked letters yet</Text>
              <Text style={styles.emptySubtitle}>
                Write your first letter to your future self
              </Text>
            </View>
          ) : (
            <View style={styles.lettersContainer}>
              {lockedLetters.map((letter) => (
                <TouchableOpacity
                  key={letter.id}
                  style={styles.letterCard}
                  onPress={() => handleLetterPress(letter.id)}
                >
                  <View style={styles.letterHeader}>
                    <View style={styles.letterIconContainer}>
                      <Ionicons name="mail" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.letterActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteLetter(letter.id);
                        }}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18}
                          color={theme.colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteLetter(letter.id);
                        }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={theme.colors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.letterTitle}>{letter.title}</Text>
                  <Text style={styles.letterMood}>
                    Mood:{" "}
                    {letter.mood.charAt(0).toUpperCase() + letter.mood.slice(1)}
                  </Text>

                  <View style={styles.deliveryInfo}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.letterStatus}>
                      {formatDaysUntilDelivery(letter)}
                    </Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${calculateProgress(letter)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(calculateProgress(letter))}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Bottom spacing for the fixed card */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Write Letter Card - Fixed at Bottom with Button Inside */}
        <View style={styles.writeCard}>
          <View style={styles.writeCardContent}>
            <View style={styles.writeCardIconContainer}>
              <Ionicons name="mail" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.writeCardTitle}>Hey You. Let's Write.</Text>
            <Text style={styles.writeCardSubtitle}>
              Ready To Write Something Just For You?
            </Text>
          </View>

          {/* Button Inside the Card */}
          <TouchableOpacity
            style={styles.writeButton}
            onPress={handleWriteLetter}
          >
            <Ionicons
              name="create"
              size={20}
              color="#FFFFFF"
              style={styles.writeButtonIcon}
            />
            <Text style={styles.writeButtonText}>Write A New Letter</Text>
          </TouchableOpacity>
        </View>
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "transparent",
    },
    menuButton: {
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
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      marginLeft: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
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
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      backgroundColor: "transparent",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
      marginTop: 8,
    },
    lettersContainer: {
      gap: 16,
    },
    letterCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    letterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    letterIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    letterActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    letterTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    letterMood: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    deliveryInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    letterStatus: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: "#FFE4DD",
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    writeCard: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#2D2D2D",
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 20,
      marginBottom: 20,
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
    writeCardContent: {
      alignItems: "center",
      marginBottom: 20,
    },
    writeCardIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    writeCardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 8,
    },
    writeCardSubtitle: {
      fontSize: 14,
      color: "#B0B0B0",
      textAlign: "center",
    },
    bottomSpacing: {
      height: 200, // Space for the fixed card
    },
    writeButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    writeButtonIcon: {
      marginRight: 4,
    },
    writeButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
