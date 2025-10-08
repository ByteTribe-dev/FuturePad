import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AVAILABLE_MOODS } from '../store/letterStore';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
  showAll?: boolean;
  compact?: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  showAll = false,
  compact = false,
}) => {
  const { theme } = useTheme();

  const moodsToShow = showAll ? AVAILABLE_MOODS : AVAILABLE_MOODS.slice(0, 4);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Select Mood</Text>
      <View style={[styles.moodGrid, compact && styles.moodGridCompact]}>
        {moodsToShow.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              compact && styles.moodButtonCompact,
              {
                backgroundColor: selectedMood === mood.value ? theme.colors.primary : theme.colors.card,
                borderColor: selectedMood === mood.value ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => onMoodSelect(mood.value)}
          >
            <Text style={[styles.moodEmoji, compact && styles.moodEmojiCompact]}>
              {mood.emoji}
            </Text>
            <Text
              style={[
                styles.moodLabel,
                compact && styles.moodLabelCompact,
                {
                  color: selectedMood === mood.value ? '#FFFFFF' : theme.colors.textSecondary,
                  fontWeight: selectedMood === mood.value ? '600' : '500',
                },
              ]}
            >
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodGridCompact: {
    justifyContent: 'space-between',
    gap: 8,
  },
  moodButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
  },
  moodButtonCompact: {
    flex: 1,
    minWidth: (width - 60) / 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodEmojiCompact: {
    fontSize: 20,
    marginBottom: 2,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  moodLabelCompact: {
    fontSize: 11,
  },
});