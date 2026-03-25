import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, SectionHeader } from '../common/CommonUI';

const TennisTimeline = ({ timeline, sportColor }) => {
  const [expandedRounds, setExpandedRounds] = useState({});

  if (!timeline || timeline.length === 0) return null;

  const toggleRound = (setId, roundId) => {
    const key = `${setId}-${roundId}`;
    setExpandedRounds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderPoint = (p, idx, isLast) => (
    <View key={idx} style={[styles.pointRow, isLast && { borderBottomWidth: 0 }]}>
      <Text style={styles.pointIdx}>{idx + 1}</Text>
      <View style={styles.pointScores}>
        <Text style={[styles.pointValue, p.home === 'AD' && styles.advText]}>{p.home}</Text>
        <Text style={styles.pointDivider}>-</Text>
        <Text style={[styles.pointValue, p.away === 'AD' && styles.advText]}>{p.away}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {timeline.map((setItem, setIdx) => (
        <Card key={setIdx} sportColor={sportColor}>
          <SectionHeader title={`Set ${setItem.set}`} icon="tennis-court" sportColor={sportColor} />
          <View style={styles.roundsList}>
            {(setItem.rounds || []).map((roundItem, rIdx) => {
              const key = `${setItem.set}-${roundItem.round}`;
              const isExpanded = expandedRounds[key];
              const prevScore = rIdx > 0 ? setItem.rounds[rIdx - 1]?.score : { home: 0, away: 0 };
              const wonByHome = roundItem.score && roundItem.score.home > (prevScore?.home || 0);
              const wonByAway = roundItem.score && roundItem.score.away > (prevScore?.away || 0);
              const isBreak = roundItem.score && (
                (roundItem.score.serve === 1 && wonByAway) || 
                (roundItem.score.serve === 2 && wonByHome)
              );

              return (
                <View key={rIdx} style={styles.roundItem}>
                  <TouchableOpacity
                    onPress={() => toggleRound(setItem.set, roundItem.round)}
                    style={styles.roundHeader}
                    activeOpacity={0.7}
                  >
                    <View style={styles.roundInfo}>
                      <View style={[styles.roundBadge, { backgroundColor: sportColor + '20' }]}>
                        <Text style={[styles.roundNumber, { color: sportColor }]}>G{roundItem.round}</Text>
                      </View>
                      <View style={styles.gameScoreBox}>
                        <View style={styles.scoreRow}>
                          <Text style={styles.gameScoreText}>
                            {roundItem.score ? `${roundItem.score.home} - ${roundItem.score.away}` : 'Ongoing'}
                          </Text>
                          {isBreak && (
                            <View style={styles.breakBadge}>
                              <Text style={styles.breakText}>BREAK</Text>
                            </View>
                          )}
                        </View>
                        {roundItem.score?.serve && (
                          <View style={styles.serverInfo}>
                            <Icon name="tennis-ball" size={10} color={sportColor} />
                            <Text style={styles.serverLabel}>{roundItem.score.serve === 1 ? 'Home' : 'Away'} Serving</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Icon 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color="rgba(255,255,255,0.3)" 
                    />
                  </TouchableOpacity>

                  {isExpanded && roundItem.points && roundItem.points.length > 0 && (
                    <View style={styles.pointsContainer}>
                      <View style={styles.pointsHeader}>
                        <Text style={styles.pointsHeaderText}>Points Progression</Text>
                      </View>
                      {roundItem.points.map((p, pIdx) => renderPoint(p, pIdx, pIdx === roundItem.points.length - 1))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  roundsList: { marginTop: 8 },
  roundItem: {
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  roundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  roundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roundNumber: {
    fontSize: 12,
    fontWeight: '800',
  },
  gameScoreBox: {
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameScoreText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  breakBadge: {
    backgroundColor: '#ff1744',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 8,
  },
  breakText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  serverLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
  pointsContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pointsHeader: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    marginBottom: 4,
  },
  pointsHeaderText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  pointIdx: {
    width: 20,
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '700',
  },
  pointScores: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  pointDivider: {
    color: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
  advText: {
    color: '#A1FF0F',
    fontWeight: '900',
  },
});

export default TennisTimeline;
