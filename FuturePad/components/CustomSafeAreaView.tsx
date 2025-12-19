
import { useTheme } from '@/theme/ThemeContext';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomSafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isTransparent?: boolean;
}

const CustomSafeAreaView: React.FC<CustomSafeAreaViewProps> = ({
  children,
  style,
  isTransparent = false,
  ...rest
}) => {
  const insets = useSafeAreaInsets();
   const { theme } = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          flex: 1,
          paddingTop: insets.top,
          backgroundColor: isTransparent
            ? 'transparent'
            : theme.colors.primary,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default CustomSafeAreaView;