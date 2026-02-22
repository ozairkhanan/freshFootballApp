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

const StandingsTable = ({ teams, onTeamPress }) => {
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
        <Text style={[styles.headerCell, styles.statCell]}>W</Text>
        <Text style={[styles.headerCell, styles.statCell]}>L</Text>
        <Text style={[styles.headerCell, styles.statCell]}>%</Text>
        <Text style={[styles.headerCell, styles.statCell]}>PTS</Text>
      </View>

      {/* Rows */}
      {teams.map((team, index) => {
        // ✅ FIXED: Match API response structure
        const position = team.position || index + 1;
        const isPlayoff = position <= 8;

        // ✅ FIXED: Correct data extraction from API response
        const wins = team.games?.win?.total || 0;
        const losses = team.games?.lose?.total || 0;
        const winPercentage = team.games?.win?.percentage || '0.000';

        // Calculate points difference (for/against)
        const pointsFor = team.points?.for || 0;
        const pointsAgainst = team.points?.against || 0;
        const pointsDiff = pointsFor - pointsAgainst;

        // Team info
        const teamName = team.team?.name || 'Unknown';
        const teamLogo = team.team?.logo;
        const teamId = team.team?.id;

        return (
          <TouchableOpacity
            key={teamId || index}
            style={[styles.tableRow, isPlayoff && styles.playoffRow]}
            onPress={() => onTeamPress && onTeamPress(teamId)}
            activeOpacity={0.7}
          >
            {/* Rank */}
            <View style={styles.rankCell}>
              <View
                style={[styles.rankBadge, isPlayoff && styles.playoffBadge]}
              >
                <Text
                  style={[styles.rankText, isPlayoff && styles.playoffText]}
                >
                  {position}
                </Text>
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
            <Text style={styles.statCell}>{String(wins)}</Text>
            <Text style={styles.statCell}>{String(losses)}</Text>
            <Text style={styles.statCell}>{winPercentage}</Text>
            <Text
              style={[
                styles.statCell,
                pointsDiff > 0
                  ? styles.positive
                  : pointsDiff < 0
                  ? styles.negative
                  : null,
              ]}
            >
              {pointsDiff > 0 ? '+' : ''}
              {pointsDiff}
            </Text>
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
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 20 : 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 152, 0, 0.3)',
  },
  headerCell: {
    color: '#ff9800',
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
  playoffRow: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
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
  playoffBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  rankText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '800',
  },
  playoffText: {
    color: '#4caf50',
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
    width: isTablet ? 45 : 38,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  positive: {
    color: '#4caf50',
  },
  negative: {
    color: '#f44336',
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

export default StandingsTable;
