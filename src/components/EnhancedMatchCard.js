import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  isTablet,
  isLargeTablet,
  getHorizontalPadding,
} from '../utils/responsive';

const { width } = Dimensions.get('window');

const EnhancedMatchCard = ({ fixture, index, onPress, sport: propSport }) => {
  const sport = propSport || fixture.sport || 'football';
  const data = normalizeFixtureData(fixture, sport);

  if (!data) return null;

  return (
    <MatchCard data={data} sport={sport} onPress={onPress} index={index} />
  );
};

// Normalize data for all sports
const normalizeFixtureData = (fixture, sport) => {
  if (!fixture) return null;

  const base = {
    id: fixture.fixtureId || fixture.id,
    date: fixture.date || fixture.fixture?.date,
    time: getFormattedMatchTime(
      fixture.time || fixture.fixture?.time,
      fixture.date || fixture.fixture?.date,
      fixture.timestamp,
    ),
    status:
      fixture.fixture?.status?.short ||
      (fixture.status && typeof fixture.status === 'object'
        ? fixture.status.short
        : fixture.status),
    statusLong:
      fixture.fixture?.status?.long ||
      (fixture.status && typeof fixture.status === 'object'
        ? fixture.status.long
        : fixture.status) ||
      'Not Started',
    league: fixture.league,
    homeTeam: fixture.homeTeam || fixture.teams?.home,
    awayTeam: fixture.awayTeam || fixture.teams?.away,
  };

  let homeScore = null;
  let awayScore = null;

  if (sport === 'football') {
    homeScore =
      fixture.goals?.home ??
      fixture.goalsHome ??
      fixture.score?.fulltime?.home ??
      null;
    awayScore =
      fixture.goals?.away ??
      fixture.goalsAway ??
      fixture.score?.fulltime?.away ??
      null;
  } else if (sport === 'basketball') {
    homeScore =
      fixture.scores?.home && typeof fixture.scores.home === 'object'
        ? fixture.scores.home.total ?? null
        : fixture.scores?.home ?? null;
    awayScore =
      fixture.scores?.away && typeof fixture.scores.away === 'object'
        ? fixture.scores.away.total ?? null
        : fixture.scores?.away ?? null;
  } else if (
    sport === 'hockey' ||
    sport === 'volleyball' ||
    sport === 'handball'
  ) {
    homeScore =
      fixture.scores?.home && typeof fixture.scores.home === 'object'
        ? fixture.scores.home.total ?? null
        : fixture.scores?.home ?? null;
    awayScore =
      fixture.scores?.away && typeof fixture.scores.away === 'object'
        ? fixture.scores.away.total ?? null
        : fixture.scores?.away ?? null;
  }

  const liveStatuses = {
    football: ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'IN'],
    basketball: ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT'],
    volleyball: ['S1', 'S2', 'S3', 'S4', 'S5'],
    hockey: ['P1', 'P2', 'P3', 'OT', 'BT', 'PT'],
    handball: ['1H', '2H', 'HT', 'ET', 'BT', 'PT'],
  };

  const isLive = (liveStatuses[sport] || []).includes(base.status);
  const finishedStatuses = [
    'FT',
    'AET',
    'PEN',
    'AOT',
    'AW',
    'POST',
    'CANC',
    'ABD',
    'ENDED',
    'FINAL',
  ];
  const isFinished =
    finishedStatuses.includes(base.status) ||
    base.statusLong?.toLowerCase().includes('finished') ||
    base.statusLong?.toLowerCase().includes('ended') ||
    base.statusLong?.toLowerCase().includes('final');

  return { ...base, homeScore, awayScore, isLive, isFinished };
};

const getFormattedMatchTime = (timeStr, dateStr, timestamp) => {
  let dateObj = null;

  if (dateStr) {
    dateObj = new Date(dateStr);
  } else if (timestamp) {
    dateObj = new Date(timestamp * 1000);
  }

  if (dateObj && !isNaN(dateObj.getTime())) {
    const now = new Date();
    const isToday =
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear();

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[dateObj.getDay()];
    const timePart = dateObj.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    if (isToday) {
      return `Today/ ${timePart}`;
    } else {
      return `${dayName}/ ${timePart}`;
    }
  }

  if (timeStr) return timeStr;
  return 'TBD';
};

// Helper function to truncate team names
const truncateName = (name, maxLength = 15) => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

