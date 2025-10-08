// import React, { useState } from 'react';
// import {
//   Dimensions,
//   Image,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { Button } from '../components/Button';
// import { useAuthStore } from '../store/authStore';

// const { width, height } = Dimensions.get('window');

// const onboardingData = [
//   {
//     title: 'Welcome to Letters to Future Self',
//     subtitle: 'Reflect on the present by writing letters to yourself.',
//     image: require('@/assets/images/onboarding/obb1.png'),
//   },
//   {
//     title: 'Why Write To Yourself?',
//     subtitle:
//       'Reflect on your thoughts and emotions. Gain perspective and be a friend to your future self.',
//     image: require('@/assets/images/onboarding/obb2.png'),
//   },
//   {
//     title: 'Get started',
//     subtitle:
//       'Create an account to begin writing letters to your future self.',
//     image: require('@/assets/images/onboarding/obb3.png'),
//   },
// ];

// export const OnboardingScreen: React.FC = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const { completeOnboarding } = useAuthStore();

//   const handleNext = () => {
//     if (currentIndex < onboardingData.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     } else {
//       completeOnboarding();
//     }
//   };

//   const handleSkip = () => {
//     completeOnboarding();
//   };

//   const currentData = onboardingData[currentIndex];

//   const getButtonText = () => {
//     if (currentIndex === 0) return 'Get Started';
//     if (currentIndex === 1) return 'Next';
//     return 'Continue';
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Skip Button */}
//       <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
//         <Text style={styles.skipText}>Skip</Text>
//       </TouchableOpacity>

//       <View style={styles.contentWrapper}>
//         <ScrollView
//           contentContainerStyle={styles.content}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Logo */}
//           <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>          
//             <Image
//             source={require('@/assets/images/onboarding/notes.png')}
//             style={styles.image}
//             resizeMode="contain"
//             width={40}
//             height={40}
//           />
//             <Text style={styles.logo}>FutureNote</Text>
//           </View>

//           {/* Illustration */}
//           <Image
//             source={currentData.image}
//             style={styles.image}
//             resizeMode="contain"
//           />

//           {/* Title & Subtitle */}
//           <View style={styles.textContainer}>
//             <Text style={styles.title}>{currentData.title}</Text>
//             <Text style={styles.subtitle}>{currentData.subtitle}</Text>
//           </View>

//           {/* Indicators */}
//           <View style={styles.indicators}>
//             {onboardingData.map((_, index) => (
//               <View
//                 key={index}
//                 style={[
//                   styles.indicator,
//                   index === currentIndex && styles.activeIndicator,
//                 ]}
//               />
//             ))}
//           </View>
//         </ScrollView>

