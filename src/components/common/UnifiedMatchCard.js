import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TeamLogo, StatusBadge } from './CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

/**
 * UnifiedMatchCard - A single, high-performance match card for all sports
 */
const UnifiedMatchCard = ({ fixture, sport = 'football', onPress, index }) => {
  const data = normalizeFixtureData(fixture, sport);
  if (!data) return null;

  const sportColor = getSportColor(sport);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress && onPress(data.id)}
      style={[styles.cardContainer, index === 0 && styles.firstCard]}
    >
      <View style={styles.cardBackground}>
        {/* Dark Inner Container */}
        <View style={styles.darkInnerContainer}>
          {/* Time Notch */}
          <View style={styles.timeNotchWrapper}>
            <View style={styles.timeNotchContainer}>
              <View style={styles.notchTriangleLeft} />
              <View style={styles.timeNotch}>
                <Text style={styles.timeText}>{data.time}</Text>
              </View>
              <View style={styles.notchTriangleRight} />
            </View>
            <Icon name="bell-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.bellIcon} />
          </View>

          {/* Teams Row */}
          <View style={styles.teamsRow}>
            <View style={styles.teamSide}>
              <TeamLogo logo={data.homeTeam?.logo} sport={sport} color={sportColor} size={30} />
              <View style={styles.teamPill}>
                <Text style={styles.teamName} numberOfLines={1}>{data.homeTeam?.name}</Text>
              </View>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={[styles.teamSide, styles.teamSideRight]}>
              <View style={[styles.teamPill, styles.teamPillRight]}>
                <Text style={styles.teamName} numberOfLines={1}>{data.awayTeam?.name}</Text>
              </View>
              <TeamLogo logo={data.awayTeam?.logo} sport={sport} color={sportColor} size={30} />
            </View>
          </View>
        </View>

        {/* Footer with Score */}
        <View style={styles.footer}>
          {data.hasScore ? (
            <>
              <View style={styles.scoreDisplay}>
                <Text style={[styles.scoreText, data.homeScore > data.awayScore && styles.winnerScore]}>
                  {data.homeScore}
                </Text>
                <Text style={styles.scoreDivider}>/</Text>
                <Text style={[styles.scoreText, data.awayScore > data.homeScore && styles.winnerScore]}>
                  {data.awayScore}
                </Text>
              </View>
              <StatusBadge 
                status={data.status} 
                statusLong={data.statusLong} 
                isLive={data.isLive} 
                sportColor={sportColor} 
              />
            </>
          ) : (
            <Text style={styles.statusLongText}>{data.statusLong}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Data Normalization Logic
const normalizeFixtureData = (fixture, sport) => {
  if (!fixture) return null;

  const base = {
    id: fixture.fixtureId || fixture.id,
    status: fixture.status?.short || (typeof fixture.status === 'string' ? fixture.status : 'NS'),
    statusLong: fixture.status?.long || (typeof fixture.status === 'string' ? fixture.status : 'Not Started'),
    homeTeam: fixture.homeTeam || fixture.teams?.home,
    awayTeam: fixture.awayTeam || fixture.teams?.away,
    time: formatTime(fixture.time || fixture.fixture?.time || fixture.date),
  };

  let homeScore = null;
  let awayScore = null;

  if (sport === 'football') {
    homeScore = fixture.goals?.home ?? fixture.goalsHome ?? null;
    awayScore = fixture.goals?.away ?? fixture.goalsAway ?? null;
  } else {
    // Basketball, Volleyball, Hockey, Handball typically use .scores.home/away
    homeScore = fixture.scores?.home?.total ?? fixture.scores?.home ?? null;
    awayScore = fixture.scores?.away?.total ?? fixture.scores?.away ?? null;
  }

  const liveStatuses = {
    football: ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'IN'],
    basketball: ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT'],
    volleyball: ['S1', 'S2', 'S3', 'S4', 'S5'],
    hockey: ['P1', 'P2', 'P3', 'OT', 'BT', 'PT'],
    handball: ['1H', '2H', 'HT', 'ET', 'BT', 'PT'],
  };

  const isLive = (liveStatuses[sport] || []).includes(base.status);
  const finishedStatuses = ['FT', 'AET', 'PEN', 'AOT', 'AW', 'POST', 'CANC', 'ABD', 'ENDED', 'FINAL'];
  const isFinished = finishedStatuses.includes(base.status) || base.statusLong?.toLowerCase().includes('finished');

  return { 
    ...base, 
    homeScore, 
    awayScore, 
    isLive, 
    isFinished, 
    hasScore: homeScore !== null && awayScore !== null && (isLive || isFinished)
  };
};

const formatTime = (timeStr) => {
  if (!timeStr) return 'TBD';
  // If it's a full ISO date string
  if (timeStr.includes('T')) {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return timeStr; }
  }
  return timeStr;
};

const getSportColor = (sport) => {
  switch (sport) {
    case 'basketball': return '#ff9800';
    case 'hockey': return '#00bcd4';
    case 'volleyball': return '#9c27b0';
    case 'handball': return '#4caf50';
    default: return '#ff9800'; // Default to basketball-like orange or theme primary
  }
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1d7968',
    overflow: 'hidden',
  },
  firstCard: { marginTop: 8 },
  cardBackground: {
    backgroundColor: '#1d2d2c',
  },
  darkInnerContainer: {
    backgroundColor: '#1c2423',
    marginHorizontal: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#00ffe7',
  },
  timeNotchWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  timeNotchContainer: {
    flexDirection: 'row',
  },
  notchTriangleLeft: {
    width: 0, height: 0,
    borderTopWidth: 36, borderTopColor: '#1a4a45',
    borderLeftWidth: 18, borderLeftColor: 'transparent',
  },
  notchTriangleRight: {
    width: 0, height: 0,
    borderTopWidth: 36, borderTopColor: '#1a4a45',
    borderRightWidth: 18, borderRightColor: 'transparent',
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
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 18,
  },
  teamSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamSideRight: {
    justifyContent: 'flex-end',
  },
  teamPill: {
    backgroundColor: '#275550',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  teamName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  vsContainer: {
    width: 40,
    alignItems: 'center',
  },
  vsText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  winnerScore: {
    color: '#4caf50',
  },
  scoreDivider: {
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  statusLongText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
});

export default UnifiedMatchCard;
