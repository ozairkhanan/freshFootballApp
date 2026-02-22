import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const OverviewTab = ({ fixture, venueDetails, lineups, sport = 'football', navigation }) => {
  if (!fixture) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="information-circle-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No match information available</Text>
      </View>
    );
  }

  // ✅ Sport-specific rendering
  if (sport === 'hockey') {
    return renderHockeyOverview(fixture);
  }

  if (sport === 'volleyball') {
    return renderVolleyballOverview(fixture);
  }

  if (sport === 'basketball') {
    return renderBasketballOverview(fixture);
  }

  return renderFootballOverview(fixture, venueDetails, lineups, navigation);
};

// ✅ HOCKEY OVERVIEW
const renderHockeyOverview = fixture => {
  const periods = fixture.periods || {};

  // Parse period scores (format: "0-2" string or object)
  const parsePeriod = periodData => {
    if (!periodData) return null;

    // If it's a string like "0-2"
    if (typeof periodData === 'string') {
      const parts = periodData.split('-');
      if (parts.length === 2) {
        const home = parseInt(parts[0], 10);
        const away = parseInt(parts[1], 10);
        if (!isNaN(home) && !isNaN(away)) {
          return { home, away };
        }
      }
      return null;
    }

    // If it's already an object
    if (typeof periodData === 'object' && periodData !== null) {
      return {
        home: periodData.home ?? 0,
        away: periodData.away ?? 0,
      };
    }

    return null;
  };

  const periodData = [
    { name: '1st', data: parsePeriod(periods.first) },
    { name: '2nd', data: parsePeriod(periods.second) },
    { name: '3rd', data: parsePeriod(periods.third) },
  ];

  // Add overtime if exists
  if (periods.overtime) {
    periodData.push({ name: 'OT', data: parsePeriod(periods.overtime) });
  }

  // Add penalties/shootout if exists
  if (periods.penalties) {
    periodData.push({ name: 'SO', data: parsePeriod(periods.penalties) });
  }

  const validPeriods = periodData.filter(p => p.data !== null);

  // ✅ FIXED: Hockey scores are at root level (integers)
  const homeScore = fixture.scores?.home ?? 0;
  const awayScore = fixture.scores?.away ?? 0;

  // ✅ FIXED: Get date from correct location for hockey
  const matchDate = fixture.date || fixture.fixture?.date;
  const matchTime = fixture.time || fixture.fixture?.time;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Match Info */}
      <View style={[styles.card, styles.hockeyCard]}>
        <View style={styles.cardHeader}>
          <MIcon name="hockey-puck" size={isTablet ? 28 : 24} color="#00bcd4" />
          <Text style={styles.cardTitle}>Match Information</Text>
        </View>

        {fixture.league && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.hockeyIcon]}>
              <Icon
                name="trophy-outline"
                size={isTablet ? 20 : 18}
                color="#00bcd4"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Competition</Text>
              <Text style={styles.infoValue}>{fixture.league.name}</Text>
            </View>
          </View>
        )}

        {fixture.country && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.hockeyIcon]}>
              <Icon
                name="time-outline"
                size={isTablet ? 20 : 18}
                color="#00bcd4"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{fixture.country.name}</Text>
            </View>
          </View>
        )}

        {/* ✅ FIXED: Date handling for hockey */}
        {matchDate && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.hockeyIcon]}>
              <Icon name="calendar-outline" size={isTablet ? 20 : 18} color="#00bcd4" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(matchDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}

        {matchTime && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.hockeyIcon]}>
              <Icon
                name="time-outline"
                size={isTablet ? 20 : 18}
                color="#00bcd4"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{matchTime}</Text>
            </View>
          </View>
        )}

        {/* Status */}
        {fixture.status && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.hockeyIcon]}>
              <Icon
                name="information-circle-outline"
                size={isTablet ? 20 : 18}
                color="#00bcd4"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {fixture.status.long || fixture.status.short || 'Unknown'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ✅ Period Scores */}
      {validPeriods.length > 0 && (
        <View style={[styles.card, styles.hockeyCard]}>
          <View style={styles.cardHeader}>
            <Icon
              name="time-outline"
              size={isTablet ? 28 : 24}
              color="#00bcd4"
            />
            <Text style={styles.cardTitle}>Period Scores</Text>
          </View>

          {/* Header */}
          <View style={styles.setHeader}>
            <Text style={styles.setHeaderTeam}>Team</Text>
            {validPeriods.map((period, index) => (
              <Text key={index} style={styles.setHeaderNum}>
                {period.name}
              </Text>
            ))}
            <Text style={styles.setHeaderTotal}>Total</Text>
          </View>

          {/* Home Team */}
          <View style={styles.setRow}>
            <View style={styles.setTeam}>
              {fixture.teams?.home?.logo ? (
                <Image
                  source={{ uri: fixture.teams.home.logo }}
                  style={styles.setTeamLogo}
                />
              ) : (
                <View
                  style={[
                    styles.setTeamLogoPlaceholder,
                    styles.hockeyLogoPlaceholder,
                  ]}
                >
                  <Icon name="hockey-puck" size={16} color="#00bcd4" />
                </View>
              )}
              <Text style={styles.setTeamName} numberOfLines={1}>
                {fixture.teams?.home?.name || 'Home'}
              </Text>
            </View>
            {validPeriods.map((period, index) => (
              <Text
                key={index}
                style={[
                  styles.setScore,
                  period.data &&
                    period.data.home > period.data.away &&
                    styles.hockeyPeriodWin,
                ]}
              >
                {period.data?.home ?? '-'}
              </Text>
            ))}
            <Text
              style={[
                styles.setTotal,
                homeScore > awayScore && styles.hockeyTotalWin,
              ]}
            >
              {homeScore}
            </Text>
          </View>

          {/* Away Team */}
          <View style={styles.setRow}>
            <View style={styles.setTeam}>
              {fixture.teams?.away?.logo ? (
                <Image
                  source={{ uri: fixture.teams.away.logo }}
                  style={styles.setTeamLogo}
                />
              ) : (
                <View
                  style={[
                    styles.setTeamLogoPlaceholder,
                    styles.hockeyLogoPlaceholder,
                  ]}
                >
                  <Icon name="hockey-puck" size={16} color="#00bcd4" />
                </View>
              )}
              <Text style={styles.setTeamName} numberOfLines={1}>
                {fixture.teams?.away?.name || 'Away'}
              </Text>
            </View>
            {validPeriods.map((period, index) => (
              <Text
                key={index}
                style={[
                  styles.setScore,
                  period.data &&
                    period.data.away > period.data.home &&
                    styles.hockeyPeriodWin,
                ]}
              >
                {period.data?.away ?? '-'}
              </Text>
            ))}
            <Text
              style={[
                styles.setTotal,
                awayScore > homeScore && styles.hockeyTotalWin,
              ]}
            >
              {awayScore}
            </Text>
          </View>
        </View>
      )}

      {/* Final Result */}
      <View style={[styles.card, styles.hockeyCard]}>
        <View style={styles.cardHeader}>
          <Icon name="trophy-outline" size={isTablet ? 28 : 24} color="#00bcd4" />
          <Text style={styles.cardTitle}>Final Result</Text>
        </View>

        <View style={styles.finalScore}>
          <View style={styles.finalTeam}>
            {fixture.teams?.home?.logo ? (
              <Image
                source={{ uri: fixture.teams.home.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View
                style={[
                  styles.finalLogoPlaceholder,
                  styles.hockeyFinalLogoPlaceholder,
                ]}
              >
                <Icon name="hockey-puck" size={24} color="#00bcd4" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.home?.name || 'Home'}
            </Text>
          </View>

          <View style={styles.finalScoreBox}>
            <Text style={[styles.finalScoreText, { color: '#00bcd4' }]}>
              {homeScore} - {awayScore}
            </Text>
            <Text style={styles.finalScoreLabel}>Goals</Text>
          </View>

          <View style={styles.finalTeam}>
            {fixture.teams?.away?.logo ? (
              <Image
                source={{ uri: fixture.teams.away.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View
                style={[
                  styles.finalLogoPlaceholder,
                  styles.hockeyFinalLogoPlaceholder,
                ]}
              >
                <Icon name="hockey-puck" size={24} color="#00bcd4" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.away?.name || 'Away'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ✅ VOLLEYBALL OVERVIEW
const renderVolleyballOverview = fixture => {
  const periods = fixture.periods || {};
  const setNames = ['first', 'second', 'third', 'fourth', 'fifth'];

  // Build set scores array
  const sets = [];
  setNames.forEach((name, index) => {
    if (periods[name] && periods[name].home !== null) {
      sets.push({
        set: index + 1,
        home: periods[name].home,
        away: periods[name].away,
      });
    }
  });

  // ✅ FIXED: Volleyball scores are integers directly
  const homeScore = fixture.scores?.home ?? 0;
  const awayScore = fixture.scores?.away ?? 0;

  // ✅ FIXED: Get date from correct location
  const matchDate = fixture.date || fixture.fixture?.date;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Match Info */}
      <View style={[styles.card, styles.volleyballCard]}>
        <View style={styles.cardHeader}>
          <MIcon name="volleyball" size={isTablet ? 28 : 24} color="#9c27b0" />
          <Text style={styles.cardTitle}>Match Information</Text>
        </View>

        {fixture.league && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.volleyballIcon]}>
              <Icon
                name="trophy-outline"
                size={isTablet ? 20 : 18}
                color="#9c27b0"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Competition</Text>
              <Text style={styles.infoValue}>{fixture.league.name}</Text>
            </View>
          </View>
        )}

        {fixture.country && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.volleyballIcon]}>
              <Icon
                name="flag-outline"
                size={isTablet ? 20 : 18}
                color="#9c27b0"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{fixture.country.name}</Text>
            </View>
          </View>
        )}

        {matchDate && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.volleyballIcon]}>
              <Icon name="calendar-outline" size={isTablet ? 20 : 18} color="#9c27b0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(matchDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, styles.volleyballIcon]}>
            <Icon
              name="time-outline"
              size={isTablet ? 20 : 18}
              color="#9c27b0"
            />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{fixture.time || 'TBD'}</Text>
          </View>
        </View>
      </View>

      {/* ✅ Set Scores */}
      {sets.length > 0 && (
        <View style={[styles.card, styles.volleyballCard]}>
          <View style={styles.cardHeader}>
            <Icon
              name="format-list-numbered"
              size={isTablet ? 28 : 24}
              color="#9c27b0"
            />
            <Text style={styles.cardTitle}>Set Scores</Text>
          </View>

          {/* Header */}
          <View style={styles.setHeader}>
            <Text style={styles.setHeaderTeam}>Team</Text>
            {sets.map((set, index) => (
              <Text key={index} style={styles.setHeaderNum}>
                S{set.set}
              </Text>
            ))}
            <Text style={styles.setHeaderTotal}>Total</Text>
          </View>

          {/* Home Team */}
          <View style={styles.setRow}>
            <View style={styles.setTeam}>
              {fixture.teams?.home?.logo ? (
                <Image
                  source={{ uri: fixture.teams.home.logo }}
                  style={styles.setTeamLogo}
                />
              ) : (
                <View style={styles.setTeamLogoPlaceholder}>
                  <Icon name="volleyball" size={16} color="#9c27b0" />
                </View>
              )}
              <Text style={styles.setTeamName} numberOfLines={1}>
                {fixture.teams?.home?.name}
              </Text>
            </View>
            {sets.map((set, index) => (
              <Text
                key={index}
                style={[
                  styles.setScore,
                  set.home > set.away && styles.setScoreWin,
                ]}
              >
                {set.home}
              </Text>
            ))}
            <Text
              style={[
                styles.setTotal,
                homeScore > awayScore && styles.setTotalWin,
              ]}
            >
              {homeScore}
            </Text>
          </View>

          {/* Away Team */}
          <View style={styles.setRow}>
            <View style={styles.setTeam}>
              {fixture.teams?.away?.logo ? (
                <Image
                  source={{ uri: fixture.teams.away.logo }}
                  style={styles.setTeamLogo}
                />
              ) : (
                <View style={styles.setTeamLogoPlaceholder}>
                  <Icon name="volleyball" size={16} color="#9c27b0" />
                </View>
              )}
              <Text style={styles.setTeamName} numberOfLines={1}>
                {fixture.teams?.away?.name}
              </Text>
            </View>
            {sets.map((set, index) => (
              <Text
                key={index}
                style={[
                  styles.setScore,
                  set.away > set.home && styles.setScoreWin,
                ]}
              >
                {set.away}
              </Text>
            ))}
            <Text
              style={[
                styles.setTotal,
                awayScore > homeScore && styles.setTotalWin,
              ]}
            >
              {awayScore}
            </Text>
          </View>
        </View>
      )}

      {/* Final Result */}
      <View style={[styles.card, styles.volleyballCard]}>
        <View style={styles.cardHeader}>
          <Icon name="trophy-outline" size={isTablet ? 28 : 24} color="#9c27b0" />
          <Text style={styles.cardTitle}>Final Result</Text>
        </View>

        <View style={styles.finalScore}>
          <View style={styles.finalTeam}>
            {fixture.teams?.home?.logo ? (
              <Image
                source={{ uri: fixture.teams.home.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View style={styles.finalLogoPlaceholder}>
                <Icon name="volleyball" size={24} color="#9c27b0" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.home?.name}
            </Text>
          </View>

          <View style={styles.finalScoreBox}>
            <Text style={[styles.finalScoreText, { color: '#9c27b0' }]}>
              {homeScore} - {awayScore}
            </Text>
            <Text style={styles.finalScoreLabel}>Sets</Text>
          </View>

          <View style={styles.finalTeam}>
            {fixture.teams?.away?.logo ? (
              <Image
                source={{ uri: fixture.teams.away.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View style={styles.finalLogoPlaceholder}>
                <Icon name="volleyball" size={24} color="#9c27b0" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.away?.name}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// BASKETBALL OVERVIEW
const renderBasketballOverview = fixture => {
  const scores = fixture.scores || {};

  // ✅ FIXED: Get date from correct location
  const matchDate = fixture.date || fixture.fixture?.date;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, styles.basketballCard]}>
        <View style={styles.cardHeader}>
          <Icon name="basketball-outline" size={isTablet ? 28 : 24} color="#ff9800" />
          <Text style={styles.cardTitle}>Match Information</Text>
        </View>

        {fixture.league && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.basketballIcon]}>
              <Icon
                name="trophy-outline"
                size={isTablet ? 20 : 18}
                color="#ff9800"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Competition</Text>
              <Text style={styles.infoValue}>{fixture.league.name}</Text>
            </View>
          </View>
        )}

        {fixture.country && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.basketballIcon]}>
              <Icon
                name="flag-outline"
                size={isTablet ? 20 : 18}
                color="#ff9800"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{fixture.country.name}</Text>
            </View>
          </View>
        )}

        {matchDate && (
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, styles.basketballIcon]}>
              <Icon name="calendar-outline" size={isTablet ? 20 : 18} color="#ff9800" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(matchDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Quarter Scores */}
      {(scores.home || scores.away) && (
        <View style={[styles.card, styles.basketballCard]}>
          <View style={styles.cardHeader}>
            <Icon
              name="time-outline"
              size={isTablet ? 28 : 24}
              color="#ff9800"
            />
            <Text style={styles.cardTitle}>Quarter Scores</Text>
          </View>

          <View style={styles.quarterGrid}>
            <View style={styles.quarterHeader}>
              <Text style={[styles.quarterLabel, { flex: 1 }]}>Team</Text>
              <Text style={styles.quarterLabel}>Q1</Text>
              <Text style={styles.quarterLabel}>Q2</Text>
              <Text style={styles.quarterLabel}>Q3</Text>
              <Text style={styles.quarterLabel}>Q4</Text>
              <Text style={styles.quarterLabel}>T</Text>
            </View>

            <View style={styles.quarterRow}>
              <Text style={styles.quarterTeam} numberOfLines={1}>
                {fixture.teams?.home?.name}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.home?.quarter_1 ?? '-'}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.home?.quarter_2 ?? '-'}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.home?.quarter_3 ?? '-'}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.home?.quarter_4 ?? '-'}
              </Text>
              <Text style={[styles.quarterTotal, { color: '#ff9800' }]}>
                {scores.home?.total ?? 0}
              </Text>
            </View>

            <View style={styles.quarterRow}>
              <Text style={styles.quarterTeam} numberOfLines={1}>
                {fixture.teams?.away?.name}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.away?.quarter_1 ?? '-'}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.away?.quarter_2 ?? '-'}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.away?.quarter_3 ?? '-'}
              </Text>
              <Text style={styles.quarterScore}>
                {scores.away?.quarter_4 ?? '-'}
              </Text>
              <Text style={[styles.quarterTotal, { color: '#ff9800' }]}>
                {scores.away?.total ?? 0}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Final Result */}
      <View style={[styles.card, styles.basketballCard]}>
        <View style={styles.cardHeader}>
          <Icon name="trophy-outline" size={isTablet ? 28 : 24} color="#ff9800" />
          <Text style={styles.cardTitle}>Final Result</Text>
        </View>

        <View style={styles.finalScore}>
          <View style={styles.finalTeam}>
            {fixture.teams?.home?.logo ? (
              <Image
                source={{ uri: fixture.teams.home.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View
                style={[
                  styles.finalLogoPlaceholder,
                  styles.basketballFinalLogoPlaceholder,
                ]}
              >
                <Icon name="basketball-outline" size={24} color="#ff9800" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.home?.name}
            </Text>
          </View>

          <View style={styles.finalScoreBox}>
            <Text style={[styles.finalScoreText, { color: '#ff9800' }]}>
              {scores.home?.total ?? 0} - {scores.away?.total ?? 0}
            </Text>
            <Text style={styles.finalScoreLabel}>Points</Text>
          </View>

          <View style={styles.finalTeam}>
            {fixture.teams?.away?.logo ? (
              <Image
                source={{ uri: fixture.teams.away.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View
                style={[
                  styles.finalLogoPlaceholder,
                  styles.basketballFinalLogoPlaceholder,
                ]}
              >
                <Icon name="basketball" size={24} color="#ff9800" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.away?.name}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// FOOTBALL OVERVIEW
const renderFootballOverview = (fixture, venueDetails, lineups, navigation) => {
  // ✅ FIXED: Get date from correct location
  const matchDate = fixture.fixture?.date || fixture.date;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Venue */}
      {(fixture.fixture?.venue || venueDetails) && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#00ffe7', '#00d2ff']}
              style={styles.headerIconContainer}
            >
              <Icon
                name="business-outline"
                size={isTablet ? 20 : 18}
                color="#fff"
              />
            </LinearGradient>
            <Text style={styles.cardTitle}>Venue Spotlight</Text>
          </View>

          {venueDetails?.image && (
            <View style={styles.venueImageWrapper}>
              <Image 
                source={{ uri: venueDetails.image }} 
                style={styles.venueImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(29, 45, 44, 0.9)']}
                style={styles.venueImageGradient}
              />
              <View style={styles.venueOverlayContent}>
                  <Text style={styles.venueNameOnImage}>{venueDetails.name}</Text>
                  <Text style={styles.venueCityOnImage}>{venueDetails.city}, {venueDetails.country}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="layers" size={isTablet ? 18 : 16} color="#00ffe7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Stadium</Text>
              <Text style={styles.infoValue}>
                {venueDetails?.name || fixture.fixture?.venue?.name || 'TBD'}
              </Text>
            </View>
          </View>

          {venueDetails?.capacity && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="people-outline" size={isTablet ? 18 : 16} color="#00ffe7" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Capacity</Text>
                <Text style={styles.infoValue}>
                  {venueDetails.capacity.toLocaleString()} Seats
                </Text>
              </View>
            </View>
          )}

          {venueDetails?.surface && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="leaf-outline" size={isTablet ? 18 : 16} color="#00ffe7" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Surface</Text>
                <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                  {venueDetails.surface}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon
                name="location-outline"
                size={isTablet ? 18 : 16}
                color="#00ffe7"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>
                {venueDetails?.city || fixture.fixture?.venue?.city || 'TBD'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Match Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#4caf50', '#8bc34a']}
            style={styles.headerIconContainer}
          >
            <Icon name="football-outline" size={isTablet ? 20 : 18} color="#fff" />
          </LinearGradient>
          <Text style={styles.cardTitle}>Match Information</Text>
        </View>

        {fixture.fixture?.referee && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MIcon name="whistle-outline" size={isTablet ? 18 : 16} color="#00ffe7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Referee</Text>
              <Text style={styles.infoValue}>{fixture.fixture.referee}</Text>
            </View>
          </View>
        )}

        {matchDate && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="calendar-outline" size={isTablet ? 18 : 16} color="#00ffe7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(matchDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}

        {fixture.league && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon
                name="trophy-outline"
                size={isTablet ? 18 : 16}
                color="#00ffe7"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Competition</Text>
              <Text style={styles.infoValue}>{fixture.league.name}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Managers / Coaches */}
      {lineups && lineups.length > 0 && (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <LinearGradient
                  colors={['#ff9800', '#fbc531']}
                  style={styles.headerIconContainer}
                >
                  <Icon name="person-outline" size={isTablet ? 20 : 18} color="#fff" />
                </LinearGradient>
                <Text style={styles.cardTitle}>Managers</Text>
            </View>
            
            <View style={styles.managersRow}>
                {lineups.map((teamLineup, index) => {
                    const coach = teamLineup.coach;
                    if (!coach) return null;

                    return (
                        <TouchableOpacity 
                            key={index}
                            style={styles.managerItem}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('CoachProfile', { coachId: coach.id, teamId: teamLineup.team?.id })}
                        >
                            <Image 
                                source={{uri: coach.photo || `https://media.api-sports.io/football/coachs/${coach.id}.png`}} 
                                style={styles.managerPhoto} 
                            />
                            <Text style={styles.managerName} numberOfLines={1}>{coach.name}</Text>
                            <Text style={styles.managerTeam} numberOfLines={1}>{teamLineup.team?.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
      )}

      {/* Score */}
      {fixture.score && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="stats-chart-outline" size={isTablet ? 28 : 24} color="#00ffe7" />
            <Text style={styles.cardTitle}>Score</Text>
          </View>

          <View style={styles.scoreGrid}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Halftime</Text>
              <Text style={styles.scoreValue}>
                {fixture.score.halftime?.home ?? '-'} -{' '}
                {fixture.score.halftime?.away ?? '-'}
              </Text>
            </View>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Fulltime</Text>
              <Text style={styles.scoreValue}>
                {fixture.score.fulltime?.home ?? '-'} -{' '}
                {fixture.score.fulltime?.away ?? '-'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Final Result */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="trophy-outline" size={isTablet ? 28 : 24} color="#00ffe7" />
          <Text style={styles.cardTitle}>Final Result</Text>
        </View>

        <View style={styles.finalScore}>
          <View style={styles.finalTeam}>
            {fixture.teams?.home?.logo ? (
              <Image
                source={{ uri: fixture.teams.home.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View style={styles.finalLogoPlaceholder}>
                <Icon name="football" size={24} color="#00ffe7" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.home?.name}
            </Text>
          </View>

          <View style={styles.finalScoreBox}>
            <Text style={[styles.finalScoreText, { color: '#00ffe7' }]}>
              {fixture.goals?.home ?? 0} - {fixture.goals?.away ?? 0}
            </Text>
            <Text style={styles.finalScoreLabel}>Goals</Text>
          </View>

          <View style={styles.finalTeam}>
            {fixture.teams?.away?.logo ? (
              <Image
                source={{ uri: fixture.teams.away.logo }}
                style={styles.finalLogo}
              />
            ) : (
              <View style={styles.finalLogoPlaceholder}>
                <Icon name="football" size={24} color="#00ffe7" />
              </View>
            )}
            <Text style={styles.finalTeamName}>
              {fixture.teams?.away?.name}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 80,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginTop: isTablet ? 24 : 20,
  },
  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 24 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  volleyballCard: {
    borderColor: 'rgba(156, 39, 176, 0.2)',
  },
  basketballCard: {
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  hockeyCard: {
    borderColor: 'rgba(0, 188, 212, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerIconContainer: {
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    borderRadius: isTablet ? 12 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoIcon: {
    width: isTablet ? 44 : 38,
    height: isTablet ? 44 : 38,
    borderRadius: isTablet ? 22 : 19,
    backgroundColor: 'rgba(0, 255, 231, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 16 : 12,
  },
  volleyballIcon: {
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
  },
  basketballIcon: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
  },
  hockeyIcon: {
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  // Set/Period Scores
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: isTablet ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: isTablet ? 12 : 10,
  },
  setHeaderTeam: {
    flex: 1,
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
    fontWeight: '700',
  },
  setHeaderNum: {
    width: isTablet ? 45 : 38,
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  setHeaderTotal: {
    width: isTablet ? 50 : 42,
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  setTeam: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setTeamLogo: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    borderRadius: isTablet ? 14 : 12,
    marginRight: isTablet ? 10 : 8,
  },
  setTeamLogoPlaceholder: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    borderRadius: isTablet ? 14 : 12,
    marginRight: isTablet ? 10 : 8,
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hockeyLogoPlaceholder: {
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
  },
  setTeamName: {
    color: '#fff',
    fontSize: isTablet ? 14 : 13,
    fontWeight: '600',
    flex: 1,
  },
  setScore: {
    width: isTablet ? 45 : 38,
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  setScoreWin: {
    color: '#4caf50',
    fontWeight: '800',
  },
  hockeyPeriodWin: {
    color: '#4caf50',
    fontWeight: '800',
  },
  setTotal: {
    width: isTablet ? 50 : 42,
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  setTotalWin: {
    color: '#9c27b0',
  },
  hockeyTotalWin: {
    color: '#00bcd4',
  },
  // Final Score
  finalScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: isTablet ? 20 : 16,
  },
  finalTeam: {
    flex: 1,
    alignItems: 'center',
  },
  finalLogo: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    marginBottom: isTablet ? 10 : 8,
  },
  finalLogoPlaceholder: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    marginBottom: isTablet ? 10 : 8,
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hockeyFinalLogoPlaceholder: {
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
  },
  basketballFinalLogoPlaceholder: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
  },
  finalTeamName: {
    color: '#fff',
    fontSize: isTablet ? 13 : 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  finalScoreBox: {
    alignItems: 'center',
    paddingHorizontal: isTablet ? 24 : 20,
  },
  finalScoreText: {
    color: '#fff',
    fontSize: isTablet ? 36 : 30,
    fontWeight: '900',
  },
  finalScoreLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginTop: 4,
  },
  // Basketball Quarter styles
  quarterGrid: {
    marginTop: isTablet ? 8 : 4,
  },
  quarterHeader: {
    flexDirection: 'row',
    paddingBottom: isTablet ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  quarterLabel: {
    width: isTablet ? 45 : 38,
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  quarterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  quarterTeam: {
    flex: 1,
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  quarterScore: {
    width: isTablet ? 45 : 38,
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 14 : 12,
    textAlign: 'center',
  },
  quarterTotal: {
    width: isTablet ? 45 : 38,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  // Football Score Grid
  scoreGrid: {
    marginTop: isTablet ? 8 : 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: isTablet ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
  },
  scoreValue: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '800',
  },
  // Venue Spotlight
  venueImageWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  venueImage: {
    width: '100%',
    height: '100%',
  },
  venueImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  venueOverlayContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  venueNameOnImage: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  venueCityOnImage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  // Managers
  managersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  managerItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  managerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 231, 0.3)',
    marginBottom: 8,
  },
  managerPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  managerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  managerTeam: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default OverviewTab;
