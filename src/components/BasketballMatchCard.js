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

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BasketballMatchCard = ({ fixture, index, onPress }) => {
  const isLive = () => {
    const status = fixture.status?.short || fixture.status;
    const liveStatuses = ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT'];
    return liveStatuses.includes(status);
  };

  const isFinished = () => {
    const status = fixture.status?.short || fixture.status;
    return ['FT', 'AOT', 'AP', 'AW'].includes(status);
  };

  const getStatusText = () => {
    const status = fixture.status?.short || fixture.status;
    const statusMap = {
      NS: 'Not Started',
      Q1: '1st Quarter',
      Q2: '2nd Quarter',
      Q3: '3rd Quarter',
      Q4: '4th Quarter',
      OT: 'Overtime',
      BT: 'Break',
      HT: 'Halftime',
      FT: 'Final',
      AOT: 'Final (OT)',
    };
    return statusMap[status] || status;
  };

  const getTime = () => {
    if (fixture.time) return fixture.time;
    if (fixture.date) {
      try {
        const date = new Date(fixture.date);
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return '--:--';
      }
    }
    return '--:--';
  };

  const live = isLive();
  const finished = isFinished();
  const homeScore = fixture.scores?.home?.total ?? fixture.homeScore ?? '-';
  const awayScore = fixture.scores?.away?.total ?? fixture.awayScore ?? '-';
  const homeTeam = fixture.homeTeam || fixture.teams?.home || {};
  const awayTeam = fixture.awayTeam || fixture.teams?.away || {};

  // Team Logo Component
  const TeamLogo = ({ team, side }) => {
    const logoContainerStyle =
      side === 'left'
        ? { marginRight: -20, zIndex: 10 }
        : { marginLeft: -20, zIndex: 10 };

    return (
      <View style={[styles.logoContainer, logoContainerStyle]}>
        {team?.logo ? (
          <Image source={{ uri: team.logo }} style={styles.logoImage} />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Icon name="basketball" size={16} color="#ff9800" />
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(fixture.fixtureId || fixture.id)}
      style={[styles.cardContainer, index === 0 && styles.firstCard]}
    >
      {/* Card Background */}
      <View style={styles.cardBackground}>
        {/* Dark Inner Container */}
        <View style={styles.darkInnerContainer}>
          {/* Time Notch - Trapezoid */}
          <View style={styles.timeNotchWrapper}>
            <View style={styles.timeNotchContainer}>
              <View style={styles.notchTriangleLeft} />
              <View style={styles.timeNotch}>
                <Text style={styles.timeText}>{getTime()}</Text>
              </View>
              <View style={styles.notchTriangleRight} />
            </View>
          </View>

          {/* Teams Row */}
          <View style={styles.teamsRow}>
            <TeamLogo team={homeTeam} side="left" />
            <LinearGradient
              colors={['#1c2a28', '#2f5349', '#22675b']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.teamPillLeft}
            >
              <Text style={styles.teamName} numberOfLines={1}>
                {homeTeam?.name || 'Home'}
              </Text>
            </LinearGradient>

            <Text style={styles.vsText}>VS</Text>

            <LinearGradient
              colors={['#22675b', '#2f5349', '#1c2a28']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.teamPillRight}
            >
              <Text style={styles.teamName} numberOfLines={1}>
                {awayTeam?.name || 'Away'}
              </Text>
            </LinearGradient>
            <TeamLogo team={awayTeam} side="right" />
          </View>
        </View>

        {/* Footer with Score */}
        <LinearGradient
          colors={['#1d2d2c', '#243a38', '#1d2d2c']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.footer}
        >
          <View style={styles.scoreRow}>
            <Text
              style={[
                styles.scoreText,
                homeScore > awayScore && styles.winnerScore,
              ]}
            >
              {homeScore}
            </Text>
            <View style={styles.statusBadge}>
              {live ? (
                <View style={styles.liveContainer}>
                  <View style={styles.liveDot} />
                  <Text style={styles.statusText}>LIVE</Text>
                </View>
              ) : (
                <Text style={styles.statusText}>
                  {finished ? 'FT' : getStatusText()}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.scoreText,
                awayScore > homeScore && styles.winnerScore,
              ]}
            >
              {awayScore}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 16 : 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1d7968',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  firstCard: { marginTop: isTablet ? 12 : 8 },
  cardBackground: {
    backgroundColor: '#1d2d2c',
    borderRadius: 16,
  },
  darkInnerContainer: {
    backgroundColor: '#1c2423',
    marginHorizontal: 6,
    marginTop: 6,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
    overflow: 'hidden',
    borderBottomWidth: 2,
    borderBottomColor: '#00ffe7',
  },
  timeNotchWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  timeNotchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 42,
  },
  notchTriangleLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 42,
    borderLeftWidth: 25,
    borderRightWidth: 0,
    borderTopColor: '#193936',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timeNotch: {
    backgroundColor: '#193936',
    paddingHorizontal: isTablet ? 40 : 32,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notchTriangleRight: {
    width: 0,
    height: 0,
    borderTopWidth: 42,
    borderLeftWidth: 0,
    borderRightWidth: 25,
    borderTopColor: '#193936',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timeText: {
    color: '#00ffe7',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0a1a18',
    borderWidth: 2,
    borderColor: '#3a4a48',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
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
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamPillLeft: {
    paddingHorizontal: 16,
    paddingLeft: 24,
    paddingVertical: 10,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginLeft: -18,
    minWidth: 90,
  },
  teamPillRight: {
    paddingHorizontal: 16,
    paddingRight: 24,
    paddingVertical: 10,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    marginRight: -18,
    minWidth: 90,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  vsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '800',
    marginHorizontal: 12,
  },
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreText: {
    color: '#fff',
    fontSize: isTablet ? 32 : 28,
    fontWeight: '900',
    minWidth: 50,
    textAlign: 'center',
  },
  winnerScore: {
    color: '#00ffe7',
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 231, 0.1)',
    paddingHorizontal: isTablet ? 20 : 16,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.3)',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5722',
    marginRight: 6,
  },
  statusText: {
    color: '#00ffe7',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default BasketballMatchCard;
