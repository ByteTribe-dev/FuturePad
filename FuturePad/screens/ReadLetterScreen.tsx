import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
} from "react-native";
import letterService, { Letter } from "../services/letterService";
import { useTheme } from "../theme/ThemeContext";

const { height } = Dimensions.get("window");

// Create styles function outside component to avoid re-creation
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    imageContainer: {
      height: height * 0.45,
      position: "relative",
    },
    backgroundImage: {
      width: "100%",
      height: "100%",
    },
    imageOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    header: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.3)",
      alignItems: "center",
      justifyContent: "center",
    },
    titleOverlay: {
      position: "absolute",
      bottom: 40,
      left: 20,
      right: 20,
    },
    letterTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 12,
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    moodContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    moodEmoji: {
      fontSize: 20,
      marginRight: 8,
    },
    moodText: {
      fontSize: 16,
      color: "#FFFFFF",
      fontWeight: "500",
      textShadowColor: "rgba(0,0,0,0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
    },
    letterContent: {
      padding: 24,
    },
    letterText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      textAlign: "justify",
    },
    captionContainer: {
      marginTop: 24,
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    captionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    captionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    deliveryDate: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 16,
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 8,
    },
    deleteButtonText: {
      fontSize: 14,
      color: colors.error,
      fontWeight: "500",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "700",
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    errorSubtitle: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },
    backButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 8,
    },
    backButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.textSecondary,
    },
    // Locked state styles
    lockedContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    lockIcon: {
      marginBottom: 24,
    },
    lockedTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginBottom: 12,
    },
    lockedSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    countdownContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 32,
      width: "100%",
    },
    countdownTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
      marginBottom: 16,
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
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 4,
    },
    timeLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    deliveryInfo: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    deliveryInfoText: {
      fontSize: 14,
      color: colors.text,
      textAlign: "center",
    },
    lockedImageOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      justifyContent: "center",
      alignItems: "center",
    },
    blurredContent: {
      opacity: 0.3,
      filter: "blur(10px)",
    },
  });

