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
import { LoadingCard } from '../components/common/CommonUI';
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
  const maxContentWidth = currentIsLargeTablet ? 900 : currentIsTablet ? 800 : undefined;
  const horizontalPadding = currentIsLargeTablet ? 32 : currentIsTablet ? 24 : 16;

  const { data, loading, error, refresh } = useLiveFixtures(
    15000,
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

    if (sport === 'volleyball') {
      navigation.navigate('VolleyballStandings', {
        leagueId: league.leagueId,
        leagueName: league.title,
        season: footballSeason.toString(),
      });
    } else if (sport === 'basketball') {
      // Basketball: "2024-2025" format, same logic as football
      const basketballStartYear =
        currentMonth < 7 ? currentYear - 1 : currentYear;
      navigation.navigate('BasketballStandings', {
        leagueId: league.leagueId,
        leagueName: league.title,
        season: `${basketballStartYear}-${basketballStartYear + 1}`,
      });
    } else if (sport === 'handball') {
      // Handball: similar to football
      const handballSeason = currentMonth < 7 ? currentYear - 1 : currentYear;
      navigation.navigate('HandballStandings', {
        leagueId: league.leagueId,
        leagueName: league.title,
        season: handballSeason.toString(),
      });
    } else if (sport === 'hockey') {
      // Hockey: similar to football
      const hockeySeason = currentMonth < 7 ? currentYear - 1 : currentYear;
      navigation.navigate('HockeyStandings', {
        leagueId: league.leagueId,
        leagueName: league.title,
        season: hockeySeason.toString(),
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
      selectedSport === 'basketball' ||
      selectedSport === 'volleyball' ||
      selectedSport === 'handball' ||
      selectedSport === 'hockey';
    // ✅ Added handball

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
          {/* <LinearGradient
            colors={theme.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionGradient}
          > */}
          {/* League Logo/Badge */}
          <View style={styles.sectionGradient}>
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
                    selectedSport === 'volleyball'
                      ? 'volleyball'
                      : selectedSport === 'basketball'
                        ? 'basketball'
                        : selectedSport === 'hockey'
                          ? 'hockey-puck'
                          : selectedSport === 'mma'
                            ? 'boxing-glove'
                            : selectedSport === 'handball'
                              ? 'handball'
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
                  {section.data.length}{' '}
                  {section.data.length === 1 ? 'match' : 'matches'}
                </Text>
              </View>
            </View>

            {hasStandings && (
              // <LinearGradient
              //   colors={[`${theme.color}40`, `${theme.color}10`]}
              //   style={styles.expandIconWrapper}
              // >
              <Icon name="table-pivot" size={20} color="#fff" style={styles.expandIconWrapper} />
            )}
          </View>

          {/* </LinearGradient> */}
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

  const getLiveCount = () => {
    return data.reduce((acc, section) => {
      const liveMatches = section.data.filter(f => {
        const status = f.status?.short;
        const liveStatuses = [
          '1H',
          '2H',
          'HT',
          'ET',
          'BT',
          'P',
          'Q1',
          'Q2',
          'Q3',
          'Q4',
          'OT',
          'P1',
          'P2',
          'P3',
          'S1',
          'S2',
          'S3',
          'S4',
          'S5',
          'PT',
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
      case 'volleyball':
        return 'volleyball';
      case 'hockey':
        return 'hockey-puck';
      case 'mma':
        return 'boxing-glove';
      case 'handball':
        return 'handball';
      default:
        return 'soccer';
    }
  };

  if (loading && data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <View style={[styles.contentWrapper, maxContentWidth && { maxWidth: maxContentWidth }]}>
            <EnhancedHeader
              selectedSport={selectedSport}
              onSelectSport={handleSportChange}
              liveCount={0}
              showLiveCount={!filter}
            />
            {renderShimmerLoading()}
            <AdBanner />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error && data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <LinearGradient colors={gradients.background} style={styles.background}>
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
                style={styles.errorCard}
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
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <LinearGradient colors={gradients.background} style={styles.background}>
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
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        <View style={styles.contentWrapper}>
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
          keyExtractor={item => item.fixtureId.toString()}
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
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: { flex: 1 },
  contentWrapper: {
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  sectionHeaderWrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
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
    maxWidth: isTablet ? 500 : 400,
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
    maxWidth: isTablet ? 500 : 400,
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