//         {/* Fixed Bottom Button */}
//         <View style={styles.buttonContainer}>
//           <Button
//             title={getButtonText()}
//             onPress={handleNext}
//             style={styles.nextButton}
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFF',
//   },
//   contentWrapper: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   skipButton: {
//     position: 'absolute',
//     top: 60,
//     right: 25,
//     zIndex: 10,
//   },
//   skipText: {
//     fontSize: 16,
//     color: '#B9A088',
//   },
//   logo: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#D4A373',
//     marginTop: 60,
//     marginBottom: 25,
//     textAlign: 'center',
//   },
//   content: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   image: {
//     width: width * 0.85,
//     height: height * 0.42, // bigger image
//     marginBottom: 20,
//   },
//   textContainer: {
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 14,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   indicators: {
//     marginTop: 16,
//     flexDirection: 'row',
//     marginBottom: 30,
//   },
//   indicator: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#ddd',
//     marginHorizontal: 5,
//   },
//   activeIndicator: {
//     backgroundColor: '#D4A373',
//   },
//   buttonContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 16,
//     backgroundColor: '#FFF',
//   },
//   nextButton: {
//     width: '100%',
//   },
// });







// import { LinearGradient } from 'expo-linear-gradient';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//     Dimensions,
//     FlatList,
//     Image,
//     NativeScrollEvent,
//     NativeSyntheticEvent,
//     SafeAreaView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import Animated, {
//     Easing,
//     Extrapolate,
//     interpolate,
//     useAnimatedScrollHandler,
//     useAnimatedStyle,
//     useSharedValue,
//     withDelay,
//     withRepeat,
//     withSequence,
//     withSpring,
//     withTiming
// } from 'react-native-reanimated';
// import { Button } from '../components/Button';
// import { useAppStore } from '../store/useAppStore';

// const { width, height } = Dimensions.get('window');

// const onboardingData = [
//   {
//     title: 'Welcome to Letter to Your Future Self',
//     subtitle: 'Capture today\'s thoughts, dreams, and lessons, and send them forward. A space to reflect, encourage, and inspire your future self.',
//     image: require('@/assets/images/onboarding/obb1.png'),
//     gradient: ['#FFE8D6', '#FFF5EE', '#FFFFFF'],
//     accentColor: '#D4A373',
//   },
//   {
//     title: 'A Gift Only You Can Give Your Future Self',
//     subtitle: 'Writing to yourself helps you reflect, gain perspective, and connect with your future self across time.',
//     image: require('@/assets/images/onboarding/obb2.png'),
//     gradient: ['#FFE5E5', '#FFF0F5', '#FFFFFF'],
//     accentColor: '#E88B8B',
//   },
//   {
//     title: 'Start Building Your Time Capsule of Words',
//     subtitle: 'Sign up now to preserve your memories, lessons, and aspirations in letters that your future self will one day open and treasure.',
//     image: require('@/assets/images/onboarding/obb3.png'),
//     gradient: ['#FFF4E0', '#FFFAF0', '#FFFFFF'],
//     accentColor: '#D4A373',
//   },
// ];

// const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// export const OnboardingScreen: React.FC = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const { setIsOnboardingCompleted } = useAppStore();
//   const flatListRef = useRef<FlatList>(null);
//   const scrollX = useSharedValue(0);
//   const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

//   // Floating animation for logo
//   const logoFloat = useSharedValue(0);

//   useEffect(() => {
//     logoFloat.value = withRepeat(
//       withSequence(
//         withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
//         withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
//       ),
//       -1,
//       false
//     );
//   }, []);

//   const logoAnimatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: logoFloat.value }],
//   }));

//   // Auto-scroll functionality
//   const startAutoScroll = () => {
//     autoScrollTimerRef.current = setInterval(() => {
//       setCurrentIndex((prevIndex) => {
//         const nextIndex = (prevIndex + 1) % onboardingData.length;
//         flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//         return nextIndex;
//       });
//     }, 4000);
//   };

//   const stopAutoScroll = () => {
//     if (autoScrollTimerRef.current) {
//       clearInterval(autoScrollTimerRef.current);
//       autoScrollTimerRef.current = null;
//     }
//   };

//   useEffect(() => {
//     startAutoScroll();
//     return () => stopAutoScroll();
//   }, []);

//   const handleNext = () => {
//     stopAutoScroll();
//     if (currentIndex < onboardingData.length - 1) {
//       const nextIndex = currentIndex + 1;
//       flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//       setCurrentIndex(nextIndex);
//       startAutoScroll();
//     } else {
//       setIsOnboardingCompleted(true);
//     }
//   };

//   const handleSkip = () => {
//     stopAutoScroll();
//     setIsOnboardingCompleted(true);
//   };

//   const scrollHandler = useAnimatedScrollHandler({
//     onScroll: (event) => {
//       scrollX.value = event.contentOffset.x;
//     },
//   });

//   const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const offsetX = event.nativeEvent.contentOffset.x;
//     const index = Math.round(offsetX / width);
//     setCurrentIndex(index);
//     stopAutoScroll();
//     startAutoScroll();
//   };

//   const getButtonText = () => {
//     if (currentIndex === onboardingData.length - 1) return 'Get Started';
//     return 'Next';
//   };

//   const renderItem = ({ item, index }: { item: typeof onboardingData[0]; index: number }) => {
//     return (
//       <OnboardingSlide item={item} index={index} scrollX={scrollX} />
//     );
//   };

//   const renderDots = () => {
//     return (
//       <View style={styles.indicators}>
//         {onboardingData.map((item, index) => (
//           <Dot key={index} index={index} scrollX={scrollX} accentColor={item.accentColor} />
//         ))}
//       </View>
//     );
//   };

//   // Background gradient animation
//   const backgroundAnimatedStyle = useAnimatedStyle(() => {
//     const backgroundColor = interpolate(
//       scrollX.value,
//       [0, width, width * 2],
//       [0, 1, 2],
//       Extrapolate.CLAMP
//     );

//     return {
//       opacity: withSpring(1),
//     };
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Animated Background */}
//       <Animated.View style={[StyleSheet.absoluteFill, backgroundAnimatedStyle]}>
//         <LinearGradient
//           colors={onboardingData[currentIndex].gradient}
//           style={StyleSheet.absoluteFill}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         />
//       </Animated.View>

