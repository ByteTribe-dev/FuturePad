import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { useUser } from "../store/useAppStore";
import { useTheme } from "../theme/ThemeContext";
import { letterService, Letter } from "../services";
import { useIsFocused } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const user = useUser();
  const isFocused = useIsFocused();

  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get locked letters (future delivery dates)
  const lockedLetters = letters.filter((letter) => {
    const deliveryDate = new Date(letter.deliveryDate);
    const now = new Date();
    return deliveryDate > now && !letter.isDelivered;
  });

  // Fetch letters from API
  const fetchLetters = async () => {
    try {
      const userLetters = await letterService.getLetters();
      setLetters(userLetters);
    } catch (error) {
      console.error("Failed to fetch letters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh letters
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLetters();
    setRefreshing(false);
  };

  // Calculate days until delivery
  const getDaysUntilDelivery = (deliveryDate: string): number => {
    const delivery = new Date(deliveryDate);
    const now = new Date();
    const diffTime = delivery.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Calculate progress (0-100%)
  const calculateProgress = (
    createdAt: string,
    deliveryDate: string
  ): number => {
    const created = new Date(createdAt);
    const delivery = new Date(deliveryDate);
    const now = new Date();

    const totalTime = delivery.getTime() - created.getTime();
    const elapsedTime = now.getTime() - created.getTime();

    if (totalTime <= 0) return 100;
    const progress = (elapsedTime / totalTime) * 100;
    return Math.min(Math.max(0, progress), 100);
  };

  // Load letters on component mount
  useEffect(() => {
    fetchLetters();
  }, [isFocused]);

  const handleWriteLetter = () => {
    navigation.navigate("WriteLetter");
  };

  const handleViewArchive = () => {
    navigation.navigate("LetterArchive");
  };

  const handleLetterPress = (letterId: string) => {
    navigation.navigate("ReadLetter", { letterId });
  };

  const handleDeleteLetter = async (letterId: string) => {
    Alert.alert(
      "Delete Letter",
      "Are you sure you want to delete this letter? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await letterService.deleteLetter(letterId);
              // Refresh the letters list
              await fetchLetters();
              Alert.alert("Success", "Letter deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete letter");
            }
          },
        },
      ]
    );
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      happy: "😊",
      sad: "😢",
      excited: "🤩",
      anxious: "😰",
      grateful: "🙏",
      reflective: "🤔",
      calm: "😌",
      refresh: "🌱",
    };
    return moodMap[mood] || "😊";
  };

  const formatDaysUntilDelivery = (letter: Letter) => {
    const days = getDaysUntilDelivery(letter.deliveryDate);
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
      <ImageBackground
        source={require('../assets/images/home/BlobMiddle.png')}
        style={styles.middleBlob}
        resizeMode="contain"
      />

      <SafeAreaView style={[styles.safeArea, { zIndex: 1 }]}>
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

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.sectionTitle}>Your Locked Letters</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading your letters...</Text>
            </View>
          ) : lockedLetters.length === 0 ? (
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
                  key={letter._id}
                  style={styles.letterCard}
                  onPress={() => handleLetterPress(letter._id)}
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
                          // Lock icon - maybe show letter details
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
                          handleDeleteLetter(letter._id);
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
                          {
                            width: `${calculateProgress(
                              letter.createdAt,
                              letter.deliveryDate
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(
                        calculateProgress(letter.createdAt, letter.deliveryDate)
                      )}
                      %
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
    leftBlob: {
      position: 'absolute',
      left: -30,
      top: 100,
      width: 180,
      height: 280,
      opacity: 0.8,
      zIndex: 0,
    },
    rightBlob: {
      position: 'absolute',
      right: -20,
      top: 60,
      width: 150,
      height: 220,
      opacity: 0.8,
      zIndex: 0,
    },
    middleBlob: {
      position: 'absolute',
      right: 30,
      bottom: height * 0.4,
      width: 250,
      height: 350,
      opacity: 0.7,
      zIndex: 0,
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
      marginBottom: 100,
    },
    letterCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.primary + "15",
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
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 28,
      marginHorizontal: 20,
      marginBottom: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.primary + "20",
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
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    writeCardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    bottomSpacing: {
      height: 200, // Space for the fixed card
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 10,
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
