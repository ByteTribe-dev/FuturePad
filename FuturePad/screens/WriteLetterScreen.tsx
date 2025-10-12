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
} from "react-native";
import { useUser } from "../store/useAppStore";
import { useTheme } from "../theme/ThemeContext";
import { letterService } from "../services";

const MOODS = [
  { key: "happy", emoji: "😊", label: "Happy" },
  { key: "sad", emoji: "😢", label: "Sad" },
  { key: "calm", emoji: "😌", label: "Calm" },
  { key: "refresh", emoji: "🌱", label: "Refresh" },
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

  const handleSubmitLetter = async () => {
    // Validation
    if (!content.trim()) {
      Alert.alert("Error", "Please write your letter content");
      return;
    }

    if (!selectedDate) {
      Alert.alert("Error", "Please choose a delivery date");
      return;
    }

    // Check if delivery date is in the future
    if (selectedDate <= new Date()) {
      Alert.alert("Error", "Delivery date must be in the future");
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
          "Letter Scheduled!",
          `Your letter will be delivered on ${selectedDate.toLocaleDateString()}`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create letter");
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
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      console.log("Launching image library...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images", // Use string instead of enum
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
      Alert.alert("Error", "Failed to open image picker");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write A Letter</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Write Your Letter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Write Your Letter</Text>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="Type Here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Select Mood Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Mood</Text>
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
                  {moodOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Add A Photo That Captures This Feeling
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
                <Text style={styles.uploadText}>Upload Image</Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Add A Caption..."
              placeholderTextColor="#999"
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
              ? `Deliver on ${selectedDate.toLocaleDateString()}`
              : "Choose A Date"}
          </Text>
        </TouchableOpacity>

        {/* Submit Button - Show when date and content are provided */}
        {console.log(
          "Debug - selectedDate:",
          selectedDate,
          "content length:",
          content.trim().length
        )}
        {selectedDate && content.trim().length > 0 ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitLetter}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Schedule Letter</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.submitButtonPlaceholder}>
            <Text style={styles.placeholderText}>
              {!selectedDate
                ? "Please select a date"
                : "Please write your letter"}
            </Text>
          </View>
        )}
      </ScrollView>

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
                <Text style={styles.datePickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>Choose Delivery Date</Text>
              <TouchableOpacity onPress={handleDatePickerConfirm}>
                <Text style={styles.datePickerConfirm}>Done</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFEEE6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFEEE6",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  textInputContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    minHeight: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textInput: {
    fontSize: 16,
    color: "#333",
    textAlignVertical: "top",
    minHeight: 110,
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E8E8E8",
    borderRadius: 15,
    padding: 10,
  },
  moodButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    minWidth: 70,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMoodButton: {
    backgroundColor: "#D4A574",
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  selectedMoodLabel: {
    color: "#fff",
  },
  photoContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  uploadArea: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    borderRadius: 15,
    marginBottom: 15,
  },
  uploadText: {
    fontSize: 16,
    color: "#D4A574",
    marginTop: 10,
    fontWeight: "500",
  },
  selectedImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  selectedImage: {
    width: "100%",
    height: 120,
    borderRadius: 15,
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  captionInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  dateButton: {
    backgroundColor: "#D4A574",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#E69A8D",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonPlaceholder: {
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 30,
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  datePickerModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 300,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  datePickerCancel: {
    fontSize: 16,
    color: "#999",
  },
  datePickerConfirm: {
    fontSize: 16,
    color: "#D4A574",
    fontWeight: "600",
  },
  datePicker: {
    backgroundColor: "#fff",
    borderRadius: 20,
  },
});
