import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: theme.colors.surface }]} onPress={toggleTheme}>
      <View style={[styles.toggle, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.slider,
            {
              backgroundColor: theme.colors.primary,
              transform: [{ translateX: isDark ? 24 : 0 }],
            },
          ]}
        />
      </View>
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {isDark ? '🌙' : '☀️'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  slider: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
  },
});