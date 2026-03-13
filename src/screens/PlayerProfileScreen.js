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
import { getPlayerProfiles, getPlayers, getPlayerSeasons, getTransfers } from '../api/sportsApi';
import ShimmerCard from '../components/ShimmerCard';
import TransferCard from '../components/TransferCard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const PlayerProfileScreen = ({ route, navigation }) => {
  const { playerId, playerName, teamId } = route.params;

  const [loading, setLoading] = useState(true);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('stats');
  const [transfers, setTransfers] = useState([]); // ✅ NEW

  useEffect(() => {
    fetchInitialData();
  }, [playerId]);

  useEffect(() => {
    fetchStats();
  }, [playerId, selectedSeason]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const profileData = await getPlayerProfiles({ player: playerId });
      if (profileData.response && profileData.response.length > 0) {
        setPlayerProfile(profileData.response[0].player);
      }

      // Fetch available seasons
      const seasonsData = await getPlayerSeasons(playerId);
      if (seasonsData.response) {
        setAvailableSeasons(seasonsData.response.sort((a, b) => b - a));
        if (seasonsData.response.length > 0) {
          // Set to latest season by default
          setSelectedSeason(seasonsData.response.sort((a, b) => b - a)[0]);
        }
      }

      // ✅ Fetch Transfers
      const transfersData = await getTransfers({ player: playerId });
      if (transfersData.response && transfersData.response.length > 0) {
          setTransfers(transfersData.response[0].transfers || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching player initial data:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getPlayers({ id: playerId, season: selectedSeason });
      if (statsData.response && statsData.response.length > 0) {
        setPlayerStats(statsData.response[0].statistics);
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
    }
  };

  const renderHeader = () => {
    if (!playerProfile) return null;

    return (
      <View style={styles.headerProfile}>
        <View style={styles.photoContainer}>
          <Image source={{ uri: playerProfile.photo }} style={styles.playerPhoto} />
          <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{playerStats?.[0]?.games?.number || '#'}</Text>
          </View>
        </View>
        <Text style={styles.playerName}>{playerProfile.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaText}>{playerProfile.age} Years</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="flag" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaText}>{playerProfile.nationality}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="account" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaText}>{playerStats?.[0]?.games?.position || 'N/A'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabWrapper}>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'stats' && styles.tabBtnActive]}
        onPress={() => setActiveTab('stats')}
      >
        <Text style={[styles.tabBtnText, activeTab === 'stats' && styles.tabBtnTextActive]}>Statistics</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'transfers' && styles.tabBtnActive]}
        onPress={() => setActiveTab('transfers')}
      >
        <Text style={[styles.tabBtnText, activeTab === 'transfers' && styles.tabBtnTextActive]}>Transfers</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSeasonSelector = () => (
    <View style={styles.seasonSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonContent}>
        {availableSeasons.map(year => (
          <TouchableOpacity
            key={year}
            style={[styles.seasonPill, selectedSeason === year && styles.seasonPillActive]}
            onPress={() => setSelectedSeason(year)}
          >
            <Text style={[styles.seasonText, selectedSeason === year && styles.seasonTextActive]}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStats = () => {
    if (!playerStats || playerStats.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="chart-bar" size={60} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>No stats for {selectedSeason}</Text>
        </View>
      );
    }

    const currentStats = playerStats[0]; // Usually one per team/season

    return (
      <View style={styles.statsContainer}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{currentStats.games.appearences || 0}</Text>
            <Text style={styles.metricLabel}>Matches</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{currentStats.goals.total || 0}</Text>
            <Text style={styles.metricLabel}>Goals</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricVal}>{currentStats.goals.assists || 0}</Text>
            <Text style={styles.metricLabel}>Assists</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={[styles.metricVal, {color: '#4caf50'}]}>{parseFloat(currentStats.games.rating || 0).toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Rating</Text>
          </View>
        </View>

        {/* Detailed Stats Cards */}
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Icon name="run" size={20} color="#00ffe7" />
                <Text style={styles.cardTitle}>Performance</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Minutes Played</Text>
                <Text style={styles.statValue}>{currentStats.games.minutes || 0}</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Lineups</Text>
                <Text style={styles.statValue}>{currentStats.games.lineups || 0}</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Captain</Text>
                <Text style={styles.statValue}>{currentStats.games.captain ? 'Yes' : 'No'}</Text>
            </View>
        </View>

        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Icon name="soccer" size={20} color="#00ffe7" />
                <Text style={styles.cardTitle}>Attacking</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Shots (On Target)</Text>
                <Text style={styles.statValue}>{currentStats.shots.total || 0} ({currentStats.shots.on || 0})</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Passes Accuracy</Text>
                <Text style={styles.statValue}>{currentStats.passes.accuracy || 0}%</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Key Passes</Text>
                <Text style={styles.statValue}>{currentStats.passes.key || 0}</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Dribbles (Won)</Text>
                <Text style={styles.statValue}>{currentStats.dribbles.attempts || 0} ({currentStats.dribbles.success || 0})</Text>
            </View>
        </View>

        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Icon name="shield-check" size={20} color="#dc3545" />
                <Text style={styles.cardTitle}>Discipline</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Yellow Cards</Text>
                <Text style={[styles.statValue, {color: '#ffc107'}]}>{currentStats.cards.yellow || 0}</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Red Cards</Text>
                <Text style={[styles.statValue, {color: '#dc3545'}]}>{currentStats.cards.red || 0}</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Fouls Committed</Text>
                <Text style={styles.statValue}>{currentStats.fouls.committed || 0}</Text>
            </View>
            <View style={styles.statRow}>
                <Text style={styles.statLabel}>Fouls Drawn</Text>
                <Text style={styles.statValue}>{currentStats.fouls.drawn || 0}</Text>
            </View>
        </View>
      </View>
    );
  };

  const renderTransfers = () => {
    if (!transfers || transfers.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="swap-horizontal" size={60} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyText}>No transfer history available</Text>
        </View>
      );
    }

    let lastDate = '';

    return (
      <View style={styles.transfersContainer}>
        {transfers.map((item, index) => {
           const showSeparator = item.date !== lastDate;
           lastDate = item.date;

           return (
             <View key={index}>
               {showSeparator && (
                 <View style={styles.dateSeparator}>
                    <View style={styles.sepLine} />
                    <Text style={styles.sepText}>{new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    <View style={styles.sepLine} />
                 </View>
               )}
               <TransferCard 
                transfer={{ ...item, player: playerProfile }} 
                playerName={index === 0 ? playerProfile?.name : null} 
                onTeamPress={(id) => navigation.navigate('TeamProfile', { teamId: id })}
               />
             </View>
           );
        })}
      </View>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
           <View style={styles.navHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.shimmerBox}>
             <ShimmerCard />
             <ShimmerCard />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Player Profile</Text>
          <View style={styles.navBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderTabs()}
          {activeTab === 'stats' ? (
            <>
              {renderSeasonSelector()}
              {renderStats()}
            </>
          ) : (
            renderTransfers()
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  
  headerProfile: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  playerPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00ffe7',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  numberBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#00ffe7',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0d1a1a',
  },
  numberText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  playerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10,
  },

  seasonSelector: {
    paddingVertical: 12,
    backgroundColor: 'rgba(29, 45, 44, 0.5)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  seasonContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  seasonPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  seasonPillActive: {
    backgroundColor: '#00ffe7',
    borderColor: '#00ffe7',
  },
  seasonText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    fontSize: 13,
  },
  seasonTextActive: {
    color: '#fff',
  },

  statsContainer: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    width: (width - 64) / 4,
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  metricVal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },

  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  shimmerBox: {
    padding: 16,
    gap: 16,
  },

  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(29, 45, 44, 0.4)',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#00ffe7',
  },
  tabBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
    fontSize: 14,
  },
  tabBtnTextActive: {
    color: '#fff',
  },

  transfersContainer: {
    paddingVertical: 16,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 210, 255, 0.2)',
  },
  sepText: {
    color: '#00d2ff',
    fontSize: 12,
    fontWeight: '800',
    marginHorizontal: 15,
  },
});

export default PlayerProfileScreen;