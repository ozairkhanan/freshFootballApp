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
import HockeyStandingsTable from '../components/hockey/HockeyStandingsTable';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const HockeyStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId = 1,
    leagueName = 'NHL',
    season = '2024',
  } = route.params || {};

  const [activeGroup, setActiveGroup] = useState(0);
  const [standings, setStandings] = useState(null);
  const [groups, setGroups] = useState([]);
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
        `🏒 Fetching hockey standings: League ${leagueId}, Season ${season}`,
      );

      const data = await getStandingsGroups(leagueId, season, 'hockey');

      if (data.response && data.response.length > 0) {
        setStandings(data.response);

        // Extract group names
        const groupNames = data.response.map(group => {
          if (Array.isArray(group) && group.length > 0) {
            return group[0].group?.name || group[0].groupName || 'Standings';
          }
          return 'Standings';
        });
        setGroups(groupNames);
      } else {
        setStandings([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Hockey standings error:', err);
      setError(err.message || 'Failed to load standings');
      setLoading(false);
    }
  };

  const handleTeamPress = teamId => {
    if (teamId) {
      navigation.navigate('TeamProfile', {
        teamId,
        sport: 'hockey',
        leagueId,
        season,
      });
    }
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
              <Text style={styles.headerSubtitle}>{season} Season</Text>
            </View>
            <View style={styles.backButton} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00bcd4" />
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
              color="#ff3d3d"
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

        {groups.length > 1 && (
          <View style={styles.tabsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
            >
              {groups.map((group, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tabButton,
                    activeGroup === index && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveGroup(index)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeGroup === index && styles.tabTextActive,
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {standings && standings.length > 0 ? (
            <>
              <View style={styles.groupHeader}>
                <Icon name="trophy-outline" size={20} color="#00bcd4" />
                <Text style={styles.groupTitle}>
                  {groups[activeGroup] || 'League Ranking'}
                </Text>
              </View>
              <HockeyStandingsTable
                teams={standings[activeGroup]}
                onTeamPress={handleTeamPress}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon
                name="clipboard-text-outline"
                size={64}
                color="rgba(255,255,255,0.1)"
              />
              <Text style={styles.emptyText}>No standings data available</Text>
            </View>
          )}
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#00bcd4',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginTop: 4,
  },
  tabsWrapper: {
    marginBottom: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
    borderColor: '#00bcd4',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#00bcd4',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#ff3d3d',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#00bcd4',
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HockeyStandingsScreen;