// Main Card Component - Matching the screenshot exactly
const MatchCard = ({ data, sport, onPress, index }) => {
  const {
    id,
    time,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    isLive,
    isFinished,
    statusLong,
  } = data;

  const getSportColor = () => {
    switch (sport) {
      case 'basketball':
        return '#ff9800';
      case 'hockey':
        return '#00bcd4';
      case 'volleyball':
        return '#9c27b0';
      case 'handball':
        return '#4caf50';
      default:
        return '#ff9800';
    }
  };

  const hasScores =
    homeScore !== null && awayScore !== null && (isLive || isFinished);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress && onPress(id)}
      style={[styles.cardContainer, index === 0 && styles.firstCard]}
    >
      <View style={styles.cardBackground}>
        {/* Dark Inner Container with Rounded Bottom */}
        <View style={styles.darkInnerContainer}>
          {/* Time Notch - Trapezoid Shape */}
          <View style={styles.timeNotchWrapper}>
            <View style={styles.timeNotchContainer}>
              {/* Left triangle */}
              <View style={styles.notchTriangleLeft} />
              {/* Center notch with text */}
              <View style={styles.timeNotch}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              {/* Right triangle */}
              <View style={styles.notchTriangleRight} />
            </View>
            <Icon
              name="bell-outline"
              size={20}
              color="rgba(255,255,255,0.5)"
              style={styles.bellIcon}
            />
          </View>

          {/* Teams Row */}
          <View style={styles.teamsRow}>
            {/* Home Team - Circular logo outside pill on left */}
            <View style={styles.teamLeft}>
              <View style={styles.logoCircleWrapper}>
                <TeamLogo logo={homeTeam?.logo} color={getSportColor()} />
              </View>
              {/* <LinearGradient
                colors={['#1e3533', '#275550', '#2a5f58']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.teamPillLeft}
              > */}
              <View style={{ height: 35, width: 100, backgroundColor: '#275550', justifyContent: 'center', alignItems: 'center', borderRadius: 20, }}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {truncateName(homeTeam?.name)}
                </Text>
              </View>
              {/* </LinearGradient> */}
            </View>

            <View style={{ height: 35, width: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, }}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Away Team - Circular logo outside pill on right */}
            <View style={styles.teamRight}>
              {/* <LinearGradient
                colors={['#2a5f58', '#275550', '#1e3533']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.teamPillRight}
              > */}
              <View style={{ height: 35, width: 100, backgroundColor: '#275550', justifyContent: 'center', alignItems: 'center', borderRadius: 20, }}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {truncateName(awayTeam?.name)}
                </Text>
              </View>
              {/* </LinearGradient> */}
              <View style={styles.logoCircleWrapper}>
                <TeamLogo logo={awayTeam?.logo} color={getSportColor()} />
              </View>
            </View>
          </View>
        </View>

        {/* Footer with Scores - Lower glow center #1d2d2c */}
        <View style={styles.footer}>
          {hasScores ? (
            <>
              <Text style={styles.scoreText}>
                <Text style={homeScore > awayScore ? styles.scoreWinner : null}>
                  {homeScore}
                </Text>
                <Text style={styles.scoreDivider}>/</Text>
                <Text style={awayScore > homeScore ? styles.scoreWinner : null}>
                  {awayScore}
                </Text>
              </Text>
              {isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.statusText}>{statusLong}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Team Logo Component - Flag inside circular border with padding
const TeamLogo = ({ logo, color }) => {
  if (logo) {
    return (
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: logo }}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    );
  }
  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoPlaceholder, { backgroundColor: `${color}20` }]}>
        <Icon name="shield-cross-outline" size={16} color={color} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: isTablet ? (isLargeTablet ? 24 : 20) : 12,
    marginBottom: isTablet ? 16 : 10,
    borderRadius: isTablet ? 18 : 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1d7968', // Panel stroke #1d7968
  },
  firstCard: {
    marginTop: 8,
  },
  cardBackground: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1d2d2c', // Greenish outer background
  },

  // Inner Container - Blackish with rounded bottom corners
  darkInnerContainer: {
    backgroundColor: '#1c2423', // Blackish inner panel
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: 8,
    marginTop: 0,
    overflow: 'hidden',
    borderBottomWidth: 2,
    borderBottomColor: '#00ffe7', // Divider line #00ffe7
  },

  // Time Notch - Trapezoid Shape (more pronounced)
  timeNotchWrapper: {
    alignItems: 'center',
    paddingTop: 0,
    position: 'relative',
  },
  timeNotchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  notchTriangleLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 36,
    borderTopColor: '#1a4a45',
    borderLeftWidth: 18,
    borderLeftColor: 'transparent',
  },
  notchTriangleRight: {
    width: 0,
    height: 0,
    borderTopWidth: 36,
    borderTopColor: '#1a4a45',
    borderRightWidth: 18,
    borderRightColor: 'transparent',
  },
  timeNotch: {
    backgroundColor: '#1a4a45',
    paddingHorizontal: 24,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#b8e8e8',
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  bellIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },

  // Teams
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 18,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoCircleWrapper: {
    zIndex: 2,
  },
  teamPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -18,
    paddingLeft: 24,
    paddingRight: 14,
    paddingVertical: 10,
    borderRadius: 22,
    flex: 1,
  },
  teamPillRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: -18,
    paddingRight: 24,
    paddingLeft: 14,
    paddingVertical: 10,
    borderRadius: 22,
    flex: 1,
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  teamNameRight: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  vsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '400',
    marginRight: 8,
  },

  // Logo Container - Circular with gray border
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#4a5a58', // Gray border
    backgroundColor: '#1c2423',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  logoImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  logoPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer - transparent (shows greenish card background)
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // Shows the greenish #1d2d2c background
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  scoreText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  scoreWinner: {
    color: '#4caf50',
  },
  scoreDivider: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '400',
  },
  statusText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff1744',
    marginRight: 5,
  },
  liveText: {
    color: '#ff1744',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default EnhancedMatchCard;
