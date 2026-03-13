import React from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EmptyState from './EmptyState';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const PredictionTab = ({prediction}) => {
  if (prediction === undefined || prediction === null) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.card}>
           <Text style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 20 }}>
             Loading prediction analysis...
           </Text>
        </View>
      </View>
    );
  }

  if (!prediction || Object.keys(prediction).length === 0) {
    return (
      <EmptyState
        icon="crystal-ball"
        title="Prediction not available"
        subtitle="Predictions are available closer to kickoff"
      />
    );
  }

  const {predictions, teams} = prediction;
  const winnerTeam = predictions?.winner?.id
    ? teams[predictions.winner.id === teams.home.id ? 'home' : 'away']
    : null;

  return (
    <View style={styles.tabContent}>
      {winnerTeam && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="trophy-variant" size={isTablet ? 28 : 24} color="#00ffe7" />
            <Text style={styles.cardTitle}>Match Winner</Text>
          </View>

          <View style={styles.predictionWinner}>
            {winnerTeam.logo && (
              <Image source={{uri: winnerTeam.logo}} style={styles.predictionTeamLogo} />
            )}
            <Text style={styles.predictionTeamName}>{winnerTeam.name}</Text>
            <View style={styles.predictionProbability}>
              <Text style={styles.predictionProbabilityText}>{predictions.winner.comment}</Text>
            </View>
          </View>
        </View>
      )}

      {predictions?.win_or_draw && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="draw" size={isTablet ? 28 : 24} color="#00ffe7" />
            <Text style={styles.cardTitle}>Win or Draw</Text>
          </View>
          <Text style={styles.predictionText}>{predictions.win_or_draw ? 'Yes' : 'No'}</Text>
        </View>
      )}

      {predictions?.goals && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="soccer" size={isTablet ? 28 : 24} color="#00ffe7" />
            <Text style={styles.cardTitle}>Goals Prediction</Text>
          </View>

          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Home Goals</Text>
            <Text style={styles.predictionValue}>{predictions.goals.home}</Text>
          </View>

          <View style={styles.predictionRow}>
            <Text style={styles.predictionLabel}>Away Goals</Text>
            <Text style={styles.predictionValue}>{predictions.goals.away}</Text>
          </View>
        </View>
      )}

      {predictions?.under_over && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="chart-line-variant" size={isTablet ? 28 : 24} color="#00ffe7" />
            <Text style={styles.cardTitle}>Over / Under 2.5 Goals</Text>
          </View>
          <Text style={styles.predictionText}>{predictions.under_over}</Text>
        </View>
      )}

      {predictions?.advice && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="lightbulb-on" size={isTablet ? 28 : 24} color="#ffc107" />
            <Text style={styles.cardTitle}>AI Advice</Text>
          </View>
          <View style={styles.adviceBox}>
            <Text style={styles.adviceText}>{predictions.advice}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {padding: isTablet ? 24 : 16, paddingBottom: isTablet ? 40 : 32},
  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 24 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: isTablet ? 24 : 20},
  cardTitle: {
    color: '#fff',
    fontSize: isTablet ? 22 : 19,
    fontWeight: '800',
    marginLeft: isTablet ? 16 : 12,
  },
  predictionWinner: {alignItems: 'center', paddingVertical: isTablet ? 24 : 20},
  predictionTeamLogo: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    marginBottom: isTablet ? 20 : 16,
    borderRadius: isTablet ? 50 : 40,
  },
  predictionTeamName: {
    color: '#fff',
    fontSize: isTablet ? 26 : 22,
    fontWeight: '900',
    marginBottom: isTablet ? 16 : 12,
  },
  predictionProbability: {
    backgroundColor: 'rgba(0, 255, 231, 0.2)',
    paddingHorizontal: isTablet ? 28 : 24,
    paddingVertical: isTablet ? 14 : 12,
    borderRadius: isTablet ? 28 : 24,
  },
  predictionProbabilityText: {
    color: '#00ffe7',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '900',
  },
  predictionText: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: isTablet ? 20 : 16,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  predictionLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 17 : 15,
    fontWeight: '600',
  },
  predictionValue: {color: '#00ffe7', fontSize: isTablet ? 20 : 18, fontWeight: '900'},
  adviceBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 24 : 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  adviceText: {
    color: '#ffc107',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: isTablet ? 28 : 24,
  },
});

export default PredictionTab;
