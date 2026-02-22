import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import { getStandings } from '../api/sportsApi';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Handball theme color
const HANDBALL_COLOR = '#4caf50';

const HandballStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId,
    leagueName = 'Handball',
    season = new Date().getFullYear().toString(),
  } = route.params || {};

  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandings();
  }, [leagueId, season]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        `🤾 Fetching handball standings: League ${leagueId}, Season ${season}`,
      );

      const response = await getStandings(leagueId, season, 'handball');

      if (response.response && response.response.length > 0) {
        // Handball standings come as nested array
        const standingsData = response.response[0] || [];
        setStandings(standingsData);
      } else {
        setStandings([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Standings error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const renderTeamRow = (team, index) => {
    const isTopTeam = team.position <= 3;
    const isBottomTeam = team.position >= standings.length - 2;

    return (
      <View
        key={team.team?.id || index}
        style={[
          styles.teamRow,
          index % 2 === 0 && styles.teamRowEven,
          isTopTeam && styles.teamRowTop,
          isBottomTeam && styles.teamRowBottom,
        ]}
      >
        {/* Position */}
        <View style={styles.positionContainer}>
          <Text
            style={[
              styles.position,
              isTopTeam && styles.positionTop,
              isBottomTeam && styles.positionBottom,
            ]}
          >
            {team.position}
          </Text>
        </View>

        {/* Team Info */}
        <View style={styles.teamInfo}>
          {team.team?.logo ? (
            <Image
              source={{ uri: team.team.logo }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.teamLogoPlaceholder}>
              <Icon name="handball" size={isTablet ? 18 : 16} color={HANDBALL_COLOR} />
            </View>
          )}

          <Text style={styles.teamName} numberOfLines={1}>
            {team.team?.name || 'Unknown'}
          </Text>
        </View>

        {/* Stats */}
        <Text style={styles.stat}>{team.games?.played || 0}</Text>
        <Text style={[styles.stat, styles.statWin]}>
          {team.games?.win?.total || 0}
        </Text>
        <Text style={styles.stat}>{team.games?.draw?.total || 0}</Text>
        <Text style={[styles.stat, styles.statLose]}>
          {team.games?.lose?.total || 0}
        </Text>
        <Text style={styles.stat}>{team.goals?.for || 0}</Text>
        <Text style={styles.stat}>{team.goals?.against || 0}</Text>
        <Text style={[styles.points, isTopTeam && styles.pointsTop]}>
          {team.points || 0}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.positionContainer}>
        <Text style={styles.headerText}>#</Text>
      </View>
      <View style={styles.teamInfo}>
        <Text style={styles.headerText}>Team</Text>
      </View>
      <Text style={styles.headerStat}>P</Text>
      <Text style={styles.headerStat}>W</Text>
      <Text style={styles.headerStat}>D</Text>
      <Text style={styles.headerStat}>L</Text>
      <Text style={styles.headerStat}>GF</Text>
      <Text style={styles.headerStat}>GA</Text>
      <Text style={styles.headerPoints}>PTS</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={gradients.background}
          style={styles.background}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{leagueName}</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={HANDBALL_COLOR} />
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
        <LinearGradient
          colors={gradients.background}
          style={styles.background}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{leagueName}</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={64} color="#ff6b6b" />
            <Text style={styles.errorText}>Failed to load standings</Text>
            <Text style={styles.errorDetails}>{error}</Text>
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
      <LinearGradient
        colors={gradients.background}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {leagueName}
            </Text>
            <Text style={styles.headerSubtitle}>Season {season}</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Sport Badge */}
        <View style={styles.sportBadge}>
          <LinearGradient
            colors={['#4caf50', '#388e3c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sportBadgeGradient}
          >
            <Icon name="handball" size={isTablet ? 22 : 18} color="#fff" style={styles.sportIcon} />
            <Text style={styles.sportBadgeText}>Handball</Text>
          </LinearGradient>
        </View>


        {standings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="clipboard-text-outline" size={isTablet ? 80 : 64} color="rgba(255, 255, 255, 0.2)" />
            <Text style={styles.emptyText}>No standings available</Text>
            <Text style={styles.emptySubtext}>
              Standings data for this league is not available yet
            </Text>
          </View>

        ) : (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.tableContainer}>
              {renderHeader()}
              {standings.map((team, index) => renderTeamRow(team, index))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: HANDBALL_COLOR },
                  ]}
                />
                <Text style={styles.legendText}>Promotion</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]}
                />
                <Text style={styles.legendText}>Relegation</Text>
              </View>
            </View>
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 22 : 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: HANDBALL_COLOR,
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sportBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sportBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sportIcon: {
    marginRight: 8,
  },

  sportBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  errorDetails: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: HANDBALL_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: { flex: 1 },
  tableContainer: {
    marginHorizontal: isTablet ? 24 : 12,
    backgroundColor: 'rgba(29, 45, 44, 0.7)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.3)',
  },
  headerText: {
    color: HANDBALL_COLOR,
    fontSize: isTablet ? 13 : 11,
    fontWeight: '700',
  },
  headerStat: {
    color: HANDBALL_COLOR,
    fontSize: isTablet ? 13 : 11,
    fontWeight: '700',
    width: isTablet ? 36 : 28,
    textAlign: 'center',
  },
  headerPoints: {
    color: HANDBALL_COLOR,
    fontSize: isTablet ? 13 : 11,
    fontWeight: '700',
    width: isTablet ? 44 : 36,
    textAlign: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  teamRowEven: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  teamRowTop: {
    borderLeftWidth: 3,
    borderLeftColor: HANDBALL_COLOR,
  },
  teamRowBottom: {
    borderLeftWidth: 3,
    borderLeftColor: '#ff6b6b',
  },
  positionContainer: {
    width: isTablet ? 32 : 28,
    alignItems: 'center',
  },
  position: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '700',
  },
  positionTop: {
    color: HANDBALL_COLOR,
  },
  positionBottom: {
    color: '#ff6b6b',
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  teamLogo: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    marginRight: 10,
  },
  teamLogoPlaceholder: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
  },
  teamLogoText: {
    fontSize: 14,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
    flex: 1,
  },
  stat: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    width: isTablet ? 36 : 28,
    textAlign: 'center',
  },
  statWin: {
    color: HANDBALL_COLOR,
  },
  statLose: {
    color: '#ff6b6b',
  },
  points: {
    color: '#fff',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '800',
    width: isTablet ? 44 : 36,
    textAlign: 'center',
  },
  pointsTop: {
    color: HANDBALL_COLOR,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 24,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HandballStandingsScreen;
