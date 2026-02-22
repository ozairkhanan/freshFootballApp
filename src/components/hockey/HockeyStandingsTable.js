import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const HockeyStandingsTable = ({ teams, onTeamPress }) => {
  if (!teams || teams.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No standings data</Text>
      </View>
    );
  }

  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.rankCell]}>#</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>Team</Text>
        <Text style={[styles.headerCell, styles.statCell]}>GP</Text>
        <Text style={[styles.headerCell, styles.statCell]}>W</Text>
        <Text style={[styles.headerCell, styles.statCell]}>L</Text>
        <Text style={[styles.headerCell, styles.statCell]}>OTL</Text>
        <Text style={[styles.headerCell, styles.statCell]}>PTS</Text>
      </View>

      {/* Rows */}
      {teams.map((team, index) => {
        const position = team.position || index + 1;
        
        // Data extraction (mapping typical API-Sports Hockey response)
        const played = team.games?.played || 0;
        const wins = team.games?.win?.total || 0;
        const losses = team.games?.lose?.total || 0;
        const otl = team.games?.lose?.overtime || 0;
        const points = team.points || 0;

        const teamName = team.team?.name || 'Unknown';
        const teamLogo = team.team?.logo;
        const teamId = team.team?.id;

        return (
          <TouchableOpacity
            key={teamId || index}
            style={styles.tableRow}
            onPress={() => onTeamPress && onTeamPress(teamId)}
            activeOpacity={0.7}
          >
            {/* Rank */}
            <View style={styles.rankCell}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{position}</Text>
              </View>
            </View>

            {/* Team */}
            <View style={styles.teamCell}>
              {teamLogo && (
                <Image source={{ uri: teamLogo }} style={styles.teamLogo} />
              )}
              <Text style={styles.teamName} numberOfLines={1}>
                {teamName}
              </Text>
            </View>

            {/* Stats */}
            <Text style={styles.statCell}>{String(played)}</Text>
            <Text style={styles.statCell}>{String(wins)}</Text>
            <Text style={styles.statCell}>{String(losses)}</Text>
            <Text style={styles.statCell}>{String(otl)}</Text>
            <View style={styles.ptsCell}>
              <Text style={styles.ptsText}>{String(points)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    backgroundColor: 'rgba(29, 45, 44, 0.7)',
    borderRadius: isTablet ? 20 : 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 188, 212, 0.2)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 188, 212, 0.15)',
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 20 : 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 188, 212, 0.3)',
  },
  headerCell: {
    color: '#00bcd4',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    paddingHorizontal: isTablet ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  rankCell: {
    width: isTablet ? 50 : 40,
    alignItems: 'center',
  },
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
  teamCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: isTablet ? 16 : 12,
  },
  teamLogo: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    marginRight: isTablet ? 12 : 10,
    borderRadius: isTablet ? 16 : 14,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    flex: 1,
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
    color: '#00bcd4',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '900',
  },
  emptyState: {
    padding: isTablet ? 40 : 32,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 16 : 14,
  },
});

export default HockeyStandingsTable;
