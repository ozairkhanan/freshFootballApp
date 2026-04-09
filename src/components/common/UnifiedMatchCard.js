import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TeamLogo, StatusBadge } from './CommonUI';

/**
 * UnifiedMatchCard - A single, high-performance match card for all sports
 */
const UnifiedMatchCard = ({ fixture, sport = 'football', onPress, index }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
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
          {(data.hasScore || data.isFinished) && (
            <View style={{flex: 1}}>
              <View style={styles.scoreRowContainer}>
                <View style={[styles.scoreDisplay, sport === 'cricket' && { flexDirection: 'column', alignItems: 'center' }]}>
                  <Text style={[styles.scoreText, data.homeScore > data.awayScore && styles.winnerScore, sport === 'cricket' && { fontSize: 16 }]}>
                    {data.homeScore}
                  </Text>
                  {sport !== 'cricket' && <Text style={styles.scoreDivider}>/</Text>}
                  <Text style={[styles.scoreText, data.awayScore > data.homeScore && styles.winnerScore, sport === 'cricket' && { fontSize: 16 }]}>
                    {data.awayScore}
                  </Text>
                </View>
                <StatusBadge 
                  status={data.status} 
                  statusLong={data.statusLong} 
                  isLive={data.isLive} 
                  clock={data.clock}
                  sportColor={sportColor} 
                />
                {sport === 'tennis' && data.isLive && data.currentPoints && (
                  <View style={styles.tennisPointsContainer}>
                    <Text style={styles.pointsLabel}>Points</Text>
                    <View style={styles.pointsRow}>
                      <View style={styles.pointPill}>
                        {data.serving === 1 && <View style={styles.servingDot} />}
                        <Text style={styles.pointText}>{data.currentPoints.home || '0'}</Text>
                      </View>
                      <Text style={styles.pointDivider}>:</Text>
                      <View style={styles.pointPill}>
                        {data.serving === 2 && <View style={styles.servingDot} />}
                        <Text style={styles.pointText}>{data.currentPoints.away || '0'}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
              {!!data.winDescription && (
                <Text style={styles.winDescriptionText}>{data.winDescription}</Text>
              )}
            </View>
          )}
          {!data.hasScore && !data.isFinished && (
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
  } else if (sport === 'cricket') {
    // Cricket: Show Runs/Wickets (Overs) of the latest inning
    const hInn = [...(fixture.teams?.home?.innings || []), ...(fixture.homeInnings || [])].slice(-1)[0];
    const aInn = [...(fixture.teams?.away?.innings || []), ...(fixture.awayInnings || [])].slice(-1)[0];
    
    if (hInn) {
      homeScore = `${hInn.runs}/${hInn.wickets}${hInn.overs !== undefined && hInn.overs !== null ? ` (${hInn.overs})` : ''}`;
    } else {
      homeScore = fixture.teams?.home?.score ?? fixture.homeScore ?? '0';
    }

    if (aInn) {
      awayScore = `${aInn.runs}/${aInn.wickets}${aInn.overs !== undefined && aInn.overs !== null ? ` (${aInn.overs})` : ''}`;
    } else {
      awayScore = fixture.teams?.away?.score ?? fixture.awayScore ?? '0';
    }
  } else if (sport === 'tennis') {
    // Tennis: Show Total Sets and Current Game Points (if live)
    homeScore = fixture.scores?.home?.total ?? fixture.goals?.home ?? 0;
    awayScore = fixture.scores?.away?.total ?? fixture.goals?.away ?? 0;
    
    const currentPoints = fixture.scores?.currentPoints;
    if (currentPoints && (currentPoints.home || currentPoints.away)) {
      base.currentPoints = currentPoints;
    }
    base.serving = fixture.serving; // 1: Home, 2: Away
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
    cricket: ['LIVE', 'IN', '1st INN', '2nd INN', 'STUMPS', 'TEA', 'LUNCH', 'RAIN'],
    tennis: ['S1', 'S2', 'S3', 'S4', 'S5', 'TIE', 'LIVE'],
  };

  const isLive = (liveStatuses[sport] || []).includes(base.status);
  const finishedStatuses = ['FT', 'AET', 'PEN', 'AOT', 'AW', 'POST', 'CANC', 'ABD', 'ENDED', 'FINAL'];
  const isFinished = finishedStatuses.includes(base.status) || base.statusLong?.toLowerCase()?.includes('finished') || false;

  return { 
    ...base, 
    homeScore, 
    awayScore, 
    isLive, 
    isFinished,
    clock: fixture.status?.clock || null,
    hasScore: homeScore !== null && awayScore !== null && (isLive || isFinished)
  };
};

const formatTime = (timeStr) => {
  if (!timeStr) return 'TBD';
  // If it's a full ISO date string
  if (timeStr && typeof timeStr === 'string' && timeStr.includes('T')) {
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
    case 'cricket': return '#ffeb3b';
    case 'tennis': return '#A1FF0F';
    default: return '#00ffe7'; // Standard teal theme
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
  scoreRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  winDescriptionText: {
    color: '#A1FF0F',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    fontStyle: 'italic',
  },
  tennisPointsContainer: {
    marginLeft: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(161, 255, 15, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(161, 255, 15, 0.2)',
  },
  pointsLabel: {
    color: 'rgba(161, 255, 15, 0.7)',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
  },
  pointText: {
    color: '#A1FF0F',
    fontSize: 14,
    fontWeight: '800',
  },
  pointDivider: {
    color: 'rgba(161, 255, 15, 0.4)',
    marginHorizontal: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  servingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A1FF0F',
    marginRight: 4,
    shadowColor: '#A1FF0F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});

export default UnifiedMatchCard;
