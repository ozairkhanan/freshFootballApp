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
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import { getStandingsGroups } from '../api/sportsApi';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const VolleyballStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId,
    leagueName = 'Volleyball',
    season = new Date().getFullYear().toString(),
  } = route.params || {};

  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasGroups, setHasGroups] = useState(false);

  useEffect(() => {
    fetchStandings();
  }, [leagueId, season]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        `🏐 Fetching volleyball standings: League ${leagueId}, Season ${season}`,
      );

      const data = await getStandingsGroups(leagueId, season, 'volleyball');

      console.log('🏐 Standings response:', JSON.stringify(data, null, 2));

      if (data.response && data.response.length > 0) {
        // API or backend normalization returns array of arrays
        const allGroups = data.response;

        // Check if there are multiple groups
        setHasGroups(allGroups.length > 1);

        // Process and set standings
        const processedStandings = allGroups
          .map(group => {
            // Defensive: if a group is actually an object (flat response), wrap it
            if (!Array.isArray(group) && typeof group === 'object') {
              return [group];
            }
            if (!Array.isArray(group)) return [];

            // Sort by position
            return group.sort((a, b) => (a.position || 0) - (b.position || 0));
          })
          .filter(group => group.length > 0);

        setStandings(processedStandings);
      } else {
        setError('No standings data available');
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Volleyball standings error:', err);
      setError(err.message || 'Failed to load standings');
      setLoading(false);
    }
  };

  const handleTeamPress = teamId => {
    if (teamId) {
      navigation.navigate('TeamProfile', {
        teamId,
        sport: 'volleyball',
        league: leagueId,
        season,
      });
    }
  };

  // Get group name from first team in group
  const getGroupName = group => {
    if (!group || group.length === 0) return 'League Standings';

    const firstTeam = group[0];

    // Try different properties
    if (firstTeam.group?.name) return firstTeam.group.name;
    if (firstTeam.stage) return firstTeam.stage;
    if (firstTeam.league?.name) return firstTeam.league.name;

    return 'League Standings';
  };

  // Render team logo with fallback
  const renderTeamLogo = logo => {
    if (logo) {
      return <Image source={{ uri: logo }} style={styles.teamLogo} />;
    }
    return (
      <View style={styles.teamLogoPlaceholder}>
        <Icon name="volleyball" size={isTablet ? 16 : 14} color="#9c27b0" />
      </View>
    );
  };

  // Render standings table
  const renderStandingsTable = teams => (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
        <Text style={[styles.headerCell, styles.statCell]}>P</Text>
        <Text style={[styles.headerCell, styles.statCell]}>W</Text>
        <Text style={[styles.headerCell, styles.statCell]}>L</Text>
        <Text style={[styles.headerCell, styles.statCell]}>Sets</Text>
        <Text style={[styles.headerCell, styles.ptsCell]}>Pts</Text>
      </View>

      {/* Table Rows */}
      {teams.map((team, index) => {
        const position = team.position || index + 1;
        const played = team.games?.played || 0;
        const wins = team.games?.win?.total || 0;
        const losses = team.games?.lose?.total || 0;
        const setsFor = team.goals?.for || 0;
        const setsAgainst = team.goals?.against || 0;
        const points = team.points || 0;
        const isTopPosition = position <= 4;

        return (
          <TouchableOpacity
            key={team.team?.id || index}
            style={[styles.tableRow, isTopPosition && styles.topRow]}
            onPress={() => handleTeamPress(team.team?.id)}
            activeOpacity={0.7}
          >
            {/* Position */}
            <View style={styles.rankCell}>
              <View
                style={[styles.rankBadge, isTopPosition && styles.topRankBadge]}
              >
                <Text
                  style={[styles.rankText, isTopPosition && styles.topRankText]}
                >
                  {position}
                </Text>
              </View>
            </View>

            {/* Team */}
            <View style={styles.teamCell}>
              {renderTeamLogo(team.team?.logo)}
              <View style={styles.teamInfo}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {team.team?.name || 'Unknown'}
                </Text>
                {team.description && (
                  <Text style={styles.promotionText} numberOfLines={1}>
                    {team.description}
                  </Text>
                )}
                {team.form && (
                  <View style={styles.formContainer}>
                    {team.form
                      .split('')
                      .slice(-5)
                      .map((result, i) => (
                        <View
                          key={i}
                          style={[
                            styles.formDot,
                            result === 'W' && styles.formWin,
                            result === 'L' && styles.formLoss,
                            result === 'D' && styles.formDraw,
                          ]}
                        />
                      ))}
                  </View>
                )}
              </View>
            </View>

            {/* Stats */}
            <Text style={styles.statCell}>{played}</Text>
            <Text style={[styles.statCell, styles.winCell]}>{wins}</Text>
            <Text style={[styles.statCell, styles.lossCell]}>{losses}</Text>
            <Text style={styles.statCell}>
              {setsFor}-{setsAgainst}
            </Text>
            <Text style={[styles.ptsCell, styles.pointsText]}>{points}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Loading State
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
            <ActivityIndicator size="large" color="#9c27b0" />
            <Text style={styles.loadingText}>Loading standings...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Error State
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
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Main Content
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
          <View style={styles.headerCenter}>
            <View style={styles.headerTitleRow}>
              <Icon
                name="volleyball"
                size={isTablet ? 24 : 20}
                color="#9c27b0"
              />
              <Text style={styles.headerTitle}>{leagueName}</Text>
            </View>
            <Text style={styles.headerSubtitle}>{season} Standings</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchStandings}
          >
            <Icon name="refresh" size={isTablet ? 24 : 20} color="#9c27b0" />
          </TouchableOpacity>
        </View>

        {/* Standings Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {standings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon
                name="trophy-outline"
                size={isTablet ? 80 : 64}
                color="rgba(255,255,255,0.2)"
              />
              <Text style={styles.emptyText}>No standings available</Text>
            </View>
          ) : (
            standings.map((group, index) => {
              if (!group || group.length === 0) return null;

              const groupName = getGroupName(group);

              return (
                <View key={index} style={styles.groupSection}>
                  {/* Group Header (only show if multiple groups) */}
                  {hasGroups && (
                    <View style={styles.groupHeader}>
                      <Icon
                        name="format-list-numbered"
                        size={isTablet ? 24 : 20}
                        color="#9c27b0"
                      />
                      <Text style={styles.groupName}>{groupName}</Text>
                      <View style={styles.teamCount}>
                        <Text style={styles.teamCountText}>{group.length}</Text>
                      </View>
                    </View>
                  )}

                  {/* Standings Table */}
                  {renderStandingsTable(group)}
                </View>
              );
            })
          )}

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.formWin]} />
                <Text style={styles.legendText}>Win</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.formLoss]} />
                <Text style={styles.legendText}>Loss</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.topIndicator} />
                <Text style={styles.legendText}>Promotion</Text>
              </View>
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 24 : 16,
    paddingVertical: isTablet ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 39, 176, 0.2)',
  },
  backButton: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderRadius: isTablet ? 25 : 20,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 10 : 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#9c27b0',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginTop: 4,
  },

  // Content
  content: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },

  // Group Section
  groupSection: {
    marginBottom: isTablet ? 32 : 24,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 16 : 12,
  },
  groupName: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '800',
    marginLeft: isTablet ? 12 : 10,
    flex: 1,
  },
  teamCount: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: isTablet ? 18 : 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamCountText: {
    color: '#9c27b0',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '900',
  },

  // Table
  table: {
    backgroundColor: 'rgba(29, 45, 44, 0.7)',
    borderRadius: isTablet ? 20 : 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.2)',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: isTablet ? 16 : 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(156, 39, 176, 0.3)',
  },
  headerCell: {
    color: '#9c27b0',
    fontSize: isTablet ? 13 : 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: isTablet ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  topRow: {
    backgroundColor: 'rgba(156, 39, 176, 0.05)',
  },

  // Cells
  rankCell: {
    width: isTablet ? 45 : 38,
    alignItems: 'center',
  },
  rankBadge: {
    width: isTablet ? 30 : 26,
    height: isTablet ? 30 : 26,
    borderRadius: isTablet ? 15 : 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRankBadge: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderWidth: 1,
    borderColor: '#9c27b0',
  },
  rankText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '800',
  },
  topRankText: {
    color: '#9c27b0',
  },
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: isTablet ? 12 : 8,
  },
  teamLogo: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    marginRight: isTablet ? 10 : 8,
  },
  teamLogoPlaceholder: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    marginRight: isTablet ? 10 : 8,
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
  },
  promotionText: {
    color: '#4caf50',
    fontSize: isTablet ? 11 : 9,
    fontWeight: '500',
    marginTop: 1,
  },

  formContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 3,
  },
  formDot: {
    width: isTablet ? 10 : 8,
    height: isTablet ? 10 : 8,
    borderRadius: isTablet ? 5 : 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  formWin: {
    backgroundColor: '#4caf50',
  },
  formLoss: {
    backgroundColor: '#f44336',
  },
  formDraw: {
    backgroundColor: '#ff9800',
  },
  statCell: {
    width: isTablet ? 38 : 30,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  winCell: {
    color: '#4caf50',
  },
  lossCell: {
    color: '#f44336',
  },
  ptsCell: {
    width: isTablet ? 45 : 38,
    textAlign: 'center',
  },
  pointsText: {
    color: '#9c27b0',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '900',
  },

  // Legend
  legend: {
    marginTop: isTablet ? 24 : 20,
    padding: isTablet ? 20 : 16,
    backgroundColor: 'rgba(29, 45, 44, 0.5)',
    borderRadius: isTablet ? 16 : 12,
  },
  legendTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 11,
    fontWeight: '700',
    marginBottom: isTablet ? 12 : 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isTablet ? 20 : 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: isTablet ? 12 : 10,
    height: isTablet ? 12 : 10,
    borderRadius: isTablet ? 6 : 5,
    marginRight: isTablet ? 8 : 6,
  },
  topIndicator: {
    width: isTablet ? 14 : 12,
    height: isTablet ? 14 : 12,
    borderRadius: isTablet ? 7 : 6,
    backgroundColor: 'rgba(156, 39, 176, 0.3)',
    borderWidth: 1,
    borderColor: '#9c27b0',
    marginRight: isTablet ? 8 : 6,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: isTablet ? 13 : 11,
    fontWeight: '600',
  },

  // Loading & Error
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9c27b0',
    paddingHorizontal: isTablet ? 32 : 24,
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: isTablet ? 16 : 12,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 80 : 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginTop: isTablet ? 20 : 16,
  },
});

export default VolleyballStandingsScreen;
