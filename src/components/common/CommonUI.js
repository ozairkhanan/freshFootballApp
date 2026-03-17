import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const TeamLogo = ({ logo, sport = 'football', size = 40, color = '#00ffe7' }) => {
  const getPlaceholderIcon = () => {
    switch (sport) {
      case 'basketball': return 'basketball';
      case 'volleyball': return 'volleyball';
      case 'hockey': return 'hockey-puck';
      case 'handball': return 'handball';
      default: return 'soccer';
    }
  };

  return (
    <View style={[styles.logoContainer, { width: size, height: size }]}>
      {logo ? (
        <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: `${color}20` }]}>
          <Icon name={getPlaceholderIcon()} size={size * 0.6} color={color} />
        </View>
      )}
    </View>
  );
};

export const StatusBadge = ({ status, statusLong, isLive, clock, sportColor = '#00ffe7' }) => {
  return (
    <View style={[styles.badge, { backgroundColor: isLive ? '#ff3b30' : 'rgba(255,255,255,0.05)' }]}>
      <Text style={styles.badgeText}>
        {isLive ? (clock?.display || 'LIVE') : status}
      </Text>
    </View>
  );
};

export const EmptyState = ({ title, message, icon = 'clipboard-text-outline' }) => (
  <View style={styles.emptyContainer}>
    <Icon name={icon} size={isTablet ? 80 : 64} color="rgba(255,255,255,0.2)" />
    <Text style={styles.emptyText}>{title}</Text>
    {message && <Text style={styles.emptySubtext}>{message}</Text>}
  </View>
);

export const InfoRow = ({ label, value, icon, iconColor = '#00ffe7' }) => (
  <View style={styles.infoRow}>
    <View style={[styles.iconBox, { backgroundColor: `${iconColor}20` }]}>
      <Icon name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export const Card = ({ children, style, sport = 'football', sportColor }) => {
  const color = sportColor || (sport === 'volleyball' ? '#9c27b0' : sport === 'basketball' ? '#ff9800' : sport === 'hockey' ? '#00bcd4' : '#00ffe7');
  
  return (
    <View style={[styles.card, { borderColor: `${color}33` }, style]}>
      {children}
    </View>
  );
};

export const SectionHeader = ({ title, icon, sportColor, style }) => (
  <View style={[styles.cardHeader, style]}>
    <View style={[styles.headerIconContainer, { backgroundColor: sportColor || '#00ffe7' }]}>
      <Icon name={icon} size={isTablet ? 20 : 18} color="#fff" />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

export const StatBar = ({ label, homeValue, awayValue, homeRatio, color = '#00ffe7' }) => (
  <View style={styles.statRow}>
    <View style={styles.statInfo}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValues}>
        <Text style={styles.statValue}>{homeValue}</Text>
        <Text style={styles.statValue}>{awayValue}</Text>
      </View>
    </View>
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={[styles.progressFill, { width: `${homeRatio * 100}%`, backgroundColor: color, alignSelf: 'flex-start' }]} />
      </View>
    </View>
  </View>
);

export const Skeleton = ({ width, height, borderRadius = 4, style }) => {
  const animatedValue = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.skeleton, 
        { width, height, borderRadius, opacity: animatedValue }, 
        style
      ]} 
    />
  );
};

export const LoadingCard = ({ sport = 'football' }) => {
  const color = sport === 'volleyball' ? '#9c27b0' : sport === 'basketball' ? '#ff9800' : sport === 'hockey' ? '#00bcd4' : '#00ffe7';
  
  return (
    <View style={[styles.card, { borderColor: `${color}10`, opacity: 0.5 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Skeleton width={60} height={20} />
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
        </View>
        <Skeleton width={30} height={20} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 24 : 16,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerIconContainer: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '800',
  },
  statRow: {
    marginBottom: 16,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statValues: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'space-between',
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
  },
  skeleton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
