import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import {
  getTeamInfo,
  getTeamFixtures,
  getTeamSquad,
  getCoaches,
} from '../api/sportsApi';
import ShimmerCard from '../components/ShimmerCard';
import EnhancedMatchCard from '../components/EnhancedMatchCard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallDevice = width < 360;

const TeamProfileScreen = ({ route, navigation }) => {
  const { teamId, teamName, sport = 'football' } = route.params;

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [teamInfo, setTeamInfo] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [squad, setSquad] = useState([]);
  const [stats, setStats] = useState(null); // ✅ NEW
  const [coach, setCoach] = useState(null); // ✅ NEW

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      console.log(`🛡️ Loading team profile: ${teamId}`);

      const infoData = await getTeamInfo(teamId, sport);
      setTeamInfo(infoData.response[0]);

      const currentYear = new Date().getFullYear();
      const fixturesData = await getTeamFixtures(
        teamId,
        currentYear,
        sport,
        10,
      );
      setFixtures(fixturesData.response || []);

      const squadData = await getTeamSquad(teamId, sport);
      setSquad(squadData.response || []);

      // ✅ Fetch stats if league and season are available in route params or fallback
      const leagueId = route.params?.leagueId || route.params?.league;
      const seasonValue = route.params?.season;

      if (leagueId && seasonValue) {
        const { getTeamStatistics } = require('../api/sportsApi');
        const statsData = await getTeamStatistics(
          teamId,
          leagueId,
          seasonValue,
          sport,
        );
        setStats(statsData.response);
      }

      // ✅ Fetch Coach
      if (sport === 'football') {
        const coachData = await getCoaches({ team: teamId });
        if (coachData.response && coachData.response.length > 0) {
          setCoach(coachData.response[0]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading team data:', error);
      setLoading(false);
    }
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'info', label: 'Info', icon: 'information-outline' },
      { id: 'fixtures', label: 'Fixtures', icon: 'calendar' },
      { id: 'stats', label: 'Stats', icon: 'chart-bar' }, // ✅ NEW
      { id: 'squad', label: 'Squad', icon: 'account-group' },
    ];

    return (
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Icon
                name={tab.icon}
                size={isTablet ? 24 : 20}
                color={
                  activeTab === tab.id ? '#00ffe7' : 'rgba(255,255,255,0.5)'
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderInfo = () => {
    if (!teamInfo) return null;

    const { team, venue } = teamInfo;

    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon
              name="shield-check"
              size={isTablet ? 28 : 24}
              color="#00ffe7"
            />
            <Text style={styles.cardTitle}>Team Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon name="calendar" size={isTablet ? 24 : 20} color="#00ffe7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Founded</Text>
              <Text style={styles.infoValue}>{team.founded || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Icon
                name="map-marker"
                size={isTablet ? 24 : 20}
                color="#00ffe7"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{team.country}</Text>
            </View>
          </View>

          {team.national && (
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="flag" size={isTablet ? 24 : 20} color="#00ffe7" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>National Team</Text>
              </View>
            </View>
          )}
        </View>

        {venue && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon
                name="stadium-variant"
                size={isTablet ? 28 : 24}
                color="#00ffe7"
              />
              <Text style={styles.cardTitle}>Stadium</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon
                  name="stadium"
                  size={isTablet ? 24 : 20}
                  color="#00ffe7"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{venue.name || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="city" size={isTablet ? 24 : 20} color="#00ffe7" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{venue.city || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon
                  name="account-group"
                  size={isTablet ? 24 : 20}
                  color="#00ffe7"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Capacity</Text>
                <Text style={styles.infoValue}>
                  {venue.capacity ? venue.capacity.toLocaleString() : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon
                  name="texture-box"
                  size={isTablet ? 24 : 20}
                  color="#00ffe7"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Surface</Text>
                <Text style={styles.infoValue}>{venue.surface || 'N/A'}</Text>
              </View>
            </View>
          </View>
        )}

        {coach && (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('CoachProfile', { coachId: coach.id, teamId })
            }
          >
            <View style={styles.cardHeader}>
              <Icon
                name="account-tie"
                size={isTablet ? 28 : 24}
                color="#00ffe7"
              />
              <Text style={styles.cardTitle}>Head Coach</Text>
            </View>

            <View style={styles.playerRow}>
              <Image
                source={{
                  uri:
                    coach.photo ||
                    `https://media.api-sports.io/football/coachs/${coach.id}.png`,
                }}
                style={styles.playerPhoto}
              />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{coach.name}</Text>
                <Text style={styles.playerAge}>
                  Nationality: {coach.nationality}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color="rgba(255,255,255,0.3)"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFixtures = () => {
    if (fixtures.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon
            name="calendar-blank"
            size={isTablet ? 100 : 80}
            color="rgba(255,255,255,0.2)"
          />
          <Text style={styles.emptyText}>No recent fixtures</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {fixtures.map((fixture, index) => {
          // Get fixture ID based on sport
          let fixtureId;
          if (sport === 'football') {
            fixtureId = fixture.fixture?.id;
          } else {
            fixtureId = fixture.id;
          }

          return (
            <EnhancedMatchCard
              key={fixtureId || index}
              fixture={fixture}
              index={index}
              sport={sport}
              onPress={() => {
                navigation.navigate('FixtureDetails', {
                  fixtureId: fixtureId,
                  sport: sport,
                });
              }}
            />
          );
        })}
      </View>
    );
  };

  const renderSquad = () => {
    if (squad.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon
            name="account-group"
            size={isTablet ? 100 : 80}
            color="rgba(255,255,255,0.2)"
          />
          <Text style={styles.emptyText}>Squad not available</Text>
        </View>
      );
    }

    const groupedPlayers =
      squad[0]?.players.reduce((acc, player) => {
        const position = player.position || 'Unknown';
        if (!acc[position]) acc[position] = [];
        acc[position].push(player);
        return acc;
      }, {}) || {};

    const positionOrder = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

    return (
      <View style={styles.tabContent}>
        {positionOrder.map(position => {
          const players = groupedPlayers[position] || [];
          if (players.length === 0) return null;

          return (
            <View key={position} style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon
                  name={
                    position === 'Goalkeeper'
                      ? 'trophy'
                      : position === 'Defender'
                      ? 'shield'
                      : position === 'Midfielder'
                      ? 'run'
                      : 'soccer'
                  }
                  size={isTablet ? 28 : 24}
                  color="#00ffe7"
                />
                <Text style={styles.cardTitle}>
                  {position}s ({players.length})
                </Text>
              </View>

              {players.map((player, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.playerRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('PlayerProfile', {
                      playerId: player.id,
                      playerName: player.name,
                      teamId,
                    })
                  }
                >
                  <View style={styles.playerNumber}>
                    <Text style={styles.playerNumberText}>
                      {player.number || '-'}
                    </Text>
                  </View>
                  <Image
                    source={{
                      uri:
                        player.photo ||
                        `https://media.api-sports.io/football/players/${player.id}.png`,
                    }}
                    style={styles.playerPhoto}
                  />
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerAge}>
                      Age: {player.age || 'N/A'}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={20}
                    color="rgba(255,255,255,0.2)"
                  />
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const renderStats = () => {
    if (!stats) {
      return (
        <View style={styles.emptyState}>
          <Icon
            name="chart-bar"
            size={isTablet ? 100 : 80}
            color="rgba(255,255,255,0.2)"
          />
          <Text style={styles.emptyText}>Statistics not available</Text>
          <Text style={styles.emptySubText}>
            Select a league/season to view stats
          </Text>
        </View>
      );
    }

    const { fixtures, goals, form } = stats;

    return (
      <View style={styles.tabContent}>
        {/* Form Indicator */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon
              name="trending-up"
              size={isTablet ? 28 : 24}
              color="#00ffe7"
            />
            <Text style={styles.cardTitle}>Recent Form</Text>
          </View>
          <View style={styles.formContainer}>
            {form?.split('').map((char, i) => (
              <View
                key={i}
                style={[
                  styles.formCircle,
                  {
                    backgroundColor:
                      char === 'W'
                        ? '#4caf50'
                        : char === 'L'
                        ? '#f44336'
                        : '#ff9800',
                  },
                ]}
              >
                <Text style={styles.formText}>{char}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Fixtures Summary */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Played</Text>
            <Text style={styles.statValue}>{fixtures?.played?.total || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Wins</Text>
            <Text style={styles.statValue}>{fixtures?.wins?.total || 0}</Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      (fixtures?.wins?.total / (fixtures?.played?.total || 1)) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Draws</Text>
            <Text style={styles.statValue}>{fixtures?.draws?.total || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Losses</Text>
            <Text style={styles.statValue}>{fixtures?.loses?.total || 0}</Text>
          </View>
        </View>

        {/* Goals Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="soccer" size={isTablet ? 28 : 24} color="#00ffe7" />
            <Text style={styles.cardTitle}>Goals Analysis</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Goals For (Avg)</Text>
              <Text style={styles.infoValue}>
                {goals?.for?.average?.total || 0}
              </Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Goals Against (Avg)</Text>
              <Text style={styles.infoValue}>
                {goals?.against?.average?.total || 0}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Total Goals Scored</Text>
              <Text style={styles.infoValue}>
                {goals?.for?.total?.total || 0}
              </Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Total Goals Conceded</Text>
              <Text style={styles.infoValue}>
                {goals?.against?.total?.total || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderShimmerLoading = () => (
    <View style={styles.shimmerContainer}>
      {[1, 2, 3, 4].map(i => (
        <ShimmerCard key={i} />
      ))}
    </View>
  );

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
            <Text style={styles.headerTitle}>Team Profile</Text>
            <View style={styles.backButton} />
          </View>
          {renderShimmerLoading()}
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!teamInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <View style={styles.errorContainer}>
            <Icon
              name="alert-circle-outline"
              size={isTablet ? 100 : 80}
              color="#ff6b6b"
            />
            <Text style={styles.errorText}>Failed to load team</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const { team } = teamInfo;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={isTablet ? 28 : 24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Team Profile</Text>
          <View style={styles.backButton} />
        </View>

        {/* Team Header */}
        <View style={styles.teamHeader}>
          {team.logo && (
            <Image source={{ uri: team.logo }} style={styles.teamLogo} />
          )}
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamCode}>{team.code}</Text>
        </View>

        {/* Tabs */}
        {renderTabs()}

        {/* Tab Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'info' && renderInfo()}
          {activeTab === 'fixtures' && renderFixtures()}
          {activeTab === 'stats' && renderStats()}
          {activeTab === 'squad' && renderSquad()}
        </ScrollView>
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
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '800',
  },

  teamHeader: {
    alignItems: 'center',
    paddingVertical: isTablet ? 32 : 24,
  },
  teamLogo: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    marginBottom: isTablet ? 20 : 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 32 : isSmallDevice ? 24 : 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: isTablet ? 12 : 8,
  },
  teamCode: {
    color: '#00ffe7',
    fontSize: isTablet ? 20 : 16,
    fontWeight: '700',
    letterSpacing: 2,
  },

  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 12 : 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 16 : 14,
    paddingHorizontal: isTablet ? 24 : 20,
    marginRight: isTablet ? 8 : 4,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#00ffe7',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 18 : isSmallDevice ? 14 : 16,
    fontWeight: '700',
    marginLeft: isTablet ? 12 : 8,
  },
  tabTextActive: { color: '#00ffe7' },

  scrollView: { flex: 1 },
  tabContent: {
    padding: isTablet ? 24 : 16,
    paddingBottom: isTablet ? 40 : 32,
  },

  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.9)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 24 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 24 : 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: isTablet ? 22 : isSmallDevice ? 17 : 19,
    fontWeight: '800',
    marginLeft: isTablet ? 16 : 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 16 : 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoIcon: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    backgroundColor: 'rgba(0, 255, 231, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 20 : 16,
  },
  infoContent: { flex: 1 },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 15 : isSmallDevice ? 12 : 13,
    fontWeight: '600',
    marginBottom: isTablet ? 6 : 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: isTablet ? 18 : isSmallDevice ? 14 : 16,
    fontWeight: '700',
  },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerNumber: {
    width: isTablet ? 40 : 32,
    height: isTablet ? 40 : 32,
    borderRadius: isTablet ? 20 : 16,
    backgroundColor: 'rgba(0, 255, 231, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 16 : 12,
  },
  playerNumberText: {
    color: '#00ffe7',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '900',
  },
  playerPhoto: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginRight: isTablet ? 16 : 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  playerInfo: { flex: 1 },
  playerName: {
    color: '#fff',
    fontSize: isTablet ? 17 : isSmallDevice ? 14 : 15,
    fontWeight: '700',
    marginBottom: isTablet ? 6 : 4,
  },
  playerAge: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: isTablet ? 14 : isSmallDevice ? 11 : 12,
  },

  shimmerContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 32,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    marginTop: isTablet ? 24 : 20,
    marginBottom: isTablet ? 32 : 24,
  },
  retryButton: {
    backgroundColor: '#00ffe7',
    paddingHorizontal: isTablet ? 40 : 32,
    paddingVertical: isTablet ? 18 : 14,
    borderRadius: isTablet ? 16 : 12,
  },
  retryText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  statSubValue: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00ffe7',
  },
  formContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  formCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
  },
});

export default TeamProfileScreen;
