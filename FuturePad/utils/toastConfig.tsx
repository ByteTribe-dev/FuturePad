import React, { JSX } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

type ToastRenderer = (props: CustomToastProps) => JSX.Element;

const BaseToastView = ({
  icon,
  backgroundColor,
  borderColor,
  titleColor,
  text1,
  text2,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  text1?: string;
  text2?: string;
}) => (
  <View style={[styles.container, { backgroundColor, borderColor }]}>
    <Ionicons name={icon} size={20} color={titleColor} style={styles.icon} />

    <View style={styles.textContainer}>
      {text1 && <Text style={[styles.title, { color: titleColor }]}>{text1}</Text>}
      {text2 && <Text style={styles.subtitle}>{text2}</Text>}
    </View>
  </View>
);

const ErrorToast: ToastRenderer = ({ text1, text2 }) => (
  <BaseToastView
    icon="close-circle"
    backgroundColor="#FEF3F2"
    borderColor="#D92D20"
    titleColor="#D92D20"
    text1={text1}
    text2={text2}
  />
);

const SuccessToast: ToastRenderer = ({ text1, text2 }) => (
  <BaseToastView
    icon="checkmark-circle"
    backgroundColor="#ECFDF3"
    borderColor="#ABEFC6"
    titleColor="#067647"
    text1={text1}
    text2={text2}
  />
);

const DeleteToast: ToastRenderer = ({ text1, text2 }) => (
  <BaseToastView
    icon="trash"
    backgroundColor="#FEF3F2"
    borderColor="#D92D20"
    titleColor="#D92D20"
    text1={text1}
    text2={text2}
  />
);

const toastConfig = {
  error: ErrorToast,
  success: SuccessToast,
  delete: DeleteToast,
};

export default toastConfig;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: '5%',
    right: '5%',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },

  icon: {
    marginRight: 8,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 13,
    fontWeight: '600',
  },

  subtitle: {
    fontSize: 12,
    color: '#475467',
    marginTop: 2,
  },
});
