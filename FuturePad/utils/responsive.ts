import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions for iPhone 12/13/14 (390 x 844)
const baseWidth = 390;
const baseHeight = 844;

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 320,   // iPhone SE
  sm: 375,   // iPhone 12 mini
  md: 390,   // iPhone 12/13/14
  lg: 414,   // iPhone 12/13/14 Pro Max
  xl: 428,   // iPhone 12/13/14 Pro Max
  tablet: 768, // iPad
  desktop: 1024, // Desktop
} as const;

// Screen size categories
export const getScreenSize = () => {
  if (SCREEN_WIDTH <= BREAKPOINTS.xs) return 'xs';
  if (SCREEN_WIDTH <= BREAKPOINTS.sm) return 'sm';
  if (SCREEN_WIDTH <= BREAKPOINTS.md) return 'md';
  if (SCREEN_WIDTH <= BREAKPOINTS.lg) return 'lg';
  if (SCREEN_WIDTH <= BREAKPOINTS.xl) return 'xl';
  if (SCREEN_WIDTH <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

export const isTablet = () => SCREEN_WIDTH >= BREAKPOINTS.tablet;
export const isDesktop = () => SCREEN_WIDTH >= BREAKPOINTS.desktop;
export const isSmallScreen = () => SCREEN_WIDTH <= BREAKPOINTS.sm;

// Responsive scaling functions
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / baseWidth) * size;
};

export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / baseHeight) * size;
};

export const scaleFont = (size: number): number => {
  const scale = Math.min(SCREEN_WIDTH / baseWidth, SCREEN_HEIGHT / baseHeight);
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

export const scaleSize = (size: number): number => {
  return scaleWidth(size);
};

// Responsive spacing
export const spacing = {
  xs: scaleSize(4),
  sm: scaleSize(8),
  md: scaleSize(16),
  lg: scaleSize(24),
  xl: scaleSize(32),
  xxl: scaleSize(48),
} as const;

// Responsive font sizes
export const fontSize = {
  xs: scaleFont(10),
  sm: scaleFont(12),
  md: scaleFont(14),
  lg: scaleFont(16),
  xl: scaleFont(18),
  xxl: scaleFont(20),
  xxxl: scaleFont(24),
  title: scaleFont(28),
  heading: scaleFont(32),
} as const;

// Responsive border radius
export const borderRadius = {
  xs: scaleSize(4),
  sm: scaleSize(8),
  md: scaleSize(12),
  lg: scaleSize(16),
  xl: scaleSize(20),
  xxl: scaleSize(24),
  round: scaleSize(50),
} as const;

// Responsive padding/margin multipliers
export const getResponsivePadding = (base: number) => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case 'xs':
    case 'sm':
      return base * 0.8;
    case 'md':
      return base;
    case 'lg':
    case 'xl':
      return base * 1.2;
    case 'tablet':
      return base * 1.5;
    case 'desktop':
      return base * 2;
    default:
      return base;
  }
};

// Grid system
export const getGridColumns = () => {
  const screenSize = getScreenSize();
  
  switch (screenSize) {
    case 'xs':
    case 'sm':
      return 2;
    case 'md':
    case 'lg':
    case 'xl':
      return 3;
    case 'tablet':
      return 4;
    case 'desktop':
      return 6;
    default:
      return 3;
  }
};

// Responsive component dimensions
export const getComponentDimensions = () => {
  const screenSize = getScreenSize();
  
  return {
    buttonHeight: {
      xs: scaleSize(36),
      sm: scaleSize(40),
      md: scaleSize(44),
      lg: scaleSize(48),
      xl: scaleSize(52),
    }[screenSize] || scaleSize(44),
    
    inputHeight: {
      xs: scaleSize(40),
      sm: scaleSize(44),
      md: scaleSize(48),
      lg: scaleSize(52),
      xl: scaleSize(56),
    }[screenSize] || scaleSize(48),
    
    cardPadding: {
      xs: scaleSize(12),
      sm: scaleSize(14),
      md: scaleSize(16),
      lg: scaleSize(18),
      xl: scaleSize(20),
    }[screenSize] || scaleSize(16),
    
    iconSize: {
      xs: scaleSize(16),
      sm: scaleSize(18),
      md: scaleSize(20),
      lg: scaleSize(22),
      xl: scaleSize(24),
    }[screenSize] || scaleSize(20),
  };
};

// Safe area helpers
export const getSafeAreaPadding = () => {
  const screenSize = getScreenSize();
  
  return {
    horizontal: {
      xs: scaleSize(16),
      sm: scaleSize(18),
      md: scaleSize(20),
      lg: scaleSize(22),
      xl: scaleSize(24),
    }[screenSize] || scaleSize(20),
    
    vertical: {
      xs: scaleSize(12),
      sm: scaleSize(14),
      md: scaleSize(16),
      lg: scaleSize(18),
      xl: scaleSize(20),
    }[screenSize] || scaleSize(16),
  };
};

// Responsive layout helpers
export const getLayoutConfig = () => {
  const screenSize = getScreenSize();
  
  return {
    maxContentWidth: isTablet() ? scaleSize(600) : SCREEN_WIDTH,
    sidebarWidth: isTablet() ? scaleSize(280) : SCREEN_WIDTH * 0.85,
    modalWidth: isTablet() ? scaleSize(400) : SCREEN_WIDTH * 0.9,
    cardMaxWidth: isTablet() ? scaleSize(350) : SCREEN_WIDTH - scaleSize(40),
  };
};

// Platform-specific adjustments
export const getPlatformAdjustments = () => {
  return {
    statusBarHeight: Platform.OS === 'ios' ? 44 : 24,
    headerHeight: Platform.OS === 'ios' ? 44 : 56,
    tabBarHeight: Platform.OS === 'ios' ? 83 : 56,
    bottomSafeArea: Platform.OS === 'ios' ? 34 : 0,
  };
};

export default {
  scaleWidth,
  scaleHeight,
  scaleFont,
  scaleSize,
  spacing,
  fontSize,
  borderRadius,
  getResponsivePadding,
  getGridColumns,
  getComponentDimensions,
  getSafeAreaPadding,
  getLayoutConfig,
  getPlatformAdjustments,
  getScreenSize,
  isTablet,
  isDesktop,
  isSmallScreen,
  BREAKPOINTS,
};

