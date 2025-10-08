import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import responsiveUtils, {
    BREAKPOINTS,
    getComponentDimensions,
    getLayoutConfig,
    getPlatformAdjustments,
    getSafeAreaPadding,
    getScreenSize,
    isDesktop,
    isSmallScreen,
    isTablet
} from '../utils/responsive';

export interface ResponsiveState {
  screenSize: ReturnType<typeof getScreenSize>;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallScreen: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  componentDimensions: ReturnType<typeof getComponentDimensions>;
  safeAreaPadding: ReturnType<typeof getSafeAreaPadding>;
  layoutConfig: ReturnType<typeof getLayoutConfig>;
  platformAdjustments: ReturnType<typeof getPlatformAdjustments>;
}

export const useResponsive = (): ResponsiveState => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const screenSize = getScreenSize();
  const isTabletDevice = isTablet();
  const isDesktopDevice = isDesktop();
  const isSmallScreenDevice = isSmallScreen();
  const componentDimensions = getComponentDimensions();
  const safeAreaPadding = getSafeAreaPadding();
  const layoutConfig = getLayoutConfig();
  const platformAdjustments = getPlatformAdjustments();

  return {
    screenSize,
    isTablet: isTabletDevice,
    isDesktop: isDesktopDevice,
    isSmallScreen: isSmallScreenDevice,
    dimensions,
    componentDimensions,
    safeAreaPadding,
    layoutConfig,
    platformAdjustments,
  };
};

// Hook for responsive values
export const useResponsiveValue = <T>(
  values: Partial<Record<ReturnType<typeof getScreenSize>, T>>,
  defaultValue: T
): T => {
  const { screenSize } = useResponsive();
  return values[screenSize] ?? defaultValue;
};

// Hook for responsive styles
export const useResponsiveStyles = <T>(
  styleCreator: (responsive: ResponsiveState) => T
): T => {
  const responsive = useResponsive();
  return styleCreator(responsive);
};

// Hook for responsive spacing
export const useResponsiveSpacing = () => {
  const { screenSize } = useResponsive();
  
  return {
    xs: responsiveUtils.spacing.xs,
    sm: responsiveUtils.spacing.sm,
    md: responsiveUtils.spacing.md,
    lg: responsiveUtils.spacing.lg,
    xl: responsiveUtils.spacing.xl,
    xxl: responsiveUtils.spacing.xxl,
    // Responsive padding
    padding: (base: number) => responsiveUtils.getResponsivePadding(base),
  };
};

// Hook for responsive font sizes
export const useResponsiveFontSize = () => {
  return {
    xs: responsiveUtils.fontSize.xs,
    sm: responsiveUtils.fontSize.sm,
    md: responsiveUtils.fontSize.md,
    lg: responsiveUtils.fontSize.lg,
    xl: responsiveUtils.fontSize.xl,
    xxl: responsiveUtils.fontSize.xxl,
    xxxl: responsiveUtils.fontSize.xxxl,
    title: responsiveUtils.fontSize.title,
    heading: responsiveUtils.fontSize.heading,
  };
};

// Hook for responsive border radius
export const useResponsiveBorderRadius = () => {
  return {
    xs: responsiveUtils.borderRadius.xs,
    sm: responsiveUtils.borderRadius.sm,
    md: responsiveUtils.borderRadius.md,
    lg: responsiveUtils.borderRadius.lg,
    xl: responsiveUtils.borderRadius.xl,
    xxl: responsiveUtils.borderRadius.xxl,
    round: responsiveUtils.borderRadius.round,
  };
};

// Hook for grid system
export const useResponsiveGrid = () => {
  const { screenSize } = useResponsive();
  const columns = responsiveUtils.getGridColumns();
  
  return {
    columns,
    getColumnWidth: (spacing: number = 0) => {
      const totalSpacing = spacing * (columns - 1);
      return (dimensions.width - totalSpacing) / columns;
    },
    getGridGap: () => {
      switch (screenSize) {
        case 'xs':
        case 'sm':
          return responsiveUtils.spacing.xs;
        case 'md':
        case 'lg':
        case 'xl':
          return responsiveUtils.spacing.sm;
        case 'tablet':
        case 'desktop':
          return responsiveUtils.spacing.md;
        default:
          return responsiveUtils.spacing.sm;
      }
    },
  };
};

