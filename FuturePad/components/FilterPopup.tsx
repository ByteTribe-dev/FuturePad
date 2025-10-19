import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AVAILABLE_MOODS } from '../store/letterStore';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

export interface FilterOptions {
  moods: string[];
  sortBy: 'newest' | 'oldest' | 'mood' | 'dateWritten';
}

interface FilterPopupProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export const FilterPopup: React.FC<FilterPopupProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {
    moods: [],
    sortBy: 'newest',
  },
}) => {
  const { theme } = useTheme();
  const [selectedMoods, setSelectedMoods] = useState<string[]>(initialFilters.moods);
  const [selectedSortBy, setSelectedSortBy] = useState<string>(initialFilters.sortBy);

  const handleMoodToggle = (moodValue: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodValue)
        ? prev.filter(m => m !== moodValue)
        : [...prev, moodValue]
    );
  };

  const handleApply = () => {
    onApply({
      moods: selectedMoods,
      sortBy: selectedSortBy as FilterOptions['sortBy'],
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedMoods([]);
    setSelectedSortBy('newest');
  };

  const styles = createStyles(theme.colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Select Mood Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Mood</Text>
              <View style={styles.moodGrid}>
                {AVAILABLE_MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodOption,
                      selectedMoods.includes(mood.value) && styles.moodOptionSelected,
                    ]}
                    onPress={() => handleMoodToggle(mood.value)}
                  >
                    <View style={styles.moodContent}>
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text
                        style={[
                          styles.moodLabel,
                          selectedMoods.includes(mood.value) && styles.moodLabelSelected,
                        ]}
                      >
                        {mood.label}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selectedMoods.includes(mood.value) && styles.checkboxSelected,
                      ]}
                    >
                      {selectedMoods.includes(mood.value) && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'oldest', label: 'Oldest' },
                  { value: 'mood', label: 'Mood' },
                  { value: 'dateWritten', label: 'Date Written' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.sortOption}
                    onPress={() => setSelectedSortBy(option.value)}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        selectedSortBy === option.value && styles.radioButtonSelected,
                      ]}
                    >
                      {selectedSortBy === option.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.sortLabel,
                        selectedSortBy === option.value && styles.sortLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popup: {
    backgroundColor: colors.card,
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: '80%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 500,
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingBottom: 10,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: (width * 0.9 - 72) / 2, // Account for padding and gaps
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  moodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  moodLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptions: {
    gap: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  sortLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sortLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

