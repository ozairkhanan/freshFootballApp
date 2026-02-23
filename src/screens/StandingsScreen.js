import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import BaseStandings, { StandingsHeaderCell, StandingsRow } from '../components/common/BaseStandings';
import { TeamLogo } from '../components/common/CommonUI';
import useStandings from '../hooks/useStandings';
import { getLeagues } from '../api/sportsApi';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const FOOTBALL_COLOR = '#00ffe7';

const StandingsScreen = ({ route, navigation }) => {
  const { leagueId, leagueName, season: initialSeason, sport = 'football' } = route.params;

  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const { standings, loading, error, hasGroups, refresh } = useStandings(leagueId, selectedSeason, sport);
  const [activeGroup, setActiveGroup] = useState(0);

  useEffect(() => {
    fetchLeagueInfo();
  }, [leagueId]);

  const fetchLeagueInfo = async () => {
    try {
      const data = await getLeagues({ id: leagueId });
      if (data.response && data.response.length > 0) {
        const sortedSeasons = data.response[0].seasons
          .map(s => s.year)
          .sort((a, b) => b - a);
        setAvailableSeasons(sortedSeasons);
      }
    } catch (err) {
      console.log('League info not available');
    }
  };

  const getFormIcon = (result) => {
    if (result === 'W') return { icon: 'check-circle', color: '#4caf50' };
    if (result === 'D') return { icon: 'minus-circle', color: '#ffc107' };
    if (result === 'L') return { icon: 'close-circle', color: '#f44336' };
    return { icon: 'circle-outline', color: 'rgba(255,255,255,0.3)' };
  };

  const currentStandings = hasGroups ? (standings[activeGroup] || []) : standings;
  const groups = hasGroups ? standings.map(g => g[0]?.group || `Group ${activeGroup + 1}`) : [];

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <StandingsHeaderCell width={isTablet ? 36 : 28}>#</StandingsHeaderCell>
      <StandingsHeaderCell flex={1} style={{ alignItems: 'flex-start', paddingLeft: 8 }}>Team</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 34 : 26}>P</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 34 : 26}>W</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 34 : 26}>D</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 34 : 26}>L</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 60 : 45}>Goals</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 40 : 32}>PTS</StandingsHeaderCell>
    </View>
  );

  const renderRow = (team, index) => {
    const isTop = team.rank <= 4;
    const isBottom = team.rank >= currentStandings.length - 2;
    const highlightColor = isTop ? FOOTBALL_COLOR : (isBottom ? '#ff6b6b' : null);

    return (
      <View key={team.team?.id || index}>
        <StandingsRow 
          item={team} 
          index={index} 
          isEven={index % 2 === 0}
          highlightColor={highlightColor}
          onPress={(id) => navigation.navigate('TeamProfile', { teamId: id, sport: 'football' })}
        >
          <View style={styles.cellWidth(isTablet ? 36 : 28)}>
            <Text style={[styles.rankText, highlightColor && { color: highlightColor }]}>{team.rank}</Text>
          </View>

          <View style={styles.teamInfo}>
            <TeamLogo logo={team.team?.logo} sport="football" color={FOOTBALL_COLOR} size={24} />
            <Text style={styles.teamName} numberOfLines={1}>{team.team?.name}</Text>
          </View>

          <Text style={styles.statCell}>{team.all?.played || 0}</Text>
          <Text style={styles.statCell}>{team.all?.win || 0}</Text>
          <Text style={styles.statCell}>{team.all?.draw || 0}</Text>
          <Text style={styles.statCell}>{team.all?.lose || 0}</Text>
          <Text style={[styles.statCell, { width: isTablet ? 60 : 45 }]}>
            {team.all?.goals?.for}:{team.all?.goals?.against}
          </Text>
          <View style={styles.ptsCell}>
            <Text style={[styles.ptsText, isTop && { color: FOOTBALL_COLOR }]}>{team.points || 0}</Text>
          </View>
        </StandingsRow>
        
        {/* Optional Form Row or expanded info can go here */}
      </View>
    );
  };

  return (
    <BaseStandings
      title={leagueName}
      subtitle={`Season ${selectedSeason}`}
      sport="football"
      sportColor={FOOTBALL_COLOR}
      sportIcon="soccer"
      loading={loading}
      error={error}
      standings={currentStandings}
      onRetry={refresh}
      onBack={() => navigation.goBack()}
      renderHeader={renderHeader}
      renderRow={renderRow}
      legendData={[
        { label: 'Champions League', color: FOOTBALL_COLOR },
        { label: 'Relegation', color: '#ff6b6b' },
      ]}
    >
      {/* Season Selector */}
      {availableSeasons.length > 1 && (
        <View style={styles.seasonWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonContainer}>
            {availableSeasons.slice(0, 5).map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.seasonButton, selectedSeason === year.toString() && styles.seasonButtonActive]}
                onPress={() => setSelectedSeason(year.toString())}
              >
                <Text style={[styles.seasonText, selectedSeason === year.toString() && styles.seasonTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Group Tabs if multi-group */}
      {hasGroups && groups.length > 1 && (
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {groups.map((group, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tabButton, activeGroup === index && styles.tabButtonActive]}
                onPress={() => setActiveGroup(index)}
              >
                <Text style={[styles.tabText, activeGroup === index && styles.tabTextActive]}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </BaseStandings>
  );
};

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 255, 231, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 231, 0.2)',
  },
  cellWidth: (w) => ({
    width: w,
    alignItems: 'center',
  }),
  rankText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '700',
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  statCell: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 13 : 11,
    fontWeight: '600',
    width: isTablet ? 34 : 26,
    textAlign: 'center',
  },
  ptsCell: {
    width: isTablet ? 40 : 32,
    alignItems: 'center',
  },
  ptsText: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '800',
  },
  seasonWrapper: { marginBottom: 12 },
  seasonContainer: { paddingHorizontal: 16 },
  seasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  seasonButtonActive: {
    backgroundColor: 'rgba(0, 255, 231, 0.15)',
    borderColor: FOOTBALL_COLOR,
  },
  seasonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  seasonTextActive: { color: FOOTBALL_COLOR },
  tabsWrapper: { marginBottom: 12 },
  tabsContainer: { paddingHorizontal: 16 },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0, 255, 231, 0.1)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: { color: FOOTBALL_COLOR },
});

export default StandingsScreen;
