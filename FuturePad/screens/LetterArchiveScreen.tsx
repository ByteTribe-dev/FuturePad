import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FilterOptions, FilterPopup } from "../components/FilterPopup";
import { LetterCard } from "../components/LetterCard";
import { useUser } from "../store/useAppStore";
import { AVAILABLE_MOODS, useLetterStore } from "../store/letterStore";
import { useTheme } from "../theme/ThemeContext";
import { Letter } from "../types";

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

  const { theme, isDark } = useTheme();
  const user = useUser();
  const { getDeliveredLetters, getUpcomingLetters, searchLetters } =
    useLetterStore();

  const userId = user?.id || "default-user";

  // Get letters based on active tab
  const allLetters = useMemo(() => {
    if (activeTab === "past") {
      return getDeliveredLetters(userId);
    } else {
      return getUpcomingLetters(userId);
    }
  }, [activeTab, userId, getDeliveredLetters, getUpcomingLetters]);

  // Apply search and filters
  const filteredLetters = useMemo(() => {
    let letters = allLetters;

    // Apply search
    if (searchQuery.trim()) {
      letters = searchLetters(userId, searchQuery.trim());
      // Filter by tab after search
      letters = letters.filter((letter) =>
        activeTab === "past"
          ? letter.isDelivered || new Date() >= letter.scheduledDate
          : !letter.isDelivered && new Date() < letter.scheduledDate
      );
    }

    // Apply mood filter
    if (filters.moods.length > 0) {
      letters = letters.filter((letter) => filters.moods.includes(letter.mood));
    }

    // Apply sorting
    letters = [...letters].sort((a, b) => {
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

    return letters;
  }, [allLetters, searchQuery, filters, userId, searchLetters, activeTab]);

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

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: user?.profileImage || "https://i.pravatar.cc/150?img=1",
              }}
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.welcomeText}>Welcome Back 👋</Text>
              <Text style={styles.userName}>
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

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
          </View>
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
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    headerButton: {
      padding: 8,
    },
    searchContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 20,
      gap: 12,
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    filterButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginHorizontal: 20,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      borderRadius: 8,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: "#FFFFFF",
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
