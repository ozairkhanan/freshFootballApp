import React, {useState, useEffect} from 'react';
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
import {getStandings, getLeagues} from '../api/sportsApi';
import ShimmerCard from '../components/ShimmerCard';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const StandingsScreen = ({route, navigation}) => {
  const {leagueId, leagueName, season: initialSeason, sport = 'football'} = route.params;

  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [error, setError] = useState(null);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);

  useEffect(() => {
    fetchLeagueInfo();
  }, [leagueId]);

  useEffect(() => {
    fetchStandings();
  }, [leagueId, selectedSeason]);

  const fetchLeagueInfo = async () => {
    if (sport !== 'football') return;
    try {
      const data = await getLeagues({ id: leagueId });
      if (data.response && data.response.length > 0) {
        const sortedSeasons = data.response[0].seasons
          .map(s => s.year)
          .sort((a, b) => b - a); // Newest first
        setAvailableSeasons(sortedSeasons);
      }
    } catch (err) {
      console.log('League info not available');
    }
  };

  const fetchStandings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📊 Fetching standings: League ${leagueId}, Season ${selectedSeason}`);

      const data = await getStandings(leagueId, selectedSeason, sport);
      
      if (data.response && data.response.length > 0) {
        setStandings(data.response[0].league.standings);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching standings:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getFormIcon = (result) => {
    if (result === 'W') return {icon: 'check-circle', color: '#4caf50'};
    if (result === 'D') return {icon: 'minus-circle', color: '#ffc107'};
    if (result === 'L') return {icon: 'close-circle', color: '#f44336'};
    return {icon: 'circle-outline', color: 'rgba(255,255,255,0.3)'};
  };

  const renderShimmerLoading = () => (
    <View style={styles.shimmerContainer}>
      {[1, 2, 3, 4, 5].map(i => (
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Standings</Text>
            <View style={styles.backButton} />
          </View>
          {renderShimmerLoading()}
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Standings</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={80} color="#ff6b6b" />
            <Text style={styles.errorText}>Failed to load standings</Text>
            <Text style={styles.errorDetails}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStandings}>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{leagueName}</Text>
            <Text style={styles.headerSubtitle}>Season {selectedSeason}</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Season Selector */}
        {availableSeasons.length > 0 && (
          <View style={styles.seasonSelectorWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonSelectorContent}
            >
              {availableSeasons.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.seasonPill,
                    selectedSeason == s && styles.seasonPillActive
                  ]}
                  onPress={() => setSelectedSeason(s)}
                >
                  <Text style={[
                    styles.seasonPillText,
                    selectedSeason == s && styles.seasonPillTextActive
                  ]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.positionCell]}>#</Text>
          <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
          <Text style={[styles.headerCell, styles.statCell]}>P</Text>
          <Text style={[styles.headerCell, styles.statCell]}>W</Text>
          <Text style={[styles.headerCell, styles.statCell]}>D</Text>
          <Text style={[styles.headerCell, styles.statCell]}>L</Text>
          <Text style={[styles.headerCell, styles.statCell]}>GD</Text>
          <Text style={[styles.headerCell, styles.pointsCell]}>Pts</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {standings.map((group, groupIndex) => (
            <View key={groupIndex}>
              {group.map((team, index) => {
                const isChampionsLeague = team.rank <= 4;
                const isEuropaLeague = team.rank >= 5 && team.rank <= 6;
                const isRelegation = team.rank >= standings[0].length - 2;

                return (
                  <TouchableOpacity
                    key={team.team.id}
                    style={[
                      styles.tableRow,
                      isChampionsLeague && styles.rowChampionsLeague,
                      isEuropaLeague && styles.rowEuropaLeague,
                      isRelegation && styles.rowRelegation,
                    ]}
                    activeOpacity={0.7}>
                    {/* Position */}
                    <View style={styles.positionCell}>
                      <Text style={styles.positionText}>{team.rank}</Text>
                    </View>

                    {/* Team */}
                    <View style={styles.teamCell}>
                      {team.team.logo && (
                        <Image
                          source={{uri: team.team.logo}}
                          style={styles.teamLogo}
                        />
                      )}
                      <Text style={styles.teamName} numberOfLines={1}>
                        {team.team.name}
                      </Text>
                    </View>

                    {/* Stats */}
                    <Text style={styles.statCell}>{team.all.played}</Text>
                    <Text style={styles.statCell}>{team.all.win}</Text>
                    <Text style={styles.statCell}>{team.all.draw}</Text>
                    <Text style={styles.statCell}>{team.all.lose}</Text>
                    <Text style={[styles.statCell, team.goalsDiff >= 0 ? styles.positive : styles.negative]}>
                      {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                    </Text>

                    {/* Points */}
                    <View style={styles.pointsCell}>
                      <Text style={styles.pointsText}>{team.points}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: 'rgba(76, 175, 80, 0.3)'}]} />
            <Text style={styles.legendText}>Champions League</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: 'rgba(255, 152, 0, 0.3)'}]} />
            <Text style={styles.legendText}>Europa League</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, {backgroundColor: 'rgba(244, 67, 54, 0.3)'}]} />
            <Text style={styles.legendText}>Relegation</Text>
          </View>
        </View>
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
  background: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {width: 40, height: 40, justifyContent: 'center', alignItems: 'center'},
  headerTitleContainer: {alignItems: 'center'},
  headerTitle: {color: '#fff', fontSize: 20, fontWeight: '800'},
  headerSubtitle: {color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2},

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#00ffe7',
    backgroundColor: 'rgba(29, 45, 44, 0.9)',
  },
  headerCell: {
    color: '#00ffe7',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  positionCell: {width: 40},
  teamCell: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  statCell: {width: 32, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.8)'},
  pointsCell: {width: 40, alignItems: 'center'},

  scrollView: {flex: 1},
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowChampionsLeague: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  rowEuropaLeague: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
  },
  rowRelegation: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },

  positionText: {color: '#00ffe7', fontSize: 16, fontWeight: '900'},
  teamLogo: {width: 28, height: 28, marginRight: 10, borderRadius: 14},
  teamName: {color: '#fff', fontSize: 14, fontWeight: '600', flex: 1},
  positive: {color: '#4caf50'},
  negative: {color: '#f44336'},
  pointsText: {color: '#00ffe7', fontSize: 16, fontWeight: '900'},

  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(29, 45, 44, 0.9)',
  },
  legendItem: {flexDirection: 'row', alignItems: 'center'},
  legendDot: {width: 12, height: 12, borderRadius: 6, marginRight: 6},
  legendText: {color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600'},

  shimmerContainer: {flex: 1, padding: 16},
  errorContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32},
  errorText: {color: '#ff6b6b', fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 12},
  errorDetails: {color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', marginBottom: 24},
  retryButton: {backgroundColor: '#00ffe7', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12},
  retryText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  
  // Season Selector
  seasonSelectorWrapper: {
    backgroundColor: 'rgba(29, 45, 44, 0.5)',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  seasonSelectorContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  seasonPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  seasonPillActive: {
    backgroundColor: 'rgba(0, 255, 231, 0.2)',
    borderColor: '#00ffe7',
  },
  seasonPillText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '700',
  },
  seasonPillTextActive: {
    color: '#fff',
  },
});

export default StandingsScreen;