//       {/* Decorative floating elements */}
//       <FloatingParticles />

//       {/* Skip Button */}
//       <Animated.View style={[styles.skipButtonContainer]}>
//         <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
//           <Text style={styles.skipText}>Skip</Text>
//           <Text style={styles.skipArrow}>→</Text>
//         </TouchableOpacity>
//       </Animated.View>

//       <View style={styles.contentWrapper}>
//         {/* Logo */}
//         <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
//           <Image
//             source={require('@/assets/images/onboarding/notes.png')}
//             style={styles.logoIcon}
//             resizeMode="contain"
//           />
//           <Text style={styles.logo}>FutureNote</Text>
//         </Animated.View>

//         {/* Animated FlatList */}
//         <AnimatedFlatList
//           ref={flatListRef}
//           data={onboardingData}
//           renderItem={renderItem}
//           keyExtractor={(_, index) => index.toString()}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//           onScroll={scrollHandler}
//           scrollEventThrottle={16}
//           onMomentumScrollEnd={onMomentumScrollEnd}
//           bounces={false}
//           decelerationRate="fast"
//         />

//         {/* Dots Indicator */}
//         {renderDots()}

//         {/* Fixed Bottom Button */}
//         <View style={styles.buttonContainer}>
//           <Button
//             title={getButtonText()}
//             onPress={handleNext}
//             style={styles.nextButton}
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// // Separate component for each slide with optimized animations
// const OnboardingSlide: React.FC<{
//   item: typeof onboardingData[0];
//   index: number;
//   scrollX: Animated.SharedValue<number>;
// }> = ({ item, index, scrollX }) => {
//   const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

//   const imageAnimatedStyle = useAnimatedStyle(() => {
//     const scale = interpolate(
//       scrollX.value,
//       inputRange,
//       [0.7, 1.1, 0.7],
//       Extrapolate.CLAMP
//     );

//     const rotateZ = interpolate(
//       scrollX.value,
//       inputRange,
//       [15, 0, -15],
//       Extrapolate.CLAMP
//     );

//     const opacity = interpolate(
//       scrollX.value,
//       inputRange,
//       [0.2, 1, 0.2],
//       Extrapolate.CLAMP
//     );

//     return {
//       transform: [
//         { scale: withSpring(scale, { damping: 15, stiffness: 100 }) },
//         { rotateZ: `${rotateZ}deg` },
//       ],
//       opacity: withTiming(opacity, { duration: 300 }),
//     };
//   });

//   const textAnimatedStyle = useAnimatedStyle(() => {
//     const translateY = interpolate(
//       scrollX.value,
//       inputRange,
//       [80, 0, -80],
//       Extrapolate.CLAMP
//     );

//     const opacity = interpolate(
//       scrollX.value,
//       inputRange,
//       [0, 1, 0],
//       Extrapolate.CLAMP
//     );

//     const scale = interpolate(
//       scrollX.value,
//       inputRange,
//       [0.85, 1, 0.85],
//       Extrapolate.CLAMP
//     );

//     return {
//       transform: [
//         { translateY: withSpring(translateY, { damping: 20 }) },
//         { scale: withSpring(scale) },
//       ],
//       opacity: withTiming(opacity, { duration: 400 }),
//     };
//   });

//   return (
//     <View style={styles.slide}>
//       <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
//         <Image source={item.image} style={styles.image} resizeMode="contain" />
//         {/* Glow effect behind image */}
//         <View style={[styles.imageGlow, { backgroundColor: item.accentColor }]} />
//       </Animated.View>

//       <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
//         <Text style={styles.title}>{item.title}</Text>
//         <Text style={styles.subtitle}>{item.subtitle}</Text>
//       </Animated.View>
//     </View>
//   );
// };

