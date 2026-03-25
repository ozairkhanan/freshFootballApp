import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const FixtureHeader = ({ teams, homeScore, awayScore, status, sport, venue, aggScore, environment, battingTeam }) => {
  // Determine if match is live/finished for score display
  const isLive = [
    '1H',
    '2H',
    'HT',
    'ET',
    'P',
    'LIVE',
    'Q1',
    'Q2',
    'Q3',
    'Q4',
    'S1', 'S2', 'S3', 'S4', 'S5', 'TIE',
    '1st INN', '2nd INN', 'STUMPS', 'TEA', 'LUNCH', 'RAIN'
  ].includes(status?.short) || status?.short === 'LIVE';
  const isFinished = ['FT', 'AET', 'PEN', 'AOT'].includes(status?.short);
  const showScore =
    isLive || isFinished || (homeScore !== undefined && homeScore !== null);

  const getSportIcon = () => {
    switch (sport) {
      case 'basketball':
        return 'basketball';
      case 'hockey':
        return 'hockey-puck';
      case 'volleyball':
        return 'volleyball';
      case 'cricket':
        return 'cricket';
      case 'tennis':
        return 'tennis';
      default:
        return 'soccer';
    }
  };

  const getWeatherIcon = (id) => {
    switch (id) {
      case 1: return 'weather-partly-cloudy';
      case 2: return 'weather-cloudy';
      case 5: return 'weather-sunny';
      case 9: return 'weather-rainy';
      default: return 'weather-cloudy';
    }
  };

  return (
    <View style={styles.container}>
      {/* 🟢 CARD BACKGROUND */}
      <LinearGradient
        colors={['#051820', '#0A2530']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cardGradient}
      >
        {/* 🟢 NOTCH HEADER */}
        <View style={styles.notchContainer}>
          <View style={styles.notchShape}>
            <LinearGradient
              colors={['#0F3840', '#0A2530']} // Darker teal for notch
              style={styles.notchGradient}
            >
              <Text style={styles.notchTime}>
                {status?.long || status?.short || 'TBD'}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* 🟢 TEAMS SECTION */}
        <View style={styles.teamsContainer}>
          {/* HOME TEAM PILL */}
          <View style={styles.teamWrapperLeft}>
            <View style={styles.logoContainer}>
              {teams?.home?.logo ? (
                <Image
                  source={{ uri: teams.home.logo }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[styles.logoPlaceholder, { borderColor: '#145C66' }]}
                >
                  <Icon name="shield-outline" size={24} color="#00ffe7" />
                </View>
              )}
            </View>
            <LinearGradient
              colors={['#145C66', '#0F4C5C']} // Teal Pill Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.namePillLeft, battingTeam === 1 && styles.battingPill]}
            >
              <View style={styles.nameContainer}>
                <Text style={styles.teamNameText} numberOfLines={1}>
                  {teams?.home?.name || 'Home'}
                </Text>
                {battingTeam === 1 && (
                  <Icon name="cricket" size={14} color="#ffeb3b" style={styles.batIcon} />
                )}
                {sport === 'tennis' && status?.serving === 1 && (
                  <Icon name="tennis-ball" size={14} color="#A1FF0F" style={styles.batIcon} />
                )}
              </View>
            </LinearGradient>
          </View>

          {/* VS / SCORE */}
          <View style={styles.centerSection}>
            {showScore ? (
              <View style={styles.scoreRow}>
                <Text
                  style={[
                    styles.scoreText,
                    homeScore > awayScore && styles.scoreWin,
                  ]}
                >
                  {homeScore}
                </Text>
                <Text style={styles.scoreDivider}>-</Text>
                <Text
                  style={[
                    styles.scoreText,
                    awayScore > homeScore && styles.scoreWin,
                  ]}
                >
                  {awayScore}
                </Text>
              </View>
            ) : (
              <Text style={styles.vsText}>VS</Text>
            )}
          </View>

          {/* AWAY TEAM PILL */}
          <View style={styles.teamWrapperRight}>
            <LinearGradient
              colors={['#145C66', '#0F4C5C']} // Teal Pill Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.namePillRight, battingTeam === 2 && styles.battingPill]}
            >
              <View style={styles.nameContainer}>
                {battingTeam === 2 && (
                  <Icon name="cricket" size={14} color="#ffeb3b" style={styles.batIconRight} />
                )}
                {sport === 'tennis' && status?.serving === 2 && (
                  <Icon name="tennis-ball" size={14} color="#A1FF0F" style={styles.batIconRight} />
                )}
                <Text style={styles.teamNameText} numberOfLines={1}>
                  {teams?.away?.name || 'Away'}
                </Text>
              </View>
            </LinearGradient>
            <View style={styles.logoContainerRight}>
              {teams?.away?.logo ? (
                <Image
                  source={{ uri: teams.away.logo }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[styles.logoPlaceholder, { borderColor: '#145C66' }]}
                >
                  <Icon name="shield-outline" size={24} color="#00ffe7" />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 🟢 FOOTER (Status / Elapsed / Environment) */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLeft}>
            {!!status?.clock?.display ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{status.clock.display}</Text>
              </View>
            ) : !!status?.elapsed ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{status.elapsed}'</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRight}>
            {(environment?.temperature !== undefined && environment?.temperature !== null) && (
              <View style={styles.weatherBadge}>
                <Icon name={getWeatherIcon(environment.weather)} size={14} color="#00FFE7" />
                <Text style={styles.weatherText}>{environment.temperature}</Text>
              </View>
            )}
            <Icon name={getSportIcon()} size={16} color="rgba(255,255,255,0.2)" />
          </View>
        </View>

        {venue ? (
          <View style={styles.venueContainer}>
            <Text style={styles.venueText} numberOfLines={1}>
              <Icon name="stadium-variant" size={12} color="rgba(255,255,255,0.4)" /> {venue}
            </Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 24 : 16,
    borderRadius: 24,
    shadowColor: '#00bcd4', // Teal glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 24,
    paddingBottom: 16,
    // Removed border for cleaner look
  },

  // NOTCH STYLES
  notchContainer: {
    height: 36,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: -1,
    position: 'relative',
  },
  notchShape: {
    height: 32,
    width: 160, // Slightly wider for status text
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  notchGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notchTime: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // TEAMS STYLES
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 24,
  },

  // PILLS
  teamWrapperLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    marginRight: 4,
  },
  teamWrapperRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: 4,
  },

  logoContainer: {
    zIndex: 2,
    elevation: 2,
    marginRight: -16, // Overlap pill
  },
  logoContainerRight: {
    zIndex: 2,
    elevation: 2,
    marginLeft: -16, // Overlap pill
  },

  namePillLeft: {
    paddingVertical: 8,
    paddingLeft: 40,
    paddingRight: 16,
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    flex: 1,
  },
  namePillRight: {
    paddingVertical: 8,
    paddingRight: 40,
    paddingLeft: 16,
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  teamNameText: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  batIcon: { marginLeft: 6 },
  batIconRight: { marginRight: 6 },
  battingPill: {
    borderColor: '#ffeb3b',
    borderWidth: 1,
  },

  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0A2530',
    borderWidth: 2,
    borderColor: '#145C66',
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F2028',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  // CENTER
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  vsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 18,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: '#fff',
    fontSize: isTablet ? 24 : 16, // Smaller for Cricket scores
    fontWeight: '700',
  },
  scoreWin: {
    color: '#4caf50',
  },
  scoreDivider: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 20,
    marginHorizontal: 4,
  },

  // FOOTER
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -8,
    paddingHorizontal: 16,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff1744',
    marginRight: 4,
  },
  liveText: {
    color: '#ff1744',
    fontSize: 12,
    fontWeight: '700',
  },
  positionText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  aggText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  venueContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    marginTop: 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  venueText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    paddingHorizontal: 16,
  },
  rankFooterText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 231, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  weatherText: {
    color: '#00FFE7',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default FixtureHeader;
