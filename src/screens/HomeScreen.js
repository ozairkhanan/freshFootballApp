import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import useLiveFixtures from '../hooks/useLiveFixtures';
import UnifiedMatchCard from '../components/common/UnifiedMatchCard';
import EnhancedHeader from '../components/EnhancedHeader';
import { LoadingCard, LoadingSpinner } from '../components/common/CommonUI';
import DateSelector from '../components/DateSelector';
import {
  isTabletStatic as isTablet,
  isLargeTabletStatic as isLargeTablet,
  getFontSize,
} from '../utils/responsive';
import { useWindowDimensions } from 'react-native';
import AdBanner from '../components/AdBanner';

const HomeScreen = ({ filter, selectedSport, onSportChange, navigation }) => {
  const { width: screenWidth } = useWindowDimensions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Calculate responsive values dynamically based on current screen width
  const currentIsTablet = screenWidth >= 768;
  const currentIsLargeTablet = screenWidth >= 1024;
  const maxContentWidth = currentIsLargeTablet ? 1200 : currentIsTablet ? screenWidth : undefined;
  const horizontalPadding = currentIsLargeTablet ? 32 : currentIsTablet ? 24 : 16;

  const { data, loading, error, refresh } = useLiveFixtures(
    30000,
    selectedSport,
    filter,
    selectedDate,
  );

  useEffect(() => {
    console.log(`📱 HomeScreen: ${selectedSport} - ${filter || 'all'} tab`);
  }, [filter, selectedSport]);

  const handleSportChange = newSport => {
    console.log('🎯 Sport change:', newSport);
    onSportChange(newSport);
  };

  // Handle fixture card press - Navigate to details
  const handleFixturePress = fixtureId => {
    console.log('🎯 Fixture pressed:', fixtureId);
    // Format date as YYYY-MM-DD for the API
    const formattedDate = selectedDate.toISOString().split('T')[0];
    navigation.navigate('FixtureDetails', {
      fixtureId,
      sport: selectedSport,
      date: formattedDate,
    });
  };

  // Handle league header press - Navigate to standings
  const handleLeaguePress = (league, sport) => {
    // ✅ Calculate correct season based on sport
    // Football/Hockey seasons span two years (e.g., 2024-2025 is stored as 2024)
    // Basketball uses format "2024-2025"
    // Volleyball/Handball use single year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11

    // For football/hockey: if we're in Jan-July, use previous year (season started last year)
    // If Aug-Dec, use current year (season just started)
    const footballSeason = currentMonth < 7 ? currentYear - 1 : currentYear;

    if (sport === 'basketball') {
      // Basketball: "2024-2025" format, same logic as football
      const basketballStartYear =
        currentMonth < 7 ? currentYear - 1 : currentYear;
      navigation.navigate('BasketballStandings', {
        leagueId: league.leagueId,
        leagueName: league.title,
        season: `${basketballStartYear}-${basketballStartYear + 1}`,
      });
    } else {
      // Football (default)
      navigation.navigate('Standings', {
        leagueId: league.leagueId,
        leagueName: league.title,
        season: footballSeason,
      });
    }
  };

  const renderSectionHeader = ({ section }) => {
    // ✅ Enable standings for handball too
    const hasStandings =
      selectedSport === 'football' ||
      selectedSport === 'basketball';

    // ✅ Get sport-specific colors - consistent teal theme for all sports
    const getSportTheme = () => {
      // Panel header gradient: dark teal/green
      const darkGradient = ['#1e6e5f', '#204f47', '#1d2e2a'];

      // Use consistent teal theme for all sports
      return {
        gradient: darkGradient,
        color: '#00ffe7',
        badge: {
          backgroundColor: 'rgba(0, 255, 231, 0.15)',
          borderColor: 'rgba(0, 255, 231, 0.3)',
        },
      };
    };

    const theme = getSportTheme();

    return (
      <View style={styles.sectionHeaderWrapper}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => handleLeaguePress(section, selectedSport)}
          activeOpacity={hasStandings ? 0.7 : 1}
          disabled={!hasStandings}
        >
          <LinearGradient
            colors={theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionGradient}
          >
          {/* League Logo/Badge */}
            <View style={[styles.leagueBadge, theme.badge]}>
              {section.logo ? (
                <Image
                  source={{ uri: section.logo }}
                  style={styles.leagueLogo}
                  resizeMode="contain"
                />
              ) : (
                <Icon
                  name={
                    selectedSport === 'basketball'
                      ? 'basketball'
                      : selectedSport === 'mma'
                        ? 'boxing-glove'
                        : 'soccer'
                  }
                  size={currentIsTablet ? 28 : 24}
                  color={theme.color}
                />
              )}
            </View>

            <View style={styles.leagueInfo}>
              <Text style={styles.leagueName}>
                {section.title}
              </Text>
              <View style={styles.leagueMeta}>
                {section.country && (
                  <>
                    <Text style={styles.leagueCountry} numberOfLines={1}>
                      {section.country}
                    </Text>
                    <View style={styles.metaDot} />
                  </>
                )}
                <Text style={styles.matchCount} numberOfLines={1}>
                  {section?.data?.length || 0}{' '}
                  {(section?.data?.length || 0) === 1 ? 'match' : 'matches'}
                </Text>
              </View>
            </View>

            {hasStandings && (
              <Icon name="table-pivot" size={20} color="#fff" style={styles.expandIconWrapper} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item, index }) => (
    <UnifiedMatchCard
      fixture={item}
      index={index}
      onPress={handleFixturePress}
      sport={selectedSport}
    />
  );

  const renderShimmerLoading = () => (
    <View style={styles.shimmerContainer}>
      {[1, 2, 3, 4, 5].map(i => (
        <LoadingCard key={i} sport={selectedSport} />
      ))}
    </View>
  );

  // ✅ Get count of live fixtures
  const getLiveCount = () => {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((acc, section) => {
      if (!section || !section.data || !Array.isArray(section.data)) {
        return acc;
      }
      const liveMatches = section.data.filter(f => {
        const status = f.status?.short;
        const liveStatuses = [
          '1H', '2H', 'HT', 'ET', 'BT', 'P',
          'Q1', 'Q2', 'Q3', 'Q4', 'OT',
          'P1', 'P2', 'P3',
          'S1', 'S2', 'S3', 'S4', 'S5',
          'TIE', 'PT', 'LIVE'
        ];
        return liveStatuses.includes(status);
      });
      return acc + liveMatches.length;
    }, 0);
  };

  const getAccentColor = () => {
    // Use consistent teal accent for all sports
    return '#00ffe7';
  };

  const getSportIcon = () => {
    switch (selectedSport) {
      case 'basketball':
        return 'basketball';
      case 'mma':
        return 'boxing-glove';
      case 'tennis':
        return 'tennis';
      default:
        return 'soccer';
    }
  };

  if (loading && (!data || !Array.isArray(data) || data.length === 0)) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.contentWrapper, maxContentWidth && { maxWidth: maxContentWidth }]}>
              <EnhancedHeader
                selectedSport={selectedSport}
                onSelectSport={handleSportChange}
                liveCount={0}
                showLiveCount={!filter}
              />
              <LoadingSpinner color={getAccentColor()} />
              <AdBanner />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (error && (!data || !Array.isArray(data) || data.length === 0)) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.contentWrapper, maxContentWidth && { maxWidth: maxContentWidth }]}>
              <EnhancedHeader
                selectedSport={selectedSport}
                onSelectSport={handleSportChange}
                liveCount={0}
                showLiveCount={!filter}
              />
              <View style={styles.centerContainer}>
                <LinearGradient
                  colors={['rgba(213, 0, 0, 0.15)', 'rgba(213, 0, 0, 0.05)']}
                  style={[styles.errorCard, { 
                    maxWidth: screenWidth,
                    padding: currentIsTablet ? 48 : 32,
                    borderRadius: currentIsTablet ? 28 : 24,
                  }]}
                >
                  <View style={styles.errorIconWrapper}>
                    <Icon
                      name="wifi-off"
                      size={currentIsTablet ? 48 : 40}
                      color="#ff3d3d"
                    />
                  </View>
                  <Text style={styles.errorText}>Connection Error</Text>
                  <Text style={styles.errorDetails}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                    <Text style={styles.retryText}>Retry Connection</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
              <AdBanner />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.contentWrapper, maxContentWidth && { maxWidth: maxContentWidth }]}>
              <EnhancedHeader
                selectedSport={selectedSport}
                onSelectSport={handleSportChange}
                liveCount={0}
                showLiveCount={!filter}
              />
              <View style={styles.centerContainer}>
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIconWrapper}>
                    <Icon
                      name={getSportIcon()}
                      size={currentIsTablet ? 54 : 48}
                      color={getAccentColor()}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Matches Available</Text>
                  <Text style={styles.emptyText}>
                    {filter === 'live'
                      ? `There are no live ${selectedSport} matches right now.`
                      : filter === 'upcoming'
                        ? `Keep an eye out! No upcoming ${selectedSport} matches found.`
                        : filter === 'finished'
                          ? `No recently finished matches for ${selectedSport}.`
                          : `No ${selectedSport} information available for this season.`}
                  </Text>
                </View>
              </View>
              <AdBanner />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={gradients.background} style={styles.background}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.contentWrapper, maxContentWidth && { maxWidth: maxContentWidth }]}>
            <EnhancedHeader
              selectedSport={selectedSport}
              onSelectSport={handleSportChange}
              liveCount={getLiveCount()}
              showLiveCount={!filter}
            />

            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={date => {
                console.log('📅 Date selected:', date.toISOString());
                setSelectedDate(date);
              }}
            />

            <SectionList
              sections={data}
              keyExtractor={item => (item.fixtureId || item.id || Math.random()).toString()}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              stickySectionHeadersEnabled={false}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={refresh}
                  tintColor={getAccentColor()}
                  colors={[getAccentColor()]}
                  progressBackgroundColor="#1e293b"
                />
              }
              style={{ flex: 1 }}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            <AdBanner />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1a1a', // Matching theme dark
  },
  background: { flex: 1 },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  sectionHeaderWrapper: {
    paddingHorizontal: 20,
    // marginTop: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    borderRadius: isTablet ? 18 : 14,
    // overflow: 'hidden',
    // elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sectionGradient: {
    flexDirection: 'row',
    paddingVertical: isTablet ? 16 : 14,
    paddingHorizontal: isTablet ? 20 : 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: isTablet ? 110 : 100,
    borderRadius: isTablet ? 18 : 14,
  },
  leagueBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  leagueLogo: {
    width: '80%',
    height: '80%',
  },
  leagueFlag: {
    fontSize: getFontSize(22, 26, 28),
  },
  leagueInfo: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    marginRight: 8,
  },
  leagueName: {
    color: '#fff',
    fontSize: getFontSize(15, 18, 20),
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  leagueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  leagueCountry: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: getFontSize(12, 13, 14),
    fontWeight: '600',
    flexShrink: 1,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
    flexShrink: 0,
  },
  matchCount: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: getFontSize(12, 13, 14),
    fontWeight: '500',
    flexShrink: 0,
  },
  expandIconWrapper: {
    width: 26,
    height: 26,
    // alignSelf: 'flex-end',
    borderRadius: 10,
    // marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listContent: {
    paddingBottom: isTablet ? 50 : 32,
  },
  shimmerContainer: { flex: 1, paddingTop: 16 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 24,
  },
  errorCard: {
    alignItems: 'center',
    padding: isTablet ? (isLargeTablet ? 48 : 40) : 32,
    borderRadius: isTablet ? 28 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 61, 61, 0.2)',
    width: '100%',
  },
  errorIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 61, 61, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: getFontSize(22, 24, 26),
    fontWeight: '900',
    marginBottom: 8,
  },
  errorDetails: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: getFontSize(14, 15, 16),
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#ff3d3d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    width: '100%',
  },
  emptyIconWrapper: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyIconText: {
    fontSize: getFontSize(48, 54, 60),
  },
  emptyTitle: {
    color: '#fff',
    fontSize: getFontSize(22, 24, 26),
    fontWeight: '900',
    marginBottom: 12,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: getFontSize(14, 16, 17),
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

export default HomeScreen;