// // Animated dot component
// const Dot: React.FC<{
//   index: number;
//   scrollX: Animated.SharedValue<number>;
//   accentColor: string;
// }> = ({ index, scrollX, accentColor }) => {
//   const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

//   const animatedStyle = useAnimatedStyle(() => {
//     const dotWidth = interpolate(
//       scrollX.value,
//       inputRange,
//       [10, 28, 10],
//       Extrapolate.CLAMP
//     );

//     const opacity = interpolate(
//       scrollX.value,
//       inputRange,
//       [0.3, 1, 0.3],
//       Extrapolate.CLAMP
//     );

//     const scale = interpolate(
//       scrollX.value,
//       inputRange,
//       [0.8, 1.2, 0.8],
//       Extrapolate.CLAMP
//     );

//     return {
//       width: withSpring(dotWidth, { damping: 15 }),
//       opacity: withTiming(opacity, { duration: 300 }),
//       transform: [{ scale: withSpring(scale) }],
//       backgroundColor: opacity > 0.5 ? accentColor : '#ddd',
//     };
//   });

//   return <Animated.View style={[styles.indicator, animatedStyle]} />;
// };

// // Floating particles for visual appeal
// const FloatingParticles: React.FC = () => {
//   const particles = Array.from({ length: 8 });

//   return (
//     <View style={styles.particlesContainer}>
//       {particles.map((_, i) => (
//         <FloatingParticle key={i} delay={i * 400} />
//       ))}
//     </View>
//   );
// };

// const FloatingParticle: React.FC<{ delay: number }> = ({ delay }) => {
//   const translateY = useSharedValue(0);
//   const translateX = useSharedValue(0);
//   const opacity = useSharedValue(0.3);

//   useEffect(() => {
//     translateY.value = withDelay(
//       delay,
//       withRepeat(
//         withSequence(
//           withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
//           withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
//         ),
//         -1,
//         false
//       )
//     );

//     translateX.value = withDelay(
//       delay,
//       withRepeat(
//         withSequence(
//           withTiming(20, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
//           withTiming(-20, { duration: 2500, easing: Easing.inOut(Easing.ease) })
//         ),
//         -1,
//         false
//       )
//     );

//     opacity.value = withDelay(
//       delay,
//       withRepeat(
//         withSequence(
//           withTiming(0.6, { duration: 2000 }),
//           withTiming(0.2, { duration: 2000 })
//         ),
//         -1,
//         false
//       )
//     );
//   }, []);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
//     opacity: opacity.value,
//   }));

//   const randomLeft = Math.random() * width;
//   const randomTop = Math.random() * height * 0.6;
//   const randomSize = 4 + Math.random() * 8;

//   return (
//     <Animated.View
//       style={[
//         styles.particle,
//         animatedStyle,
//         {
//           left: randomLeft,
//           top: randomTop,
//           width: randomSize,
//           height: randomSize,
//         },
//       ]}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFF',
//   },
//   contentWrapper: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   skipButtonContainer: {
//     position: 'absolute',
//     top: 60,
//     right: 25,
//     zIndex: 10,
//   },
//   skipButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     gap: 4,
//   },
//   skipText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#B9A088',
//   },
//   skipArrow: {
//     fontSize: 16,
//     color: '#B9A088',
//   },
//   logoContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 10,
//     marginTop: 60,
//     marginBottom: 20,
//   },
//   logoIcon: {
//     width: 42,
//     height: 42,
//   },
//   logo: {
//     fontSize: 30,
//     fontWeight: '700',
//     color: '#D4A373',
//     letterSpacing: 0.5,
//   },
//   slide: {
//     width,
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   imageContainer: {
//     width: width * 0.85,
//     height: height * 0.40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     zIndex: 2,
//   },
//   imageGlow: {
//     position: 'absolute',
//     width: '70%',
//     height: '70%',
//     borderRadius: 999,
//     opacity: 0.15,
//     zIndex: 1,
//   },
//   textContainer: {
//     alignItems: 'center',
//     paddingHorizontal: 30,
//     marginTop: 20,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#2C2C2C',
//     textAlign: 'center',
//     marginBottom: 16,
//     lineHeight: 34,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 24,
//     fontWeight: '400',
//   },
//   indicators: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 30,
//     marginTop:20,
//     height: 20,
//   },
//   indicator: {
//     height: 6,
//     borderRadius: 5,
//     marginHorizontal: 5,
//   },
//   buttonContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   nextButton: {
//     width: '100%',
//     shadowColor: '#D4A373',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   particlesContainer: {
//     ...StyleSheet.absoluteFillObject,
//     zIndex: 0,
//   },
//   particle: {
//     position: 'absolute',
//     borderRadius: 999,
//     backgroundColor: '#D4A373',
//   },
// });





















import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const AUTO_SCROLL_INTERVAL = 4000;
const ANIMATION_DURATION = 300;

// Responsive scaling
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;

// Onboarding data - extracted for better maintainability
const ONBOARDING_DATA = [
  {
    title: 'Welcome to Letter to Your Future Self',
    subtitle: 'Capture today\'s thoughts, dreams, and lessons, and send them forward.',
    image: require('@/assets/images/onboarding/obb1.png'),
    gradient: ['#FFE8D6', '#FFF5EE', '#FFFFFF'],
    accentColor: '#D4A373',
  },
  {
    title: 'A Gift Only You Can Give',
    subtitle: 'Writing to yourself helps you reflect and gain perspective across time.',
    image: require('@/assets/images/onboarding/obb2.png'),
    gradient: ['#FFE5E5', '#FFF0F5', '#FFFFFF'],
    accentColor: '#E88B8B',
  },
  {
    title: 'Start Building Your Time Capsule',
    subtitle: 'Preserve your memories, lessons, and aspirations in letters to treasure.',
    image: require('@/assets/images/onboarding/obb3.png'),
    gradient: ['#FFF4E0', '#FFFAF0', '#FFFFFF'],
    accentColor: '#D4A373',
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Custom hook for auto-scroll functionality
const useAutoScroll = (flatListRef: React.RefObject<FlatList>, dataLength: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % dataLength;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [dataLength, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  return { currentIndex, setCurrentIndex, start, stop };
};

// Custom hook for floating animation
const useFloatingAnimation = (initialValue = 0, distance = -8, duration = 2000) => {
  const value = useSharedValue(initialValue);

  useEffect(() => {
    value.value = withRepeat(
      withSequence(
        withTiming(distance, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(initialValue, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: value.value }],
  }));
};

export const OnboardingScreen: React.FC = () => {
  const { setIsOnboardingCompleted } = useAppStore();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const { currentIndex, setCurrentIndex, start, stop } = useAutoScroll(flatListRef, ONBOARDING_DATA.length);
  const logoAnimatedStyle = useFloatingAnimation();

  const handleNext = useCallback(() => {
    stop();
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
      start();
    } else {
      setIsOnboardingCompleted(true);
    }
  }, [currentIndex, stop, start, setIsOnboardingCompleted, setCurrentIndex]);

  const handleSkip = useCallback(() => {
    stop();
    setIsOnboardingCompleted(true);
  }, [stop, setIsOnboardingCompleted]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
    stop();
    start();
  }, [setCurrentIndex, stop, start]);

  const buttonText = useMemo(
    () => (currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'),
    [currentIndex]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: typeof ONBOARDING_DATA[0]; index: number }) => (
      <OnboardingSlide item={item} index={index} scrollX={scrollX} />
    ),
    [scrollX]
  );

  const keyExtractor = useCallback((_: any, index: number) => index.toString(), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={ONBOARDING_DATA[currentIndex].gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Particles */}
      <FloatingParticles count={6} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip →</Text>
      </TouchableOpacity>

      <View style={styles.contentWrapper}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={require('@/assets/images/onboarding/notes.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logo}>FutureNote</Text>
        </Animated.View>

        {/* Slides */}
        <AnimatedFlatList
          ref={flatListRef}
          data={ONBOARDING_DATA}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          bounces={false}
          decelerationRate="fast"
          removeClippedSubviews
          maxToRenderPerBatch={2}
          windowSize={3}
        />

        {/* Dots Indicator */}
        <View style={styles.indicators}>
          {ONBOARDING_DATA.map((item, index) => (
            <Dot key={index} index={index} scrollX={scrollX} accentColor={item.accentColor} />
          ))}
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <Button title={buttonText} onPress={handleNext} style={styles.nextButton} />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Onboarding Slide Component
const OnboardingSlide: React.FC<{
  item: typeof ONBOARDING_DATA[0];
  index: number;
  scrollX: Animated.SharedValue<number>;
}> = React.memo(({ item, index, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollX.value, inputRange, [0.7, 1.1, 0.7], Extrapolate.CLAMP);
    const rotateZ = interpolate(scrollX.value, inputRange, [15, 0, -15], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.2, 1, 0.2], Extrapolate.CLAMP);

    return {
      transform: [
        { scale: withSpring(scale, { damping: 15, stiffness: 100 }) },
        { rotateZ: `${rotateZ}deg` },
      ],
      opacity: withTiming(opacity, { duration: ANIMATION_DURATION }),
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollX.value, inputRange, [80, 0, -80], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.85, 1, 0.85], Extrapolate.CLAMP);

    return {
      transform: [
        { translateY: withSpring(translateY, { damping: 20 }) },
        { scale: withSpring(scale) },
      ],
      opacity: withTiming(opacity, { duration: 400 }),
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={[styles.imageGlow, { backgroundColor: item.accentColor }]} />
      </Animated.View>

      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title} numberOfLines={3} adjustsFontSizeToFit>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={4}>
          {item.subtitle}
        </Text>
      </Animated.View>
    </View>
  );
});

// Animated Dot Component
const Dot: React.FC<{
  index: number;
  scrollX: Animated.SharedValue<number>;
  accentColor: string;
}> = React.memo(({ index, scrollX, accentColor }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(scrollX.value, inputRange, [10, 28, 10], Extrapolate.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1.2, 0.8], Extrapolate.CLAMP);

    return {
      width: withSpring(dotWidth, { damping: 15 }),
      opacity: withTiming(opacity, { duration: ANIMATION_DURATION }),
      transform: [{ scale: withSpring(scale) }],
      backgroundColor: opacity > 0.5 ? accentColor : '#ddd',
    };
  });

  return <Animated.View style={[styles.indicator, animatedStyle]} />;
});

// Floating Particles Component
const FloatingParticles: React.FC<{ count: number }> = React.memo(({ count }) => {
  const particles = useMemo(() => Array.from({ length: count }), [count]);

  return (
    <View style={styles.particlesContainer} pointerEvents="none">
      {particles.map((_, i) => (
        <FloatingParticle key={i} delay={i * 400} index={i} />
      ))}
    </View>
  );
});

const FloatingParticle: React.FC<{ delay: number; index: number }> = React.memo(({ delay, index }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(-20, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0.2, { duration: 2000 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  // Memoize random values
  const style = useMemo(
    () => ({
      left: (Math.random() * width),
      top: (Math.random() * height * 0.6),
      width: 4 + Math.random() * 8,
      height: 4 + Math.random() * 8,
    }),
    [index]
  );

  return <Animated.View style={[styles.particle, animatedStyle, style]} />;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(60) : verticalScale(40),
    right: scale(25),
    zIndex: 10,
    padding: scale(8),
  },
  skipText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#B9A088',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(10),
    marginTop: verticalScale(60),
    marginBottom: verticalScale(20),
  },
  logoIcon: {
    width: scale(42),
    height: scale(42),
  },
  logo: {
    fontSize: scale(28),
    fontWeight: '700',
    color: '#D4A373',
    letterSpacing: 0.5,
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  imageContainer: {
    width: width * 0.85,
    height: height * 0.40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  imageGlow: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    opacity: 0.15,
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: scale(30),
    maxWidth: width * 0.9,
  },
  title: {
    fontSize: isSmallDevice ? scale(22) : scale(26),
    fontWeight: '700',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: verticalScale(16),
    lineHeight: isSmallDevice ? scale(28) : scale(34),
  },
  subtitle: {
    fontSize: isSmallDevice ? scale(14) : scale(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: scale(24),
    fontWeight: '400',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(30),
    marginTop: verticalScale(20),
    height: scale(20),
  },
  indicator: {
    height: scale(6),
    borderRadius: scale(5),
    marginHorizontal: scale(5),
  },
  buttonContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  nextButton: {
    width: '100%',
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#D4A373',
  },
});