import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const BasketballScoreDisplay = ({fixture}) => {
  const {teams, scores, periods} = fixture;

  // Get quarter scores
  const quarters = [];
  if (periods?.quarter_1 || scores?.home?.quarter_1) {
    quarters.push({
      label: 'Q1',
      home: periods?.quarter_1?.home || scores?.home?.quarter_1 || 0,
      away: periods?.quarter_1?.away || scores?.away?.quarter_1 || 0,
    });
  }
  if (periods?.quarter_2 || scores?.home?.quarter_2) {
    quarters.push({
      label: 'Q2',
      home: periods?.quarter_2?.home || scores?.home?.quarter_2 || 0,
      away: periods?.quarter_2?.away || scores?.away?.quarter_2 || 0,
    });
  }
  if (periods?.quarter_3 || scores?.home?.quarter_3) {
    quarters.push({
      label: 'Q3',
      home: periods?.quarter_3?.home || scores?.home?.quarter_3 || 0,
      away: periods?.quarter_3?.away || scores?.away?.quarter_3 || 0,
    });
  }
  if (periods?.quarter_4 || scores?.home?.quarter_4) {
    quarters.push({
      label: 'Q4',
      home: periods?.quarter_4?.home || scores?.home?.quarter_4 || 0,
      away: periods?.quarter_4?.away || scores?.away?.quarter_4 || 0,
    });
  }
  if (periods?.over_time || scores?.home?.over_time) {
    quarters.push({
      label: 'OT',
      home: periods?.over_time?.home || scores?.home?.over_time || 0,
      away: periods?.over_time?.away || scores?.away?.over_time || 0,
    });
  }

  // Get total scores
  const homeScore = (scores?.home && typeof scores.home === 'object') ? (scores.home.total ?? 0) : (scores?.home ?? 0);
  const awayScore = (scores?.away && typeof scores.away === 'object') ? (scores.away.total ?? 0) : (scores?.away ?? 0);

  return (
    <View style={styles.container}>
      {/* Team Names & Scores */}
      <View style={styles.teamsContainer}>
        {/* Home Team */}
        <View style={styles.teamRow}>
          <Text style={styles.teamName} numberOfLines={1}>
            {teams?.home?.name || 'Home'}
          </Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{homeScore}</Text>
          </View>
        </View>

        {/* Away Team */}
        <View style={styles.teamRow}>
          <Text style={styles.teamName} numberOfLines={1}>
            {teams?.away?.name || 'Away'}
          </Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{awayScore}</Text>
          </View>
        </View>
      </View>

      {/* Quarter Scores */}
      {quarters.length > 0 && (
        <View style={styles.quartersContainer}>
          <Text style={styles.quartersLabel}>Quarters:</Text>
          <View style={styles.quartersScores}>
            {quarters.map((quarter, index) => (
              <View key={index} style={styles.quarterScore}>
                <Text style={styles.quarterLabel}>{quarter.label}</Text>
                <Text style={styles.quarterValues}>
                  {quarter.home}-{quarter.away}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: isTablet ? 12 : 10,
  },
  teamsContainer: {
    marginBottom: isTablet ? 12 : 10,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isTablet ? 10 : 8,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 17 : 15,
    fontWeight: '700',
    flex: 1,
    marginRight: isTablet ? 12 : 10,
  },
  scoreBadge: {
    minWidth: isTablet ? 44 : 40,
    height: isTablet ? 44 : 40,
    borderRadius: isTablet ? 22 : 20,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 12 : 10,
  },
  scoreText: {
    color: '#ff9800',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '900',
  },
  quartersContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.05)',
    borderRadius: isTablet ? 12 : 10,
    padding: isTablet ? 12 : 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.2)',
  },
  quartersLabel: {
    color: '#ff9800',
    fontSize: isTablet ? 13 : 12,
    fontWeight: '700',
    marginBottom: isTablet ? 8 : 6,
  },
  quartersScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isTablet ? 8 : 6,
  },
  quarterScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: isTablet ? 8 : 6,
    paddingHorizontal: isTablet ? 10 : 8,
    paddingVertical: isTablet ? 6 : 5,
  },
  quarterLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: isTablet ? 12 : 11,
    fontWeight: '700',
    marginRight: isTablet ? 6 : 5,
  },
  quarterValues: {
    color: '#fff',
    fontSize: isTablet ? 13 : 12,
    fontWeight: '700',
  },
});

export default BasketballScoreDisplay;
