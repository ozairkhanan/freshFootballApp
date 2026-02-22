import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallDevice = width < 360;

const ShimmerCard = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={styles.container}>
      <View style={styles.shimmerWrapper}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{translateX}],
            },
          ]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradient}
          />
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.timeBox} />
          <View style={styles.teamSection}>
            <View style={styles.teamRow}>
              <View style={styles.logo} />
              <View style={styles.teamName} />
              <View style={styles.score} />
            </View>
            <View style={[styles.teamRow, {marginTop: 12}]}>
              <View style={styles.logo} />
              <View style={styles.teamName} />
              <View style={styles.score} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: isTablet ? 10 : isSmallDevice ? 6 : 8,
    marginHorizontal: isTablet ? 24 : isSmallDevice ? 12 : 16,
  },
  shimmerWrapper: {
    backgroundColor: '#1a1a1a',
    borderRadius: isTablet ? 20 : 16,
    overflow: 'hidden',
    height: isTablet ? 140 : 120,
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    padding: isTablet ? 20 : 16,
  },
  timeBox: {
    width: isTablet ? 70 : isSmallDevice ? 50 : 60,
    height: isTablet ? 48 : 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginRight: isTablet ? 20 : 16,
  },
  teamSection: {
    flex: 1,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: isTablet ? 40 : isSmallDevice ? 28 : 32,
    height: isTablet ? 40 : isSmallDevice ? 28 : 32,
    borderRadius: isTablet ? 20 : isSmallDevice ? 14 : 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: isTablet ? 16 : 12,
  },
  teamName: {
    flex: 1,
    height: isTablet ? 18 : 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  score: {
    width: isTablet ? 40 : 32,
    height: isTablet ? 28 : 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginLeft: 12,
  },
});

export default ShimmerCard;
