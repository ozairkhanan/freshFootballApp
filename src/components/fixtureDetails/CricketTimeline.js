import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../common/CommonUI';

const CricketTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  const renderBall = (ball, idx) => {
    const [over, ballNum, score, extras, extraType] = ball;
    const isWicket = false; // We can check against wickets array if needed
    
    return (
      <View key={idx} style={styles.ballRow}>
        <View style={styles.overColumn}>
          <Text style={styles.overText}>{over}.{ballNum}</Text>
        </View>
        <View style={styles.resultColumn}>
          <View style={[
            styles.scoreCircle, 
            score === 4 && styles.fourCircle,
            score === 6 && styles.sixCircle,
            extraType && styles.extraCircle
          ]}>
            <Text style={styles.scoreText}>
              {extraType ? extraType : (score === 0 ? '.' : score)}
            </Text>
          </View>
        </View>
        <View style={styles.descColumn}>
          <Text style={styles.descText}>
            {extraType ? `Extra: ${extraType}` : (score > 0 ? `${score} runs` : 'No run')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {timeline.map((inning, iIdx) => (
        <Card key={iIdx} sportColor="#ffeb3b">
          <View style={styles.inningHeader}>
            <MIcon name="cricket" size={20} color="#ffeb3b" />
            <Text style={styles.inningTitle}>Inning {inning.inning} - Timeline</Text>
          </View>
          
          <View style={styles.timelineList}>
            {(inning.overs || []).slice().reverse().slice(0, 30).map((ball, bIdx) => renderBall(ball, bIdx))}
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },
  inningTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  timelineList: { gap: 12 },
  ballRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  overColumn: { width: 50 },
  overText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
  },
  resultColumn: { width: 40, alignItems: 'center' },
  scoreCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fourCircle: { backgroundColor: '#2196f3' },
  sixCircle: { backgroundColor: '#4caf50' },
  extraCircle: { backgroundColor: '#ff9800' },
  scoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  descColumn: { flex: 1, paddingLeft: 10 },
  descText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
});

export default CricketTimeline;