// Hook for responsive breakpoints
export const useBreakpoints = () => {
  const { dimensions } = useResponsive();
  
  return {
    breakpoints: BREAKPOINTS,
    isBreakpoint: (breakpoint: keyof typeof BREAKPOINTS) => {
      return dimensions.width >= BREAKPOINTS[breakpoint];
    },
    isBreakpointDown: (breakpoint: keyof typeof BREAKPOINTS) => {
      return dimensions.width < BREAKPOINTS[breakpoint];
    },
    isBreakpointUp: (breakpoint: keyof typeof BREAKPOINTS) => {
      return dimensions.width >= BREAKPOINTS[breakpoint];
    },
    isBreakpointBetween: (
      min: keyof typeof BREAKPOINTS,
      max: keyof typeof BREAKPOINTS
    ) => {
      return dimensions.width >= BREAKPOINTS[min] && dimensions.width < BREAKPOINTS[max];
    },
  };
};

// Hook for responsive scaling
export const useResponsiveScale = () => {
  return {
    scaleWidth: responsiveUtils.scaleWidth,
    scaleHeight: responsiveUtils.scaleHeight,
    scaleFont: responsiveUtils.scaleFont,
    scaleSize: responsiveUtils.scaleSize,
  };
};

// Hook for responsive layout
export const useResponsiveLayout = () => {
  const responsive = useResponsive();
  
  return {
    ...responsive.layoutConfig,
    getContainerStyle: () => ({
      width: '100%',
      maxWidth: responsive.layoutConfig.maxContentWidth,
      alignSelf: 'center',
      paddingHorizontal: responsive.safeAreaPadding.horizontal,
    }),
    getCardStyle: () => ({
      maxWidth: responsive.layoutConfig.cardMaxWidth,
      alignSelf: 'center',
    }),
    getModalStyle: () => ({
      width: responsive.layoutConfig.modalWidth,
      alignSelf: 'center',
    }),
  };
};

// Hook for responsive navigation
export const useResponsiveNavigation = () => {
  const { screenSize, isTablet } = useResponsive();
  
  return {
    drawerType: isTablet ? 'permanent' : 'slide',
    tabBarStyle: {
      height: screenSize === 'xs' ? 60 : 70,
      paddingBottom: screenSize === 'xs' ? 8 : 12,
    },
    headerStyle: {
      height: screenSize === 'xs' ? 50 : 60,
    },
    getDrawerWidth: () => responsiveUtils.getLayoutConfig().sidebarWidth,
  };
};

// Hook for responsive animations
export const useResponsiveAnimation = () => {
  const { screenSize } = useResponsive();
  
  return {
    duration: {
      fast: screenSize === 'xs' ? 200 : 300,
      normal: screenSize === 'xs' ? 300 : 400,
      slow: screenSize === 'xs' ? 500 : 600,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
    },
    scale: {
      small: screenSize === 'xs' ? 0.95 : 0.98,
      normal: 1,
      large: screenSize === 'xs' ? 1.05 : 1.02,
    },
  };
};

// Hook for responsive images
export const useResponsiveImage = () => {
  const { screenSize, dimensions } = useResponsive();
  
  return {
    getImageSize: (baseWidth: number, baseHeight: number) => {
      const scale = responsiveUtils.scaleSize(1);
      return {
        width: baseWidth * scale,
        height: baseHeight * scale,
      };
    },
    getAspectRatio: (ratio: number = 16/9) => {
      return {
        aspectRatio: ratio,
        width: '100%',
      };
    },
    getThumbnailSize: () => {
      switch (screenSize) {
        case 'xs':
        case 'sm':
          return responsiveUtils.scaleSize(60);
        case 'md':
        case 'lg':
        case 'xl':
          return responsiveUtils.scaleSize(80);
        case 'tablet':
        case 'desktop':
          return responsiveUtils.scaleSize(100);
        default:
          return responsiveUtils.scaleSize(80);
      }
    },
  };
};

// Hook for responsive forms
export const useResponsiveForm = () => {
  const { screenSize } = useResponsive();
  
  return {
    inputHeight: responsiveUtils.getComponentDimensions().inputHeight,
    buttonHeight: responsiveUtils.getComponentDimensions().buttonHeight,
    spacing: {
      between: screenSize === 'xs' ? responsiveUtils.spacing.sm : responsiveUtils.spacing.md,
      section: screenSize === 'xs' ? responsiveUtils.spacing.md : responsiveUtils.spacing.lg,
    },
    fontSize: {
      label: screenSize === 'xs' ? responsiveUtils.fontSize.sm : responsiveUtils.fontSize.md,
      input: screenSize === 'xs' ? responsiveUtils.fontSize.md : responsiveUtils.fontSize.lg,
      button: screenSize === 'xs' ? responsiveUtils.fontSize.md : responsiveUtils.fontSize.lg,
    },
  };
};

export default useResponsive;


