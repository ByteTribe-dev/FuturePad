import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { AVAILABLE_LANGUAGES } from "../store/useAppStore";
import { useTranslation } from "../hooks/useTranslation";

const { height, width } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = height * 0.7;

interface LanguageBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSelectLanguage: (languageCode: string) => void;
}

export const LanguageBottomSheet: React.FC<LanguageBottomSheetProps> = ({
  visible,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 25,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: BOTTOM_SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelectLanguage = (langCode: string) => {
    onSelectLanguage(langCode);
    onClose();
  };

  const styles = createStyles(theme.colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{t('languageSelector.title')}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Language List */}
              <ScrollView
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageItem,
                      currentLanguage === lang.code && styles.languageItemActive,
                    ]}
                    onPress={() => handleSelectLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.flagContainer}>
                      <Text style={styles.flag}>{lang.flag}</Text>
                    </View>
                    <View style={styles.languageInfo}>
                      <Text style={styles.languageName}>{lang.nativeName}</Text>
                      <Text style={styles.languageNameEn}>{lang.name}</Text>
                    </View>
                    {currentLanguage === lang.code && (
                      <View style={styles.checkmarkContainer}>
                        <Ionicons
                          name="checkmark-circle"
                          size={26}
                          color={theme.colors.primary}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    bottomSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      height: BOTTOM_SHEET_HEIGHT,
      paddingTop: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 20,
    },
    handleBar: {
      width: 40,
      height: 5,
      backgroundColor: colors.divider,
      borderRadius: 3,
      alignSelf: "center",
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    languageList: {
      flex: 1,
      paddingTop: 10,
    },
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider + "40",
    },
    languageItemActive: {
      backgroundColor: colors.primary + "10",
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    languageNameEn: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    checkmarkContainer: {
      marginLeft: 12,
    },
    flagContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    flag: {
      fontSize: 28,
    },
  });
