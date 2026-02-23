import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import BaseStandings, { StandingsHeaderCell, StandingsRow } from '../components/common/BaseStandings';
import { TeamLogo } from '../components/common/CommonUI';
import useStandings from '../hooks/useStandings';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const HANDBALL_COLOR = '#4caf50';

const HandballStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId,
    leagueName = 'Handball',
    season = new Date().getFullYear().toString(),
  } = route.params || {};

  const { standings, loading, error, refresh } = useStandings(leagueId, season, 'handball');

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <StandingsHeaderCell width={isTablet ? 32 : 28}>#</StandingsHeaderCell>
      <StandingsHeaderCell flex={1} style={{ alignItems: 'flex-start', paddingLeft: 8 }}>Team</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 36 : 28}>P</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 36 : 28}>W</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 36 : 28}>D</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 36 : 28}>L</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 36 : 28}>GF</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 36 : 28}>GA</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 44 : 36}>PTS</StandingsHeaderCell>
    </View>
  );

  const renderRow = (team, index) => {
    const isTopTeam = team.position <= 3;
    const isBottomTeam = team.position >= standings.length - 2;
    const highlightColor = isTopTeam ? HANDBALL_COLOR : (isBottomTeam ? '#ff6b6b' : null);

    return (
      <StandingsRow 
        key={team.team?.id || index} 
        item={team} 
        index={index} 
        isEven={index % 2 === 0}
        highlightColor={highlightColor}
        onPress={(id) => navigation.navigate('TeamProfile', { teamId: id, sport: 'handball' })}
      >
        {/* Position */}
        <View style={styles.cellWidth(isTablet ? 32 : 28)}>
          <Text style={[styles.position, highlightColor && { color: highlightColor }]}>
            {team.position}
          </Text>
        </View>

        {/* Team Info */}
        <View style={styles.teamInfo}>
          <TeamLogo logo={team.team?.logo} sport="handball" color={HANDBALL_COLOR} size={24} />
          <Text style={styles.teamName} numberOfLines={1}>
            {team.team?.name || 'Unknown'}
          </Text>
        </View>

        {/* Stats */}
        <Text style={styles.stat}>{team.games?.played || 0}</Text>
        <Text style={[styles.stat, styles.statWin]}>{team.games?.win?.total || 0}</Text>
        <Text style={styles.stat}>{team.games?.draw?.total || 0}</Text>
        <Text style={[styles.stat, styles.statLose]}>{team.games?.lose?.total || 0}</Text>
        <Text style={styles.stat}>{team.goals?.for || 0}</Text>
        <Text style={styles.stat}>{team.goals?.against || 0}</Text>
        <Text style={[styles.points, isTopTeam && styles.pointsTop]}>{team.points || 0}</Text>
      </StandingsRow>
    );
  };

  return (
    <BaseStandings
      title={leagueName}
      subtitle={`Season ${season}`}
      sport="handball"
      sportColor={HANDBALL_COLOR}
      sportIcon="handball"
      loading={loading}
      error={error}
      standings={standings}
      onRetry={refresh}
      onBack={() => navigation.goBack()}
      renderHeader={renderHeader}
      renderRow={renderRow}
      legendData={[
        { label: 'Promotion', color: HANDBALL_COLOR },
        { label: 'Relegation', color: '#ff6b6b' },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.3)',
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
  stat: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    width: isTablet ? 36 : 28,
    textAlign: 'center',
  },
  statWin: { color: HANDBALL_COLOR },
  statLose: { color: '#ff6b6b' },
  points: {
    color: '#fff',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '800',
    width: isTablet ? 44 : 36,
    textAlign: 'center',
  },
  pointsTop: { color: HANDBALL_COLOR },
});

export default HandballStandingsScreen;
