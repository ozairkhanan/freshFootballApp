import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import { getStandingsGroups } from '../api/sportsApi';
import ConferenceStandings from '../components/basketball/ConferenceStandings';
import DivisionStandings from '../components/basketball/DivisionStandings';
import StandingsTable from '../components/basketball/StandingsTable';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BasketballStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId = 12,
    leagueName = 'NBA',
    season = '2024-2025',
  } = route.params || {};

  const [activeView, setActiveView] = useState('conference');
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasGroups, setHasGroups] = useState(false); // ✅ Track if league has groups

  useEffect(() => {
    fetchStandings();
  }, [leagueId, season]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        `🏀 Fetching standings: League ${leagueId}, Season ${season}`,
      );

      const data = await getStandingsGroups(leagueId, season, 'basketball');

      console.log('🏀 Standings response:', data);

      if (data.response && data.response.length > 0) {
        // ✅ Check if league has actual groups (conferences/divisions)
        const allTeams = data.response.flat();
        const uniqueGroups = new Set();

        allTeams.forEach(team => {
          const groupName = team.group?.name || team.groupName;
          if (groupName && groupName.trim() !== '') {
            uniqueGroups.add(groupName);
          }
        });

        console.log(`🏀 Unique groups found: ${uniqueGroups.size}`, [
          ...uniqueGroups,
        ]);

        // ✅ If more than 1 unique group, show toggle
        setHasGroups(uniqueGroups.size > 1);
        setStandings(data.response);
      } else {
        setError('No standings data available');
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Standings error:', err);
      setError(err.message || 'Failed to load standings');
      setLoading(false);
    }
  };

  const handleTeamPress = teamId => {
    if (teamId) {
      navigation.navigate('TeamProfile', {
        teamId,
        sport: 'basketball',
        league: leagueId,
        season,
      });
    }
  };

  // ✅ Render simple standings (no groups)
  const renderSimpleStandings = () => {
    const allTeams = standings
      .flat()
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return (
      <ScrollView
        style={styles.simpleContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.simpleHeader}>
          <Icon name="trophy" size={isTablet ? 28 : 24} color="#ff9800" />
          <Text style={styles.simpleTitle}>League Standings</Text>
          <View style={styles.teamCount}>
            <Text style={styles.teamCountText}>{allTeams.length} Teams</Text>
          </View>
        </View>

        <StandingsTable teams={allTeams} onTeamPress={handleTeamPress} />

        {/* Playoff Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.playoffIndicator} />
            <Text style={styles.legendText}>Playoff Position (Top 8)</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={isTablet ? 28 : 24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{leagueName}</Text>
              <Text style={styles.headerSubtitle}>{season}</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff9800" />
            <Text style={styles.loadingText}>Loading standings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={isTablet ? 28 : 24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{leagueName}</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.errorContainer}>
            <Icon
              name="alert-circle-outline"
              size={isTablet ? 80 : 64}
              color="#ff6b6b"
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchStandings}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={isTablet ? 28 : 24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{leagueName}</Text>
            <Text style={styles.headerSubtitle}>{season} Standings</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* ✅ Only show toggle if league has groups */}
        {hasGroups && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeView === 'conference' && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveView('conference')}
              activeOpacity={0.7}
            >
              <Icon
                name="format-list-bulleted"
                size={isTablet ? 22 : 18}
                color={
                  activeView === 'conference'
                    ? '#ff9800'
                    : 'rgba(255,255,255,0.5)'
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  activeView === 'conference' && styles.toggleTextActive,
                ]}
              >
                Conference
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeView === 'division' && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveView('division')}
              activeOpacity={0.7}
            >
              <Icon
                name="format-list-numbered"
                size={isTablet ? 22 : 18}
                color={
                  activeView === 'division'
                    ? '#ff9800'
                    : 'rgba(255,255,255,0.5)'
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  activeView === 'division' && styles.toggleTextActive,
                ]}
              >
                Division
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Content - Show simple or grouped standings */}
        {hasGroups ? (
          activeView === 'conference' ? (
            <ConferenceStandings
              standings={standings}
              onTeamPress={handleTeamPress}
            />
          ) : (
            <DivisionStandings
              standings={standings}
              onTeamPress={handleTeamPress}
            />
          )
        ) : (
          renderSimpleStandings()
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 24 : 16,
    paddingVertical: isTablet ? 20 : 16,
  },
  backButton: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#ff9800',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 16 : 12,
    backgroundColor: 'rgba(29, 45, 44, 0.7)',
    borderRadius: isTablet ? 16 : 14,
    padding: isTablet ? 6 : 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: isTablet ? 12 : 10,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginLeft: isTablet ? 10 : 8,
  },
  toggleTextActive: {
    color: '#ff9800',
  },
  // ✅ Simple standings styles (no groups)
  simpleContainer: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
  },
  simpleTitle: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '900',
    marginLeft: isTablet ? 16 : 12,
    flex: 1,
  },
  teamCount: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: isTablet ? 16 : 12,
  },
  teamCountText: {
    color: '#ff9800',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '700',
  },
  legend: {
    marginTop: isTablet ? 24 : 20,
    marginBottom: isTablet ? 40 : 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playoffIndicator: {
    width: isTablet ? 16 : 14,
    height: isTablet ? 16 : 14,
    borderRadius: isTablet ? 8 : 7,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
    borderColor: '#4caf50',
    marginRight: isTablet ? 12 : 10,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginTop: isTablet ? 20 : 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 32,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginTop: isTablet ? 20 : 16,
    marginBottom: isTablet ? 24 : 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: isTablet ? 40 : 32,
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: isTablet ? 16 : 12,
  },
  retryText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
});

export default BasketballStandingsScreen;
