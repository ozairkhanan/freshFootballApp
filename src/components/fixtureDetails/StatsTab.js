import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const StatsTab = ({ statistics, sport = 'football' }) => {
  // ✅ FIXED: Better empty check
  if (!statistics || (Array.isArray(statistics) && statistics.length === 0)) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="analytics-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  // ✅ Route to sport-specific stats
  if (sport === 'hockey') {
    return <HockeyStats statistics={statistics} />;
  }

  if (sport === 'volleyball') {
    return <VolleyballStats statistics={statistics} />;
  }

  if (sport === 'basketball') {
    return <BasketballStats statistics={statistics} />;
  }

  return <FootballStats statistics={statistics} />;
};

// ✅ HOCKEY STATS - Period breakdown
const HockeyStats = ({ statistics }) => {
  // Hockey stats might be period scores array or object
  if (!statistics) {
    return (
      <View style={styles.emptyState}>
        <MIcon
          name="hockey-puck"
          size={isTablet ? 80 : 64}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>
          No statistics available for this game
        </Text>
      </View>
    );
  }

  // If statistics is an array of period scores
  const periodStats = Array.isArray(statistics) ? statistics : [];
  const teams = statistics.teams || null;
  const scores = statistics.scores || null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, { borderColor: 'rgba(0, 255, 231, 0.2)' }]}>
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#00ffe7', '#00d2ff']}
            style={styles.headerIconContainer}
          >
            <Icon name="stats-chart" size={isTablet ? 20 : 18} color="#fff" />
          </LinearGradient>
          <Text style={styles.cardTitle}>Live Statistics</Text>
        </View>

        {periodStats.length > 0 ? (
          <>
            {/* Period Breakdown */}
            <Text style={[styles.sectionTitle, { color: '#00bcd4' }]}>
              Period Breakdown
            </Text>

            {periodStats.map((period, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.statValue}>{period.home ?? '-'}</Text>
                <Text style={styles.statName}>
                  {period.period || `Period ${index + 1}`}
                </Text>
                <Text style={styles.statValue}>{period.away ?? '-'}</Text>
              </View>
            ))}

            {/* Total */}
            {scores && (
              <View style={[styles.statRow, styles.totalRow]}>
                <Text
                  style={[
                    styles.statValue,
                    { color: '#00bcd4', fontSize: isTablet ? 24 : 20 },
                  ]}
                >
                  {scores.home ?? 0}
                </Text>
                <Text style={[styles.statName, { fontWeight: '800' }]}>
                  Total Goals
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: '#00bcd4', fontSize: isTablet ? 24 : 20 },
                  ]}
                >
                  {scores.away ?? 0}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noStatsContainer}>
            <Icon
              name="information-circle-outline"
              size={40}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.noStatsText}>
              Detailed statistics not available for this game.
            </Text>
            <Text style={styles.noStatsSubtext}>
              Check the Overview tab for period scores.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ✅ VOLLEYBALL STATS
const VolleyballStats = ({ statistics }) => {
  if (!statistics || (Array.isArray(statistics) && statistics.length === 0)) {
    return (
      <View style={styles.emptyState}>
        <MIcon
          name="volleyball"
          size={isTablet ? 80 : 64}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  // Volleyball stats might be set scores
  const setStats = Array.isArray(statistics) ? statistics : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, { borderColor: 'rgba(156, 39, 176, 0.2)' }]}>
        <View style={styles.cardHeader}>
          <MIcon name="volleyball" size={isTablet ? 28 : 24} color="#9c27b0" />
          <Text style={styles.cardTitle}>Set Statistics</Text>
        </View>

        {setStats.length > 0 ? (
          setStats.map((set, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statValue}>{set.home ?? '-'}</Text>
              <Text style={styles.statName}>
                {set.set || `Set ${index + 1}`}
              </Text>
              <Text style={styles.statValue}>{set.away ?? '-'}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noStatsContainer}>
            <Text style={styles.noStatsText}>
              Check Overview tab for set scores
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ✅ BASKETBALL STATS
const BasketballStats = ({ statistics }) => {
  if (!statistics || (Array.isArray(statistics) && statistics.length === 0)) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="basketball"
          size={isTablet ? 80 : 64}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  // Basketball might have quarter scores
  const quarterStats = Array.isArray(statistics) ? statistics : [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, { borderColor: 'rgba(255, 152, 0, 0.2)' }]}>
        <View style={styles.cardHeader}>
          <Icon name="basketball" size={isTablet ? 28 : 24} color="#ff9800" />
          <Text style={styles.cardTitle}>Quarter Statistics</Text>
        </View>

        {quarterStats.length > 0 ? (
          quarterStats.map((quarter, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statValue}>{quarter.home ?? '-'}</Text>
              <Text style={styles.statName}>
                {quarter.quarter || `Q${index + 1}`}
              </Text>
              <Text style={styles.statValue}>{quarter.away ?? '-'}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noStatsContainer}>
            <Text style={styles.noStatsText}>
              Check Overview tab for quarter scores
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ✅ FOOTBALL STATS
const FootballStats = ({ statistics }) => {
  // ✅ FIXED: Safer check for football statistics
  if (!statistics || !Array.isArray(statistics) || statistics.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="football"
          size={isTablet ? 80 : 64}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  // ✅ FIXED: Check if teamStat has required properties
  const validStats = statistics.filter(
    teamStat => teamStat && teamStat.team && teamStat.statistics,
  );

  if (validStats.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="football"
          size={isTablet ? 80 : 64}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No statistics available</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {validStats.map((teamStat, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
          <MIcon name="chart-line" size={isTablet ? 28 : 24} color="#00ffe7" />
            <Text style={styles.cardTitle}>
              {teamStat.team?.name || 'Team'}
            </Text>
          </View>

          {teamStat.statistics &&
            teamStat.statistics.slice(0, 10).map((stat, idx) => (
              <View key={idx} style={styles.statRow}>
                <Text style={styles.statName}>{stat?.type || 'Unknown'}</Text>
                <Text style={styles.statValue}>{stat?.value ?? '-'}</Text>
              </View>
            ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  tabContent: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 80,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginTop: isTablet ? 24 : 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 24 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerIconContainer: {
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    borderRadius: isTablet ? 12 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: isTablet ? 16 : 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  totalRow: {
    marginTop: isTablet ? 12 : 10,
    paddingTop: isTablet ? 16 : 14,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 0,
  },
  statName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '800',
    minWidth: isTablet ? 50 : 40,
    textAlign: 'center',
  },
  noStatsContainer: {
    alignItems: 'center',
    paddingVertical: isTablet ? 32 : 24,
  },
  noStatsText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginTop: isTablet ? 16 : 12,
    textAlign: 'center',
  },
  noStatsSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: isTablet ? 14 : 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default StatsTab;
