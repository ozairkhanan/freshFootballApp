import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, SectionHeader, StatBar } from '../common/CommonUI';

const TennisStats = ({ statistics, homeTeam, awayTeam, sportColor }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(0); // 0 = Match, 1, 2, ... = Sets

  if (!statistics) return null;

  const periods = Object.keys(statistics.periods || {}).sort((a, b) => parseInt(a) - parseInt(b));
  const currentStats = selectedPeriod === 0 ? statistics : (statistics.periods?.[selectedPeriod] || {});

  const renderStat = (label, statKey, isPercentage = false) => {
    const statData = currentStats[statKey];
    if (!statData) return null;

    const homeVal = parseFloat(statData.home) || 0;
    const awayVal = parseFloat(statData.away) || 0;
    const total = homeVal + awayVal;
    const ratio = total > 0 ? homeVal / total : 0.5;

    let homeDisplay = statData.home;
    let awayDisplay = statData.away;

    if (isPercentage) {
      homeDisplay = `${(homeVal * 100).toFixed(0)}%`;
      awayDisplay = `${(awayVal * 100).toFixed(0)}%`;
    }

    return (
      <StatBar
        key={statKey}
        label={label}
        homeValue={homeDisplay}
        awayValue={awayDisplay}
        homeRatio={ratio}
        color={sportColor}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      {periods.length > 1 && (
        <View style={styles.periodSelectorOuter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodSelector}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedPeriod(parseInt(p))}
                style={[
                  styles.periodTab,
                  selectedPeriod === parseInt(p) && { borderColor: sportColor }
                ]}
              >
                <Text style={[
                  styles.periodTabText,
                  selectedPeriod === parseInt(p) && { color: sportColor }
                ]}>
                  {p === '0' ? 'MATCH' : `SET ${p}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <Card sportColor={sportColor}>
        <SectionHeader title={selectedPeriod === 0 ? "Match Statistics" : `Set ${selectedPeriod} Statistics`} icon="chart-bar" sportColor={sportColor} />
        
        <View style={styles.statsList}>
          <Text style={styles.sectionTitle}>SERVICE</Text>
          {renderStat('Aces', 'aces')}
          {renderStat('Double Faults', 'doubleFaults')}
          {renderStat('1st Serve In %', 'firstServePct', true)}
          {renderStat('1st Serve Points Won', 'firstServePointsWon')}
          {renderStat('2nd Serve In %', 'secondServePct', true)}
          {renderStat('2nd Serve Points Won', 'secondServePointsWon')}
          {renderStat('Service Points Won %', 'servicePointsPct', true)}
          
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>BREAK POINTS</Text>
          {renderStat('BP Saved %', 'breakPointsSavedPct', true)}
          {renderStat('BP Converted %', 'breakPointsPct', true)}
          {renderStat('BP Converted Count', 'breakPointsConverted')}
          
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>OVERALL</Text>
          {renderStat('Total Points Won', 'totalPointsWon')}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  periodSelectorOuter: {
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodTabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  statsList: {
    marginTop: 8,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
});

export default TennisStats;
