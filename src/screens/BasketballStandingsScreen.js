import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import BaseStandings, { StandingsHeaderCell, StandingsRow } from '../components/common/BaseStandings';
import { TeamLogo } from '../components/common/CommonUI';
import useStandings from '../hooks/useStandings';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BASKETBALL_COLOR = '#ff9800';

const BasketballStandingsScreen = ({ route, navigation }) => {
  const {
    leagueId = 12,
    leagueName = 'NBA',
    season = '2024-2025',
  } = route.params || {};

  const { standings, loading, error, refresh } = useStandings(leagueId, season, 'basketball');
  const [viewType, setViewType] = useState('conference'); // 'conference' or 'division'
  const [activeGroup, setActiveGroup] = useState(0);

  // Group processing for Basketball
  const groups = Array.isArray(standings) ? standings.filter(group => {
    if (!Array.isArray(group) || group.length === 0) return false;
    const groupName = group[0].group?.name?.toLowerCase() || group[0].groupName?.toLowerCase() || '';
    if (viewType === 'division') return groupName.includes('division');
    return groupName.includes('conference');
  }) : [];

  const groupNames = groups.map(g => g[0].group?.name || g[0].groupName || 'Standings');
  const currentTeams = groups[activeGroup] || [];

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <StandingsHeaderCell width={isTablet ? 40 : 32}>#</StandingsHeaderCell>
      <StandingsHeaderCell flex={1} style={{ alignItems: 'flex-start', paddingLeft: 8 }}>Team</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 45 : 35}>W</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 45 : 35}>L</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 60 : 45}>WIN%</StandingsHeaderCell>
      <StandingsHeaderCell width={isTablet ? 55 : 40}>PD</StandingsHeaderCell>
    </View>
  );

  const renderRow = (team, index) => {
    const isPlayoff = team.position <= 8;
    const highlightColor = isPlayoff ? BASKETBALL_COLOR : null;

    return (
      <StandingsRow 
        key={team.team?.id || index} 
        item={team} 
        index={index} 
        isEven={index % 2 === 0}
        highlightColor={highlightColor}
        onPress={(id) => navigation.navigate('TeamProfile', { teamId: id, sport: 'basketball' })}
      >
        <View style={styles.cellWidth(isTablet ? 40 : 32)}>
          <View style={[styles.rankBadge, highlightColor && styles.rankBadgeActive]}>
            <Text style={[styles.rankText, highlightColor && styles.rankTextActive]}>
              {team.position}
            </Text>
          </View>
        </View>

        <View style={styles.teamInfo}>
          <TeamLogo logo={team.team?.logo} sport="basketball" color={BASKETBALL_COLOR} size={28} />
          <Text style={styles.teamName} numberOfLines={1}>
            {team.team?.name || 'Unknown'}
          </Text>
        </View>

        <Text style={styles.statCell}>{team.games?.win?.total || 0}</Text>
        <Text style={styles.statCell}>{team.games?.lose?.total || 0}</Text>
        <Text style={styles.statCell}>{team.games?.win?.percentage || '0.00'}</Text>
        <Text style={styles.statCell}>{team.points?.difference || 0}</Text>
      </StandingsRow>
    );
  };

  return (
    <BaseStandings
      title={leagueName}
      subtitle={`Season ${season}`}
      sport="basketball"
      sportColor={BASKETBALL_COLOR}
      sportIcon="basketball"
      loading={loading}
      error={error}
      standings={currentTeams}
      onRetry={refresh}
      onBack={() => navigation.goBack()}
      renderHeader={renderHeader}
      renderRow={renderRow}
      legendData={[
        { label: 'Playoff Spot', color: BASKETBALL_COLOR },
      ]}
    >
      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewType === 'conference' && styles.toggleButtonActive]}
          onPress={() => { setViewType('conference'); setActiveGroup(0); }}
        >
          <Text style={[styles.toggleText, viewType === 'conference' && styles.toggleTextActive]}>Conference</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewType === 'division' && styles.toggleButtonActive]}
          onPress={() => { setViewType('division'); setActiveGroup(0); }}
        >
          <Text style={[styles.toggleText, viewType === 'division' && styles.toggleTextActive]}>Division</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {groupNames.length > 1 && (
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {groupNames.map((group, index) => (
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
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 152, 0, 0.3)',
  },
  cellWidth: (w) => ({
    width: w,
    alignItems: 'center',
  }),
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeActive: {
    backgroundColor: BASKETBALL_COLOR,
  },
  rankText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '700',
  },
  rankTextActive: {
    color: '#fff',
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
    width: isTablet ? 45 : 35, // Default for W/L
    textAlign: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
  },
  toggleText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: BASKETBALL_COLOR,
  },
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
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: BASKETBALL_COLOR,
  },
});

export default BasketballStandingsScreen;
