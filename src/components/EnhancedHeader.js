import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import SportDropdown from './SportDropdown';
import { navIcons, transferIcons, profileIcons } from '../assets';
import {
  isTablet,
  isLargeTablet,
  getHorizontalPadding,
} from '../utils/responsive';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

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
              <Image source={navIcons.search} style={styles.headerIcon} />
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
                  <Image
                    source={navIcons.transfer}
                    style={[styles.headerIcon, { tintColor: '#000' }]}
                  />
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
                  <Image
                    source={navIcons.trophy}
                    style={[styles.headerIcon, { tintColor: '#ff9800' }]}
                  />
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
                <Image
                  source={navIcons.profileSetting}
                  style={styles.headerIcon}
                />
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
  // Keep same size as original Icon (24px)
  headerIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    resizeMode: 'contain',
  },
  basketballButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderWidth: 2,
    borderColor: '#ff9800',
  },
});

export default EnhancedHeader;
