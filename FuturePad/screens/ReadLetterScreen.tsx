import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useLetterStore } from '../store/letterStore';
import { useTheme } from '../theme/ThemeContext';
import { Letter } from '../types';

const { width, height } = Dimensions.get('window');

export const ReadLetterScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { letterId } = route.params;
  const [letter, setLetter] = useState<Letter | null>(null);
  
  const { theme, isDark } = useTheme();
  const { getLetterById, deleteLetter } = useLetterStore();

  useEffect(() => {
    if (letterId) {
      const foundLetter = getLetterById(letterId);
      setLetter(foundLetter || null);
    }
  }, [letterId, getLetterById]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleDelete = () => {
    if (!letter) return;

    Alert.alert(
      'Delete Letter',
      'Are you sure you want to delete this letter? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLetter(letter.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete letter. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDeliveryDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis = {
      happy: '😊',
      sad: '😢',
      calm: '😌',
      reflective: '🤔',
      excited: '🤩',
      grateful: '🙏',
      hopeful: '✨',
    };
    return moodEmojis[mood as keyof typeof moodEmojis] || '😊';
  };

  if (!letter) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Ionicons name="mail-open-outline" size={80} color={theme.colors.textSecondary} />
            <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Letter Not Found</Text>
            <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
              The letter you're looking for doesn't exist or has been deleted.
            </Text>
            <TouchableOpacity style={styles.backButton} onPress={handleClose}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Image with Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: letter.image || 'https://picsum.photos/400/300' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
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
            <Text style={styles.moodText}>Mood: {letter.mood.charAt(0).toUpperCase() + letter.mood.slice(1)}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.letterContent}>
          <Text style={styles.letterText}>{letter.content}</Text>
          
          {letter.caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.captionLabel}>Caption:</Text>
              <Text style={styles.captionText}>{letter.caption}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.deliveryDate}>
            Received {formatDeliveryDate(letter.scheduledDate)}
          </Text>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
            <Text style={styles.deleteButtonText}>Delete This Letter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  imageContainer: {
    height: height * 0.45,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  letterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
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
    textAlign: 'justify',
  },
  captionContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  captionLabel: {
    fontSize: 14,
    fontWeight: '600',
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
    textAlign: 'center',
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});