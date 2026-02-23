import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UnifiedMatchCard from '../common/UnifiedMatchCard';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const H2HTab = ({ h2h, sport = 'football' }) => {
  if (!h2h || !h2h.response || h2h.response.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="tournament"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No head-to-head history available</Text>
      </View>
    );
  }

  const getSportColor = () => {
    switch (sport) {
      case 'volleyball':
        return '#9c27b0';
      case 'basketball':
        return '#ff9800';
      case 'hockey':
        return '#00bcd4';
      case 'mma':
        return '#f44336';
      case 'handball':
        return '#4caf50';
      default:
        return '#00ffe7';
    }
  };

  const sportColor = getSportColor();

  // ✅ Robust score normalization for ALL sports
  const normalizeGameForStats = game => {
    let homeS = null;
    let awayS = null;

    if (sport === 'football') {
      homeS =
        game.goals?.home ??
        game.fixture?.goals?.home ??
        game.score?.fulltime?.home ??
        null;
      awayS =
        game.goals?.away ??
        game.fixture?.goals?.away ??
        game.score?.fulltime?.away ??
        null;
    } else if (sport === 'basketball') {
      // Basketball: scores.home.total can be null for not started games
      homeS =
        game.scores?.home && typeof game.scores.home === 'object'
          ? game.scores.home.total ?? null
          : game.scores?.home ?? null;
      awayS =
        game.scores?.away && typeof game.scores.away === 'object'
          ? game.scores.away.total ?? null
          : game.scores?.away ?? null;
    } else if (
      sport === 'volleyball' ||
      sport === 'hockey' ||
      sport === 'handball'
    ) {
      // These often have direct numbers or period objects
      homeS =
        game.scores?.home && typeof game.scores.home === 'object'
          ? game.scores.home.total ?? null
          : game.scores?.home ?? null;
      awayS =
        game.scores?.away && typeof game.scores.away === 'object'
          ? game.scores.away.total ?? null
          : game.scores?.away ?? null;
    } else {
      homeS = game.scores?.home ?? game.goals?.home ?? null;
      awayS = game.scores?.away ?? game.goals?.away ?? null;
    }

    return {
      homeTeamId: game.teams?.home?.id,
      awayTeamId: game.teams?.away?.id,
      homeScore: homeS,
      awayScore: awayS,
      status: game.status?.short || game.fixture?.status?.short,
    };
  };

  const games = h2h.response; // Raw games

  if (!games || games.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="tournament"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No head-to-head history available</Text>
      </View>
    );
  }

  // Calculate stats - use first game to identify teams
  const team1Id = games[0]?.teams?.home?.id;
  const team2Id = games[0]?.teams?.away?.id;
  const team1 = games[0]?.teams?.home;
  const team2 = games[0]?.teams?.away;

  if (!team1Id || !team2Id) {
    console.warn('⚠️ H2H: Missing team IDs in first game', games[0]);
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Invalid head-to-head data</Text>
      </View>
    );
  }

  let team1Wins = 0;
  let team2Wins = 0;
  let draws = 0;
  let skippedCount = 0;

  games.forEach((game, index) => {
    const stats = normalizeGameForStats(game);

    // Skip games with null/undefined scores (game not finished or cancelled)
    // This is more reliable than checking status codes
    if (stats.homeScore == null || stats.awayScore == null) {
      skippedCount++;
      return;
    }

    // Additional check: skip explicitly cancelled/postponed games even if they have scores
    const status = stats.status;
    if (status === 'CANC' || status === 'POST' || status === 'SUSP') {
      skippedCount++;
      return;
    }

    // Convert IDs to numbers for comparison (API might return strings or numbers)
    const homeId = stats.homeTeamId != null ? Number(stats.homeTeamId) : null;
    const awayId = stats.awayTeamId != null ? Number(stats.awayTeamId) : null;
    const t1Id = team1Id != null ? Number(team1Id) : null;
    const t2Id = team2Id != null ? Number(team2Id) : null;

    // Skip if IDs are invalid (null, undefined, or NaN)
    if (
      homeId == null ||
      awayId == null ||
      t1Id == null ||
      t2Id == null ||
      isNaN(homeId) ||
      isNaN(awayId) ||
      isNaN(t1Id) ||
      isNaN(t2Id)
    ) {
      skippedCount++;
      return;
    }

    // Determine which team is team1 in this game (team1 can be home or away)
    const isTeam1Home = homeId === t1Id;

    // Get scores for team1 and team2 based on who is home/away
    const t1Score = isTeam1Home ? stats.homeScore : stats.awayScore;
    const t2Score = isTeam1Home ? stats.awayScore : stats.homeScore;

    // Count wins/draws (only for finished games with valid scores)
    if (t1Score > t2Score) {
      team1Wins++;
    } else if (t2Score > t1Score) {
      team2Wins++;
    } else {
      draws++;
    }
  });

  // If no finished games, show a message
  if (team1Wins === 0 && team2Wins === 0 && draws === 0 && games.length > 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="calendar-clock"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>
          No completed head-to-head matches found
        </Text>
        <Text
          style={[
            styles.emptyText,
            { fontSize: 14, marginTop: 8, opacity: 0.6 },
          ]}
        >
          All matches are upcoming or not started
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Card - Keep this as is or style it slightly? keeping custom for now as it makes sense for H2H */}
      <View style={[styles.summaryCard, { borderColor: `${sportColor}33` }]}>
        <View style={styles.summaryHeader}>
          <Icon name="chart-bar" size={isTablet ? 28 : 24} color={sportColor} />
          <Text style={styles.summaryTitle}>Head to Head Summary</Text>
        </View>

        <View style={styles.teamsRow}>
          {/* Team 1 */}
          <View style={styles.teamSummary}>
            {team1?.logo && (
              <Image source={{ uri: team1.logo }} style={styles.teamLogo} />
            )}
            <Text style={styles.teamName} numberOfLines={2}>
              {team1?.name}
            </Text>
            <Text style={[styles.winCount, { color: sportColor }]}>
              {team1Wins}
            </Text>
            <Text style={styles.winLabel}>Wins</Text>
          </View>

          {/* Draws */}
          <View style={styles.drawsSummary}>
            <Text style={styles.drawsCount}>{draws}</Text>
            <Text style={styles.drawsLabel}>Draws</Text>
          </View>

          {/* Team 2 */}
          <View style={styles.teamSummary}>
            {team2?.logo && (
              <Image source={{ uri: team2.logo }} style={styles.teamLogo} />
            )}
            <Text style={styles.teamName} numberOfLines={2}>
              {team2?.name}
            </Text>
            <Text style={[styles.winCount, { color: sportColor }]}>
              {team2Wins}
            </Text>
            <Text style={styles.winLabel}>Wins</Text>
          </View>
        </View>
      </View>

      {/* Match History using MODERN MATCH CARDS */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Icon name="history" size={isTablet ? 24 : 20} color={sportColor} />
          <Text style={styles.historyTitle}>Match History</Text>
        </View>

        {games.map((game, index) => (
          <UnifiedMatchCard
            key={game.fixture?.id || game.id || index}
            fixture={game}
            sport={sport}
            onPress={() => {}} // H2H items usually not clickable to details in generic views, or can handle nav if needed
            index={index}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 12,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamSummary: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  teamName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 80,
  },
  winCount: {
    fontSize: 28,
    fontWeight: '900',
  },
  winLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  drawsSummary: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  drawsCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 24,
    fontWeight: '900',
  },
  drawsLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },

  historySection: {
    paddingBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 8,
  },
  historyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },
});

export default H2HTab;
