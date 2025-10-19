import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  SafeAreaView,
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

const { width } = Dimensions.get('window');
import { letterService } from "../services";

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

export const WriteLetterScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("happy");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useUser();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleSubmitLetter = async () => {
    // Validation
    if (!content.trim()) {
      Alert.alert(t('common.error'), t('writeLetter.errorNoContent'));
      return;
    }

    if (content.trim().length < 10) {
      Alert.alert(t('common.error'), t('writeLetter.errorMinLength'));
      return;
    }

    if (!selectedDate) {
      Alert.alert(t('common.error'), t('writeLetter.errorNoDate'));
      return;
    }

    // Check if delivery date is in the future (at least 1 day from now)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      Alert.alert(t('common.error'), t('writeLetter.errorPastDate'));
      return;
    }

    setLoading(true);
    try {
      const letterData = {
        title: `Letter from ${new Date().toLocaleDateString()}`,
        content: content.trim(),
        mood: mood as any,
        deliveryDate: selectedDate.toISOString(),
        images: selectedImage
          ? [{ uri: selectedImage, caption: caption.trim() }]
          : undefined,
      };

      const result = await letterService.createLetter(letterData);

      if (result) {
        Alert.alert(
          t('writeLetter.letterScheduled'),
          t('writeLetter.letterScheduledMessage', { date: selectedDate.toLocaleDateString() }),
          [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('writeLetter.errorNoContent'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate && event.type !== "dismissed") {
      setSelectedDate(selectedDate);
      if (Platform.OS === "ios") {
        setShowDatePicker(false);
      }
    } else if (event.type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  const handleDatePickerConfirm = () => {
    setShowDatePicker(false);
  };

  const handleDatePickerCancel = () => {
    setShowDatePicker(false);
  };

  const handleImagePicker = async () => {
    try {
      console.log("Image picker started...");

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission result:", permissionResult);

      if (permissionResult.granted === false) {
        Alert.alert(
          t('writeLetter.permissionRequired'),
          t('writeLetter.permissionMessage')
        );
        return;
      }

      console.log("Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log("Setting selected image:", result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
      } else {
        console.log("Image picker was canceled or no assets");
      }
    } catch (error) {
      console.error("Error in handleImagePicker:", error);
      Alert.alert(t('common.error'), t('writeLetter.imagePickerError'));
    }
  };

  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
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
        <Header title={t('writeLetter.title')} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Write Your Letter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('writeLetter.writeYourLetter')}</Text>
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
            />
          </View>
        </View>

        {/* Select Mood Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('writeLetter.selectMood')}</Text>
          <View style={styles.moodContainer}>
            {MOODS.map((moodOption) => (
              <TouchableOpacity
                key={moodOption.key}
                style={[
                  styles.moodButton,
                  mood === moodOption.key && styles.selectedMoodButton,
                ]}
                onPress={() => setMood(moodOption.key)}
              >
                <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    mood === moodOption.key && styles.selectedMoodLabel,
                  ]}
                >
                  {t(`moods.${moodOption.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('writeLetter.addPhoto')}
          </Text>
          <View style={styles.photoContainer}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleImagePicker}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={40}
                  color="#D4A574"
                />
                <Text style={styles.uploadText}>{t('writeLetter.uploadImage')}</Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder={t('writeLetter.addCaption')}
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>
        </View>

        {/* Choose Date Button */}
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

        {/* Submit Button - Show when date and content are provided */}
        {selectedDate && content.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitLetter}
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
      </ScrollView>
      </SafeAreaView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDatePickerCancel}
      >
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={handleDatePickerCancel}>
                <Text style={styles.datePickerCancel}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>{t('writeLetter.chooseDate')}</Text>
              <TouchableOpacity onPress={handleDatePickerConfirm}>
                <Text style={styles.datePickerConfirm}>{t('common.done')}</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={handleDateChange}
              style={styles.datePicker}
            />
          </View>
        </View>
      </Modal>
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  submitButton: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 30,
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
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontStyle: "italic",
  },
  datePickerModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    margin: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 320,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  datePickerCancel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  datePickerConfirm: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  datePicker: {
    backgroundColor: colors.card,
    borderRadius: 20,
  },
});
