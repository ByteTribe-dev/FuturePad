import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.border : theme.colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.border : theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.border : theme.colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          color: '#fff',
          fontSize: 16,
          fontWeight: '600' as const,
        };
      case 'secondary':
        return {
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: '600' as const,
        };
      case 'outline':
        return {
          color: disabled ? theme.colors.textSecondary : theme.colors.primary,
          fontSize: 16,
          fontWeight: '600' as const,
        };
      default:
        return {
          color: '#fff',
          fontSize: 16,
          fontWeight: '600' as const,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};