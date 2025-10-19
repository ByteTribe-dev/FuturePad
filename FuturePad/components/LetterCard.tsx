import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Letter } from '../types';

interface LetterCardProps {
  letter: Letter;
  onPress: () => void;
  onDelete?: () => void;
}

export const LetterCard: React.FC<LetterCardProps> = ({
  letter,
  onPress,
  onDelete,
}) => {
  const { theme } = useTheme();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap = {
      happy: '😊',
      sad: '😢',
      calm: '😌',
      reflective: '🤔',
      excited: '🤩',
      grateful: '🙏',
      anxious: '😰',
      refresh: '🌱',
    };
    return moodMap[mood as keyof typeof moodMap] || '😊';
  };

  const cardStyles = {
    ...styles.card,
    backgroundColor: theme.colors.card,
    shadowColor: theme.colors.shadow,
  };

  const scheduledDate = new Date(letter.scheduledDate);
  const now = new Date();
  const daysUntilDelivery = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isDelivered = letter.isDelivered || scheduledDate <= now;

  return (
    <TouchableOpacity style={cardStyles} onPress={onPress}>
      <View style={styles.contentRow}>
        <View style={styles.leftContent}>
          <Image
            source={{ uri: letter.image || 'https://picsum.photos/80/80' }}
            style={styles.thumbnail}
          />
        </View>
        <View style={styles.middleContent}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {letter.title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Mood: {letter.mood.charAt(0).toUpperCase() + letter.mood.slice(1)}
          </Text>
          <View style={styles.statusRow}>
            {isDelivered ? (
              <>
                <Ionicons name="checkmark-circle" size={14} color="#FF6B35" />
                <Text style={[styles.statusText, { color: "#FF6B35" }]}>Opened</Text>
              </>
            ) : (
              <>
                <Ionicons name="lock-closed" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                  {daysUntilDelivery === 1 ? 'Opens Tomorrow' : daysUntilDelivery <= 0 ? 'Opens Today' : `Open In ${daysUntilDelivery} Days`}
                </Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {formatDate(letter.scheduledDate)}
          </Text>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.1)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leftContent: {
    width: 70,
    height: 70,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  middleContent: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 8,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
});