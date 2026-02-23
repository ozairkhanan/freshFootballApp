import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import BaseStandings, { StandingsHeaderCell, StandingsRow } from '../components/common/BaseStandings';
import { TeamLogo } from '../components/common/CommonUI';
import useStandings from '../hooks/useStandings';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const HOCKEY_COLOR = '#00bcd4';

const HockeyStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId = 1,
    leagueName = 'NHL',
    season = '2024',
  } = route.params || {};

  const { standings, loading, error, hasGroups, refresh } = useStandings(leagueId, season, 'hockey');
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
      <StandingsHeaderCell width={isTablet ? 50 : 40}>#</StandingsHeaderCell>
      <StandingsHeaderCell flex={1} style={{ alignItems: 'flex-start', paddingLeft: 8 }}>Team</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 45 : 35}>GP</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 45 : 35}>W</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 45 : 35}>L</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 45 : 35}>OTL</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 50 : 40}>PTS</StandingsHeaderCell>
    </View>
  );

  const renderRow = (team, index) => {
    const position = team.position || index + 1;
    return (
      <StandingsRow 
        key={team.team?.id || index} 
        item={team} 
        index={index} 
        isEven={index % 2 === 0}
        onPress={(id) => navigation.navigate('TeamProfile', { teamId: id, sport: 'hockey' })}
      >
        <View style={styles.cellWidth(isTablet ? 50 : 40)}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{position}</Text>
          </View>
        </View>

        <View style={styles.teamInfo}>
          <TeamLogo logo={team.team?.logo} sport="hockey" color={HOCKEY_COLOR} size={28} />
          <Text style={styles.teamName} numberOfLines={1}>
            {team.team?.name || 'Unknown'}
          </Text>
        </View>

        <Text style={styles.statCell}>{team.games?.played || 0}</Text>
        <Text style={styles.statCell}>{team.games?.win?.total || 0}</Text>
        <Text style={styles.statCell}>{team.games?.lose?.total || 0}</Text>
        <Text style={styles.statCell}>{team.games?.lose?.overtime || 0}</Text>
        <View style={styles.ptsCell}>
          <Text style={styles.ptsText}>{team.points || 0}</Text>
        </View>
      </StandingsRow>
    );
  };

  return (
    <BaseStandings
      title={leagueName}
      subtitle={`${season} Standings`}
      sport="hockey"
      sportColor={HOCKEY_COLOR}
      sportIcon="hockey-puck"
      loading={loading}
      error={error}
      standings={currentTeams}
      onRetry={refresh}
      onBack={() => navigation.goBack()}
      renderHeader={renderHeader}
      renderRow={renderRow}
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
      
      {currentTeams.length > 0 && (
        <View style={styles.groupHeader}>
          <Icon name="trophy-outline" size={20} color={HOCKEY_COLOR} />
          <Text style={styles.groupTitle}>{groups[activeGroup] || 'League Ranking'}</Text>
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
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 188, 212, 0.3)',
  },
  cellWidth: (w) => ({
    width: w,
    alignItems: 'center',
  }),
  rankBadge: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '800',
  },
  teamInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    flex: 1,
    marginLeft: 10,
  },
  statCell: {
    width: isTablet ? 45 : 35,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  ptsCell: {
    width: isTablet ? 50 : 40,
    alignItems: 'center',
  },
  ptsText: {
    color: HOCKEY_COLOR,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '900',
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
    backgroundColor: 'rgba(0, 188, 212, 0.2)',
    borderColor: HOCKEY_COLOR,
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: { color: HOCKEY_COLOR },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  groupTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },
});

export default HockeyStandingsScreen;
