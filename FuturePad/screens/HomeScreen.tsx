import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
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
import CustomSafeAreaView from "@/components/CustomSafeAreaView";

const { width, height } = Dimensions.get("window");

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getDaysUntilDelivery = (deliveryDate: string): number => {
  const diffTime = new Date(deliveryDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffTime / MS_PER_DAY));
};

const calculateProgress = (createdAt: string, deliveryDate: string): number => {
  const created = new Date(createdAt).getTime();
  const delivery = new Date(deliveryDate).getTime();
  const now = Date.now();
  const totalTime = delivery - created;
  
  if (totalTime <= 0) return 100;
  return Math.min(Math.max(0, ((now - created) / totalTime) * 100), 100);
};

const formatDaysUntilDelivery = (days: number): string => {
  if (days <= 0) return "Opens Today";
  if (days === 1) return "Opens Tomorrow";
  return `Opens In ${days} Days`;
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const user = useUser();
  const isFocused = useIsFocused();

  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const lockedLetters = letters.filter((letter) => 
    new Date(letter.deliveryDate) > new Date() && !letter.isDelivered
  );

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLetters();
    setRefreshing(false);
  };

  const handleDeleteLetter = (letterId: string) => {
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

  useEffect(() => {
    fetchLetters();
  }, [isFocused]);

  const styles = createStyles(theme.colors);

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ImageBackground
        source={require('../assets/images/home/Blob.png')}
        style={styles.rightBlob}
        resizeMode="contain"
      />

      <CustomSafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <View style={styles.userTextContainer}>
              <Text style={styles.welcomeText}>Welcome Back 👋</Text>
              <Text style={styles.userName}>
                {user?.name?.trim() || "User"}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search-outline" size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
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
              <Ionicons name="mail-open-outline" size={80} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No locked letters yet</Text>
              <Text style={styles.emptySubtitle}>
                Write your first letter to your future self
              </Text>
            </View>
          ) : (
            <View style={styles.lettersContainer}>
              {lockedLetters.map((letter) => {
                const days = getDaysUntilDelivery(letter.deliveryDate);
                const progress = calculateProgress(letter.createdAt, letter.deliveryDate);
                
                return (
                  <TouchableOpacity
                    key={letter._id}
                    style={styles.letterCard}
                    onPress={() => navigation.navigate("ReadLetter", { letterId: letter._id })}
                  >
                    <View style={styles.letterHeader}>
                      <View style={styles.letterIconContainer}>
                        <Ionicons name="mail" size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.letterActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={(e) => e.stopPropagation()}
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
                          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.letterTitle}>{letter.title}</Text>
                    <Text style={styles.letterMood}>
                      Mood: {letter.mood.charAt(0).toUpperCase() + letter.mood.slice(1)}
                    </Text>

                    <View style={styles.deliveryInfo}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.letterStatus}>
                        {formatDaysUntilDelivery(days)}
                      </Text>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        <View style={styles.writeCard}>
          <View style={styles.writeCardContent}>
            <View style={styles.writeCardIconContainer}>
              <Ionicons name="mail" size={40} color="#FFFFFF" />
            </View>
            <View style={styles.writeCardTextContainer}>
              <Text style={styles.writeCardTitle}>Hey You. Let's Write.</Text>
              <Text style={styles.writeCardSubtitle}>
                Ready To Write Something Just For You?
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.writeButton}
            onPress={() => navigation.navigate("WriteLetter")}
          >
            <Ionicons name="create" size={20} color="#FFFFFF" style={styles.writeButtonIcon} />
            <Text style={styles.writeButtonText}>Write A New Letter</Text>
          </TouchableOpacity>
        </View>
      </CustomSafeAreaView>
    </>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    rightBlob: {
      position: 'absolute',
      right: 50,
      top: -100,
      width: 350,
      height: 350,
      opacity: 1,
      zIndex: 9999,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "transparent",
          zIndex:999
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
      padding: 16,
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
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-around',
      flex: 1,
    },
    writeCardIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    writeCardTextContainer: {
      flex: 1,
      marginLeft: 20,
    },
    writeCardTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    writeCardSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    bottomSpacing: {
      height: 200,
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