export const ReadLetterScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { letterId } = route.params;
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  useEffect(() => {
    const fetchLetter = async () => {
      if (letterId) {
        try {
          setLoading(true);
          const fetchedLetter = await letterService.getLetter(letterId);
          setLetter(fetchedLetter);
        } catch (error) {
          console.error("Failed to fetch letter:", error);
          setLetter(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLetter();
  }, [letterId]);

  // Check if letter is locked (delivery date in future)
  const isLetterLocked = (letter: Letter) => {
    const now = new Date();
    const deliveryDate = new Date(letter.deliveryDate);
    return deliveryDate > now && !letter.isDelivered;
  };

  // Calculate time remaining until delivery
  const calculateTimeLeft = (deliveryDate: string) => {
    const now = new Date().getTime();
    const delivery = new Date(deliveryDate).getTime();
    const difference = delivery - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Update countdown timer
  useEffect(() => {
    if (letter && isLetterLocked(letter)) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(letter.deliveryDate));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [letter]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!letter) return;

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
              await letterService.deleteLetter(letter._id);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete letter. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const formatDeliveryDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis = {
      happy: "😊",
      sad: "😢",
      calm: "😌",
      reflective: "🤔",
      excited: "🤩",
      grateful: "🙏",
      hopeful: "✨",
      anxious: "😰",
    };
    return moodEmojis[mood as keyof typeof moodEmojis] || "😊";
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <Ionicons
          name="mail-outline"
          size={80}
          color={theme.colors.textSecondary}
        />
        <Text
          style={[styles.loadingText, { color: theme.colors.textSecondary }]}
        >
          Loading letter...
        </Text>
      </View>
    );
  }

  if (!letter) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={styles.errorContainer}>
          <Ionicons
            name="mail-open-outline"
            size={80}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Letter Not Found
          </Text>
          <Text
            style={[
              styles.errorSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            The letter you're looking for doesn't exist or has been deleted.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Check if letter is locked
  const locked = isLetterLocked(letter);

  // Get the featured image or first image, fallback to placeholder
  const imageUrl =
    letter.featuredImage?.url ||
    (letter.images && letter.images.length > 0 ? letter.images[0].url : null) ||
    "https://picsum.photos/400/300";

  if (locked) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Background Image with Lock Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.backgroundImage, styles.blurredContent]}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
            style={styles.imageOverlay}
          />

          {/* Lock overlay on image */}
          <View style={styles.lockedImageOverlay}>
            <Ionicons name="lock-closed" size={60} color="#FFFFFF" />
          </View>

          {/* Header */}
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Title Overlay - Still show title but indicate it's locked */}
          <View style={styles.titleOverlay}>
            <Text style={styles.letterTitle}>🔒 {letter.title}</Text>
            <View style={styles.moodContainer}>
              <Text style={styles.moodEmoji}>🔒</Text>
              <Text style={styles.moodText}>Letter is Locked</Text>
            </View>
          </View>
        </View>

        {/* Locked Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.lockedContainer}>
            <Ionicons
              name="time-outline"
              size={80}
              color={theme.colors.primary}
              style={styles.lockIcon}
            />

            <Text style={styles.lockedTitle}>Letter Not Yet Available</Text>
            <Text style={styles.lockedSubtitle}>
              This letter is scheduled for future delivery. Please wait until
              the delivery date to read its contents.
            </Text>

            {/* Countdown Timer */}
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownTitle}>Time Until Delivery</Text>
              <View style={styles.timeGrid}>
                <View style={styles.timeUnit}>
                  <Text style={styles.timeNumber}>{timeLeft.days}</Text>
                  <Text style={styles.timeLabel}>Days</Text>
                </View>
                <View style={styles.timeUnit}>
                  <Text style={styles.timeNumber}>{timeLeft.hours}</Text>
                  <Text style={styles.timeLabel}>Hours</Text>
                </View>
                <View style={styles.timeUnit}>
                  <Text style={styles.timeNumber}>{timeLeft.minutes}</Text>
                  <Text style={styles.timeLabel}>Minutes</Text>
                </View>
                <View style={styles.timeUnit}>
                  <Text style={styles.timeNumber}>{timeLeft.seconds}</Text>
                  <Text style={styles.timeLabel}>Seconds</Text>
                </View>
              </View>
            </View>

            {/* Delivery Information */}
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryInfoText}>
                📅 Scheduled delivery: {formatDeliveryDate(letter.deliveryDate)}
              </Text>
            </View>

            {/* Delete button still available for locked letters */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={theme.colors.error}
              />
              <Text style={styles.deleteButtonText}>Delete This Letter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Regular unlocked letter view
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Image with Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={styles.imageOverlay}
        />

        {/* Header */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Title Overlay */}
        <View style={styles.titleOverlay}>
          <Text style={styles.letterTitle}>{letter.title}</Text>
          <View style={styles.moodContainer}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(letter.mood)}</Text>
            <Text style={styles.moodText}>
              Mood: {letter.mood.charAt(0).toUpperCase() + letter.mood.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.letterContent}>
          <Text style={styles.letterText}>{letter.content}</Text>

          {/* Show image captions if available */}
          {letter.images &&
            letter.images.length > 0 &&
            letter.images.some((img) => img.caption) && (
              <View style={styles.captionContainer}>
                <Text style={styles.captionLabel}>Image Captions:</Text>
                {letter.images.map((image, index) =>
                  image.caption ? (
                    <Text key={index} style={styles.captionText}>
                      {index + 1}. {image.caption}
                    </Text>
                  ) : null
                )}
              </View>
            )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.deliveryDate}>
            {letter.isDelivered
              ? `Delivered ${formatDeliveryDate(letter.deliveryDate)}`
              : `Scheduled for ${formatDeliveryDate(letter.deliveryDate)}`}
          </Text>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons
              name="trash-outline"
              size={16}
              color={theme.colors.error}
            />
            <Text style={styles.deleteButtonText}>Delete This Letter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
