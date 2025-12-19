import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Header } from "../components/Header";
import { useUser } from "../store/useAppStore";
import { useTheme } from "../theme/ThemeContext";
import { useTranslation } from "../hooks/useTranslation";
import { letterService } from "../services";
import CustomSafeAreaView from "@/components/CustomSafeAreaView";

const { width } = Dimensions.get('window');

const MOODS = [
  { key: "happy", emoji: "😊" },
  { key: "sad", emoji: "😢" },
  { key: "calm", emoji: "😌" },
  { key: "refresh", emoji: "🌱" },
  { key: "reflective", emoji: "🤔" },
  { key: "excited", emoji: "🤩" },
  { key: "grateful", emoji: "🙏" },
  { key: "anxious", emoji: "😰" },
];

export const WriteLetterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("happy");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useUser();
  const { theme,isDark } = useTheme();
  const { t } = useTranslation();

  const validateInputs = (): { isValid: boolean; error?: string } => {
    const trimmedContent = content.trim();

    // Content validation
    if (!trimmedContent) {
      return { isValid: false, error: t('writeLetter.errorNoContent') };
    }

    if (trimmedContent.length < 10) {
      return { isValid: false, error: t('writeLetter.errorMinLength') };
    }

    if (trimmedContent.length > 5000) {
      return { isValid: false, error: 'Letter content cannot exceed 5000 characters' };
    }

    // Date validation
    if (!selectedDate) {
      return { isValid: false, error: t('writeLetter.errorNoDate') };
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      return { isValid: false, error: t('writeLetter.errorPastDate') };
    }

    // Maximum future date validation (1 year from now)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (selectedDate > maxDate) {
      return { isValid: false, error: 'Delivery date cannot be more than 1 year in the future' };
    }

    // Mood validation
    if (!mood || !MOODS.find(m => m.key === mood)) {
      return { isValid: false, error: 'Please select a valid mood' };
    }

    // Caption validation (if image is selected)
    if (selectedImage && caption.trim().length > 200) {
      return { isValid: false, error: 'Caption cannot exceed 200 characters' };
    }

    return { isValid: true };
  };

  const validateAndSubmit = async () => {
    const validation = validateInputs();
    
    if (!validation.isValid) {
      Alert.alert(t('common.error'), validation.error || 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      const letterData = {
        title: `Letter from ${new Date().toLocaleDateString()}`,
        content: content.trim(),
        mood: mood as any,
        deliveryDate: selectedDate!.toISOString(),
        images: selectedImage ? [{ uri: selectedImage, caption: caption.trim() }] : undefined,
      };

      const result = await letterService.createLetter(letterData);

      if (result) {
        Alert.alert(
          t('writeLetter.letterScheduled'),
          t('writeLetter.letterScheduledMessage', { date: selectedDate!.toLocaleDateString() }),
          [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        t('common.error'), 
        error.message || 'Failed to schedule letter. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type !== 'dismissed' && date) {
      setSelectedDate(date);
    }
  };

  const handleImagePicker = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!granted) {
        Alert.alert(
          t('writeLetter.permissionRequired'),
          t('writeLetter.permissionMessage')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('writeLetter.imagePickerError'));
    }
  };

  const styles = createStyles(theme.colors);
  const isValid = selectedDate && content.trim().length > 0;

  return (
    <View style={styles.container}>
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

      <CustomSafeAreaView style={styles.safeArea}>
        <Header title={t('writeLetter.title')} onBack={() => navigation.goBack()} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Letter Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('writeLetter.writeYourLetter')}
              <Text style={styles.charCount}> ({content.length}/5000)</Text>
            </Text>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={content}
                onChangeText={setContent}
                placeholder={t('writeLetter.placeholder')}
                placeholderTextColor={theme.colors.placeholder}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                maxLength={5000}
              />
            </View>
            {content.length < 10 && content.length > 0 && (
              <Text style={styles.validationHint}>
                Minimum 10 characters required
              </Text>
            )}
          </View>

          {/* Mood Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('writeLetter.selectMood')}</Text>
            <View style={styles.moodContainer}>
              {MOODS.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.moodButton, mood === item.key && styles.selectedMoodButton]}
                  onPress={() => setMood(item.key)}
                >
                  <Text style={styles.moodEmoji}>{item.emoji}</Text>
                  <Text style={[styles.moodLabel, mood === item.key && styles.selectedMoodLabel]}>
                    {t(`moods.${item.key}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('writeLetter.addPhoto')}</Text>
            <View style={styles.photoContainer}>
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadArea} onPress={handleImagePicker}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#D4A574" />
                  <Text style={styles.uploadText}>{t('writeLetter.uploadImage')}</Text>
                </TouchableOpacity>
              )}

              <TextInput
                style={styles.captionInput}
                value={caption}
                onChangeText={setCaption}
                placeholder={t('writeLetter.addCaption')}
                placeholderTextColor={theme.colors.placeholder}
                maxLength={200}
              />
              {caption.length > 0 && (
                <Text style={styles.captionCount}>{caption.length}/200</Text>
              )}
            </View>
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            disabled={loading}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.dateButtonText}>
              {selectedDate
                ? t('writeLetter.deliverOn', { date: selectedDate.toLocaleDateString() })
                : t('writeLetter.chooseDate')}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Submit Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          {isValid ? (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={validateAndSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{t('writeLetter.scheduleLetter')}</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.submitButtonPlaceholder}>
              <Text style={styles.placeholderText}>
                {!selectedDate
                  ? t('writeLetter.pleaseSelectDate')
                  : t('writeLetter.pleaseWriteLetter')}
              </Text>
            </View>
          )}
        </View>
      </CustomSafeAreaView>

      {/* Native Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          themeVariant={isDark?'dark':'light'}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()}
          maximumDate={(() => {
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 1);
            return maxDate;
          })()}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
     backgroundColor: colors.background,
  },
  leftBlob: {
    position: 'absolute',
    left: -30,
    top: 100,
    width: 180,
    height: 280,
    opacity: 0.7,
    zIndex: 0,
  },
  rightBlob: {
    position: 'absolute',
    right: -20,
    top: 200,
    width: 150,
    height: 220,
    opacity: 0.7,
    zIndex: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  textInputContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.primary + "15",
  },
  textInput: {
    fontSize: 16,
    color: colors.text,
    textAlignVertical: "top",
    minHeight: 110,
  },
  moodContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  moodButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    width: (width - 64) / 4 - 7.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedMoodButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
  },
  moodEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  selectedMoodLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  photoContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  uploadArea: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 16,
    marginBottom: 15,
    backgroundColor: colors.card,
  },
  uploadText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: 10,
    fontWeight: "600",
  },
  selectedImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  selectedImage: {
    width: "100%",
    height: 120,
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: colors.card,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  captionInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  submitButtonPlaceholder: {
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: "italic",
  },
  charCount: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "400",
  },
  validationHint: {
    fontSize: 12,
    color: "#ff6b6b",
    marginTop: 6,
    marginLeft: 4,
  },
  captionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: 6,
  },
});