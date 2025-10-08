import React, { useState } from "react";
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { backupService } from "../services/backupService";
import { useUser } from "../store/useAppStore";
import { useLetterStore } from "../store/letterStore";
import { useSettingsStore } from "../store/settingsStore";
import { useTheme } from "../theme/ThemeContext";

export const BackupManager: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { theme } = useTheme();
  const user = useUser();
  const { letters } = useLetterStore();

  // Get settings data directly without causing re-renders
  const getSettingsData = () => {
    try {
      return useSettingsStore.getState().exportSettings();
    } catch (error) {
      console.warn("Failed to get settings data:", error);
      return {};
    }
  };

  const handleExportBackup = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    setIsExporting(true);
    try {
      const backupData = await backupService.createBackup(
        user,
        letters,
        getSettingsData(),
        {
          includeImages: false, // Exclude images for smaller backup size
          includeSettings: true,
          compressData: true,
        }
      );

      // For Expo Go, we'll share the backup data as text
      try {
        await Share.share({
          message: `FeaturePad Backup Data:\n\n${backupData}`,
          title: "FeaturePad Backup",
        });

        Alert.alert(
          "Backup Exported",
          "Your backup data has been shared. Save this data to restore your letters later."
        );
      } catch (shareError) {
        console.error("Share failed:", shareError);
        Alert.alert(
          "Backup Ready",
          "Backup data has been prepared. Copy the data from the console logs."
        );
        console.log("Backup Data:", backupData);
      }
    } catch (error) {
      console.error("Export failed:", error);
      Alert.alert("Export Failed", "Failed to export backup data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = () => {
    Alert.alert(
      "Import Backup",
      "To import backup data:\n\n1. Paste your backup data below\n2. The app will validate and restore your letters",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            Alert.prompt(
              "Import Backup",
              "Paste your backup data here:",
              async (backupData) => {
                if (!backupData) return;

                setIsImporting(true);
                try {
                  const parsedData = JSON.parse(backupData);
                  const restored = await backupService.restoreBackup(
                    parsedData
                  );

                  Alert.alert(
                    "Import Successful",
                    `Restored ${restored.letters.length} letters and settings.`
                  );
                } catch (error) {
                  console.error("Import failed:", error);
                  Alert.alert("Import Failed", "Invalid backup data format");
                } finally {
                  setIsImporting(false);
                }
              }
            );
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your letters and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await backupService.clearLocalBackup();
              Alert.alert("Data Cleared", "All data has been cleared");
            } catch (error) {
              console.error("Clear failed:", error);
              Alert.alert("Clear Failed", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data Management</Text>
      <Text style={styles.subtitle}>Manage your letters and app data</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.exportButton]}
          onPress={handleExportBackup}
          disabled={isExporting}
        >
          <Text style={styles.buttonText}>
            {isExporting ? "Exporting..." : "Export Backup"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.importButton]}
          onPress={handleImportBackup}
          disabled={isImporting}
        >
          <Text style={styles.buttonText}>
            {isImporting ? "Importing..." : "Import Backup"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClearData}
        >
          <Text style={[styles.buttonText, styles.clearButtonText]}>
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How to use backups:</Text>
        <Text style={styles.infoText}>
          • Export: Creates a backup of all your letters and settings
        </Text>
        <Text style={styles.infoText}>
          • Import: Restores letters and settings from a backup
        </Text>
        <Text style={styles.infoText}>
          • Save your backup data in a safe place
        </Text>
        <Text style={styles.infoText}>
          • For full file sharing, use a development build
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 24,
    },
    buttonContainer: {
      gap: 16,
      marginBottom: 24,
    },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    exportButton: {
      backgroundColor: colors.primary,
    },
    importButton: {
      backgroundColor: colors.success,
    },
    clearButton: {
      backgroundColor: colors.error,
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    clearButtonText: {
      color: "#FFFFFF",
    },
    infoContainer: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
      lineHeight: 20,
    },
  });
