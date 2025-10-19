import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
} from "react-native";
import { FilterOptions, FilterPopup } from "../components/FilterPopup";
import { LetterCard } from "../components/LetterCard";
import { CustomScreenHeader } from "../components/CustomScreenHeader";
import { useAppStore } from "../store/useAppStore";
import { AVAILABLE_MOODS } from "../store/letterStore";
import { useTheme } from "../theme/ThemeContext";
import { Letter } from "../types";
import { letterService } from "../services";
import { useIsFocused } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type TabType = "past" | "upcoming";

export const LetterArchiveScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("past");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    moods: [],
    sortBy: "newest",
  });
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  const { theme, isDark } = useTheme();
  const isFocused = useIsFocused();

  // Convert API letters to match our Letter interface
  const convertApiLetter = (apiLetter: any): Letter => ({
    id: apiLetter._id,
    title: apiLetter.title,
    content: apiLetter.content,
    mood: apiLetter.mood,
    scheduledDate: new Date(apiLetter.deliveryDate),
    isDelivered: apiLetter.isDelivered,
    createdAt: new Date(apiLetter.createdAt),
    userId: apiLetter.userId,
    image: apiLetter.featuredImage?.url || apiLetter.images?.[0]?.url,
    caption: apiLetter.images?.[0]?.caption,
  });

  // Fetch letters from API
  const fetchLetters = async () => {
    try {
      setLoading(true);
      const apiLetters = await letterService.getLetters();
      console.log("📬 Fetched letters for archive:", apiLetters);
      
      // Convert API letters to our interface
      const convertedLetters = apiLetters.map(convertApiLetter);
      setLetters(convertedLetters);
    } catch (error) {
      console.error("Failed to fetch letters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load letters on component mount and focus
  useEffect(() => {
    if (isFocused) {
      fetchLetters();
    }
  }, [isFocused]);

  // Get letters based on active tab and isDelivered status
  const allLetters = useMemo(() => {
    return letters.filter((letter) => {
      const now = new Date();
      const scheduledDate = new Date(letter.scheduledDate);
      const isOpened = letter.isDelivered || scheduledDate <= now;

      if (activeTab === "past") {
        // Past letters: delivered OR scheduled date has passed (opened)
        return isOpened;
      } else {
        // Upcoming letters: not delivered AND scheduled date is in future (locked)
        return !isOpened;
      }
    });
  }, [letters, activeTab]);

  // Apply search and filters
  const filteredLetters = useMemo(() => {
    let result = [...allLetters];

    // Apply search
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        (letter) =>
          letter.title.toLowerCase().includes(lowercaseQuery) ||
          letter.content.toLowerCase().includes(lowercaseQuery) ||
          letter.caption?.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Apply mood filter
    if (filters.moods.length > 0) {
      result = result.filter((letter) => filters.moods.includes(letter.mood));
    }

    // Apply sorting
    result = result.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "mood":
          return a.mood.localeCompare(b.mood);
        case "dateWritten":
          return (
            new Date(b.scheduledDate).getTime() -
            new Date(a.scheduledDate).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [allLetters, searchQuery, filters]);

  const handleLetterPress = (letter: Letter) => {
    if (
      activeTab === "past" ||
      letter.isDelivered ||
      new Date() >= letter.scheduledDate
    ) {
      navigation.navigate("ReadLetter", { letterId: letter.id });
    }
  };

  const handleDeleteLetter = (letterId: string) => {
    // Add confirmation dialog here
    console.log("Delete letter:", letterId);
  };

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const getMoodEmoji = (mood: string) => {
    const moodData = AVAILABLE_MOODS.find((m) => m.value === mood);
    return moodData?.emoji || "😊";
  };

  const formatDaysUntilDelivery = (letter: Letter) => {
    const now = new Date();
    const scheduled = new Date(letter.scheduledDate);
    const diffTime = scheduled.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Opens Today";
    if (days === 1) return "Opens Tomorrow";
    return `Open In ${days} Days`;
  };

  const styles = createStyles(theme.colors);

  const renderLetterCard = ({ item: letter }: { item: Letter }) => (
    <LetterCard
      letter={letter}
      onPress={() => handleLetterPress(letter)}
      onDelete={() => handleDeleteLetter(letter.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === "past" ? "mail-open-outline" : "mail-outline"}
        size={80}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>
        {activeTab === "past" ? "No past letters" : "No upcoming letters"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === "past"
          ? "Letters you've written will appear here once they're delivered"
          : "Write your first letter to see it here"}
      </Text>
    </View>
  );

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
        <CustomScreenHeader
          showProfile={true}
          rightActions={[
            {
              icon: "search-outline",
              onPress: () => console.log("Search"),
            },
            {
              icon: "notifications-outline",
              onPress: () => navigation.navigate("Notifications"),
            },
          ]}
        />

        {/* Title */}
        <Text style={styles.title}>Letter Archive</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Letters Here"
              placeholderTextColor={theme.colors.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.tabActive]}
            onPress={() => setActiveTab("past")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "past" && styles.tabTextActive,
              ]}
            >
              Past Letters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.tabTextActive,
              ]}
            >
              Upcoming Letters
            </Text>
          </TouchableOpacity>
        </View>

        {/* Letters List */}
        <FlatList
          data={filteredLetters}
          renderItem={renderLetterCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />

        {/* Filter Popup */}
        <FilterPopup
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleFilterApply}
          initialFilters={filters}
        />
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
      left: -20,
      top: 100,
      width: 140,
      height: 220,
      opacity: 0.6,
      zIndex: -1,
    },
    rightBlob: {
      position: 'absolute',
      right: -10,
      top: 50,
      width: 120,
      height: 180,
      opacity: 0.6,
      zIndex: -1,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    searchContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    filterButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    tabContainer: {
      flexDirection: "row",
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginHorizontal: 20,
      padding: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
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
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });
