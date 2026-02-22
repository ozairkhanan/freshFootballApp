import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { splashAssets } from '../assets';

const { width, height } = Dimensions.get('window');

// Generate grid-based dot pattern for background
const generateDots = () => {
  const dots = [];
  const spacing = 20; // Space between dots
  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;

  let id = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Add slight randomness to grid positions
      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 8;
      dots.push({
        id: id++,
        left: col * spacing + offsetX,
        top: row * spacing + offsetY,
        size: Math.random() * 2 + 1.5, // 1.5-3.5px dots
      });
    }
  }
  return dots;
};

const DOTS = generateDots();

const SplashScreen = ({ onFinish }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Logo appears and scales up
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Text slides up and fades in
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Navigate after splash duration
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      {/* Main gradient: Upper #33856f to Lower #001411 */}
      <LinearGradient
        colors={['#33856f', '#001411']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Dot pattern overlay - #00ffec at 5% opacity */}
        <View style={styles.dotsContainer}>
          {DOTS.map(dot => (
            <View
              key={dot.id}
              style={[
                styles.dot,
                {
                  left: dot.left,
                  top: dot.top,
                  width: dot.size,
                  height: dot.size,
                  borderRadius: dot.size / 2,
                },
              ]}
            />
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo with Wings - Center Ball */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <Image
              source={splashAssets.centerBall}
              style={styles.centerBall}
              resizeMode="contain"
            />
          </Animated.View>

          {/* App Name / Logo Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslateY }],
              },
            ]}
          >
            <Image
              source={splashAssets.logo}
              style={styles.logoText}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 255, 236, 0.05)', // #00ffec at 5% opacity
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerBall: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 350,
    maxHeight: 350,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoText: {
    width: width * 0.6,
    height: 100,
    maxWidth: 280,
  },
});

export default SplashScreen;
