import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import letterService, { Letter } from "../services/letterService";
import { useTheme } from "../theme/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

const MOOD_EMOJIS = {
  happy: "😊", sad: "😢", calm: "😌", reflective: "🤔",
  excited: "🤩", grateful: "🙏", refresh: "🌱", anxious: "😰",
};

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    position: "absolute",
    top: 0,
    left: 8,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    height: height * 0.4,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  moodBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  moodText: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  letterText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  // Locked state
  lockedContent: {
    alignItems: "center",
    paddingTop: 32,
  },
  lockIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  lockedSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  countdownCard: {
    backgroundColor: colors.surface || colors.card,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  countdownTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  timeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeUnit: {
    alignItems: "center",
    flex: 1,
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  // Bottom Fixed Section
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider || "rgba(0,0,0,0.08)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    gap: 8,
    borderWidth:1
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  deleteText: {
    fontSize: 14,
    color: colors.error || "#FF6B6B",
    fontWeight: "500",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
});

const TimeUnit = ({ value, label, colors }:any) => (
  <View style={{ alignItems: "center", flex: 1 }}>
    <Text style={{ fontSize: 32, fontWeight: "800", color: colors.primary, marginBottom: 4 }}>
      {String(value).padStart(2, "0")}
    </Text>
    <Text style={{ fontSize: 10, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" }}>
      {label}
    </Text>
  </View>
);

const useCountdown = (deliveryDate: string, isLocked: boolean) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!isLocked) return;

    const calculate = () => {
      const diff = new Date(deliveryDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [deliveryDate, isLocked]);

  return timeLeft;
};

export const ReadLetterScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { letterId } = route.params;
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        setLoading(true);
        const data = await letterService.getLetter(letterId);
        setLetter(data);
      } catch (error) {
        console.error("Failed to fetch letter:", error);
      } finally {
        setLoading(false);
      }
    };
    if (letterId) fetchLetter();
  }, [letterId]);

  const isLocked = useMemo(() => 
    letter ? new Date(letter.deliveryDate) > new Date() && !letter.isDelivered : false,
    [letter]
  );

  const timeLeft = useCountdown(letter?.deliveryDate || "", isLocked);

  const handleDelete = useCallback(() => {
    if (!letter) return;
    Alert.alert("Delete Letter", "Are you sure you want to delete this letter?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await letterService.deleteLetter(letter._id);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "Failed to delete letter.");
          }
        },
      },
    ]);
  }, [letter, navigation]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Ionicons name="mail-outline" size={60} color={theme.colors.textSecondary} />
        <Text style={styles.loadingText}>Loading letter...</Text>
      </View>
    );
  }

  if (!letter) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Ionicons name="mail-open-outline" size={60} color={theme.colors.textSecondary} />
        <Text style={styles.errorText}>Letter not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const moodEmoji = MOOD_EMOJIS[letter.mood as keyof typeof MOOD_EMOJIS] || "😊";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={require("../assets/images/home/NoteBg.png")}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>
                {isLocked && <Ionicons name="lock-closed" size={22} color="#FFFFFF" />} {letter.title}
              </Text>
              <View style={styles.moodBadge}>
                <Text style={styles.moodText}>{moodEmoji}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              {isLocked ? "Letter is Locked" : `Mood: ${letter.mood.charAt(0).toUpperCase() + letter.mood.slice(1)}`}
            </Text>
          </View>
        </ImageBackground>
      </View>

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#222" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          {isLocked ? (
            <View style={styles.lockedContent}>
              <View style={styles.lockIconContainer}>
                <Ionicons name="time" size={40} color={theme.colors.primary} />
              </View>
              <Text style={styles.lockedTitle}>Letter Locked</Text>
              <Text style={styles.lockedSubtitle}>
                This letter will unlock on the scheduled date
              </Text>

              <View style={styles.countdownCard}>
                <Text style={styles.countdownTitle}>Opens In</Text>
                <View style={styles.timeGrid}>
                  <TimeUnit value={timeLeft.days} label="Days" colors={theme.colors} />
                  <TimeUnit value={timeLeft.hours} label="Hrs" colors={theme.colors} />
                  <TimeUnit value={timeLeft.minutes} label="Min" colors={theme.colors} />
                  <TimeUnit value={timeLeft.seconds} label="Sec" colors={theme.colors} />
                </View>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.greeting}>Dear Me In Spring,</Text>
              <Text style={styles.letterText}>{letter.content}</Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Fixed Section */}
      <View style={styles.bottomSection}>
        <View style={[styles.dateRow,{borderColor:theme.colors.primary,width:'60%',alignSelf:'center',paddingHorizontal:12,paddingVertical:8,borderRadius:12}]}>
          <Ionicons 
            name={isLocked ? "calendar-outline" : "checkmark-circle"} 
            size={16} 
            color={theme.colors.textSecondary} 
          />
          <Text style={styles.dateText}>
            {isLocked ? `Delivers ${formatDate(letter.deliveryDate)}` : `Received ${formatDate(letter.deliveryDate)}`}
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={theme.colors.error || "#FF6B6B"} />
          <Text style={styles.deleteText}>Delete This Letter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};