import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import SportDropdown from './SportDropdown';
import {
  isTablet,
  isLargeTablet,
  getHorizontalPadding,
} from '../utils/responsive';

const { width } = Dimensions.get('window');

// Keep original icon size
const ICON_SIZE = 24;

const EnhancedHeader = ({
  selectedSport,
  onSelectSport,
  liveCount = 0,
  showLiveCount = false,
}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          {/* LEFT: Search Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              console.log('🔍 Search button pressed for:', selectedSport);
              navigation.navigate('Search', { sport: selectedSport });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.circleButton}>
              <Icon name="magnify" size={ICON_SIZE} color="#1d2e2a" />
            </View>
          </TouchableOpacity>

          {/* CENTER: Sport Dropdown */}
          <View style={styles.centerContainer}>
            <SportDropdown
              selectedSport={selectedSport}
              onSelectSport={onSelectSport}
            />
          </View>

          {/* RIGHT: Buttons */}
          <View style={styles.rightButtons}>
            {/* Football: Transfer Market */}
            {selectedSport === 'football' && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  console.log('🔄 Transfer Market pressed');
                  navigation.navigate('TransferMarket');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.circleButton}>
                  <Icon name="swap-horizontal" size={ICON_SIZE} color="#1d2e2a" />
                </View>
              </TouchableOpacity>
            )}

            {/* Basketball: Browse Leagues */}
            {selectedSport === 'basketball' && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  console.log('🏀 Browse Basketball pressed');
                  navigation.navigate('BrowseBasketball');
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.circleButton, styles.basketballButton]}>
                  <Icon name="trophy-outline" size={ICON_SIZE} color="#ff9800" />
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                console.log('👤 Profile/Settings pressed');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.circleButton}>
                <Icon name="account-circle-outline" size={ICON_SIZE} color="#1d2e2a" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    zIndex: 1000,
  },
  headerContainer: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: Platform.OS === 'ios' ? (isTablet ? (isLargeTablet ? 56 : 52) : 48) : 12,
    paddingBottom: isTablet ? 12 : 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Center Container for Sport Dropdown
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Button Styles
  iconButton: {
    borderRadius: 22,
    overflow: 'hidden',
    zIndex: 10,
  },
  circleButton: {
    width: isTablet ? (isLargeTablet ? 50 : 48) : 44,
    height: isTablet ? (isLargeTablet ? 50 : 48) : 44,
    borderRadius: isTablet ? (isLargeTablet ? 25 : 24) : 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  basketballButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderWidth: 2,
    borderColor: '#ff9800',
  },
});

export default EnhancedHeader;
