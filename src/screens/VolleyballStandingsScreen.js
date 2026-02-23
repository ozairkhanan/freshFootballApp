import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import BaseStandings, { StandingsHeaderCell, StandingsRow } from '../components/common/BaseStandings';
import { TeamLogo } from '../components/common/CommonUI';
import useStandings from '../hooks/useStandings';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const VOLLEYBALL_COLOR = '#9c27b0';

const VolleyballStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId,
    leagueName = 'Volleyball',
    season = new Date().getFullYear().toString(),
  } = route.params || {};

  const { standings, loading, error, refresh } = useStandings(leagueId, season, 'volleyball');
  const [activeGroup, setActiveGroup] = useState(0);

  const groups = Array.isArray(standings) ? standings.map(group => {
    if (Array.isArray(group) && group.length > 0) {
      return group[0].group?.name || group[0].groupName || 'Standings';
    }
    return 'Standings';
  }) : [];

  const currentTeams = Array.isArray(standings) ? (standings[activeGroup] || []) : [];

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <StandingsHeaderCell width={isTablet ? 40 : 30}>#</StandingsHeaderCell>
      <StandingsHeaderCell flex={1} style={{ alignItems: 'flex-start', paddingLeft: 8 }}>Team</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 35 : 25}>P</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 35 : 25}>W</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 35 : 25}>L</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 40 : 30}>S+</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 40 : 30}>S-</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 45 : 35}>PTS</StandingsHeaderCell>
    </View>
  );

  const renderRow = (team, index) => {
    const isTopTeam = team.position <= 2;
    const highlightColor = isTopTeam ? VOLLEYBALL_COLOR : null;

    return (
      <StandingsRow 
        key={team.team?.id || index} 
        item={team} 
        index={index} 
        isEven={index % 2 === 0}
        highlightColor={highlightColor}
        onPress={(id) => navigation.navigate('TeamProfile', { teamId: id, sport: 'volleyball' })}
      >
        <View style={styles.cellWidth(isTablet ? 40 : 30)}>
          <Text style={[styles.position, highlightColor && { color: highlightColor }]}>
            {team.position}
          </Text>
        </View>

        <View style={styles.teamInfo}>
          <TeamLogo logo={team.team?.logo} sport="volleyball" color={VOLLEYBALL_COLOR} size={24} />
          <Text style={styles.teamName} numberOfLines={1}>
            {team.team?.name || 'Unknown'}
          </Text>
        </View>

        <Text style={styles.statCell}>{team.games?.played || 0}</Text>
        <Text style={[styles.statCell, { color: '#4caf50' }]}>{team.games?.win?.total || 0}</Text>
        <Text style={[styles.statCell, { color: '#ff6b6b' }]}>{team.games?.lose?.total || 0}</Text>
        <Text style={styles.statCell}>{team.goals?.for || 0}</Text>
        <Text style={styles.statCell}>{team.goals?.against || 0}</Text>
        <View style={styles.ptsCell}>
          <Text style={styles.ptsText}>{team.points || 0}</Text>
        </View>
      </StandingsRow>
    );
  };

  return (
    <BaseStandings
      title={leagueName}
      subtitle={`Season ${season}`}
      sport="volleyball"
      sportColor={VOLLEYBALL_COLOR}
      sportIcon="volleyball"
      loading={loading}
      error={error}
      standings={currentTeams}
      onRetry={refresh}
      onBack={() => navigation.goBack()}
      renderHeader={renderHeader}
      renderRow={renderRow}
      legendData={[
        { label: 'Playoffs', color: VOLLEYBALL_COLOR },
      ]}
    >
      {groups.length > 1 && (
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
    paddingHorizontal: 16,
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 39, 176, 0.3)',
  },
  cellWidth: (w) => ({
    width: w,
    alignItems: 'center',
  }),
  position: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 15 : 13,
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
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  statCell: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    width: isTablet ? 40 : 30, // Default width for S+, S-
    textAlign: 'center',
  },
  ptsCell: {
    width: isTablet ? 45 : 35,
    alignItems: 'center',
  },
  ptsText: {
    color: VOLLEYBALL_COLOR,
    fontSize: isTablet ? 15 : 13,
    fontWeight: '800',
  },
  tabsWrapper: { marginBottom: 8 },
  tabsContainer: { paddingHorizontal: 16, paddingVertical: 8 },
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
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderColor: VOLLEYBALL_COLOR,
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: { color: VOLLEYBALL_COLOR },
});

export default VolleyballStandingsScreen;
