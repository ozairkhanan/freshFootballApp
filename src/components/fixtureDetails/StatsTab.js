import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, SectionHeader, StatBar, EmptyState } from '../common/CommonUI';

const StatsTab = ({ statistics, sport = 'football' }) => {
  if (!statistics || (Array.isArray(statistics) && statistics.length === 0)) {
    return <EmptyState title="No statistics available" icon="analytics-outline" />;
  }

  const getSportColor = () => {
    switch (sport) {
      case 'volleyball': return '#9c27b0';
      case 'basketball': return '#ff9800';
      case 'hockey': return '#00bcd4';
      case 'handball': return '#4caf50';
      default: return '#00ffe7';
    }
  };

  const sportColor = getSportColor();

  const renderStatsList = (stats) => {
    if (!stats || !Array.isArray(stats)) return null;

    return stats.map((stat, index) => {
      const homeVal = parseFloat(stat.home) || 0;
      const awayVal = parseFloat(stat.away) || 0;
      const total = homeVal + awayVal;
      const ratio = total > 0 ? homeVal / total : 0.5;

      return (
        <StatBar
          key={index}
          label={stat.type || stat.name}
          homeValue={stat.home}
          awayValue={stat.away}
          homeRatio={ratio}
          color={sportColor}
        />
      );
    });
  };

  // Football stats structure: [{ team: { id, name }, statistics: [{ type, value }] }]
  const renderFootballStats = () => {
    if (!Array.isArray(statistics) || statistics.length < 2) return null;
    
    const homeStats = statistics[0].statistics;
    const awayStats = statistics[1].statistics;
    
    return homeStats.map((stat, index) => {
      const type = stat.type;
      const homeValStr = stat.value?.toString() || '0';
      const awayValStr = awayStats.find(s => s.type === type)?.value?.toString() || '0';
      
      const homeVal = parseFloat(homeValStr.replace('%', '')) || 0;
      const awayVal = parseFloat(awayValStr.replace('%', '')) || 0;
      const total = homeVal + awayVal;
      const ratio = total > 0 ? homeVal / total : 0.5;

      return (
        <StatBar
          key={index}
          label={type}
          homeValue={homeValStr}
          awayValue={awayValStr}
          homeRatio={ratio}
          color={sportColor}
        />
      );
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card sportColor={sportColor}>
        <SectionHeader title="Match Statistics" icon="chart-bar" sportColor={sportColor} />
        <View style={styles.statsWrapper}>
          {sport === 'football' ? renderFootballStats() : renderStatsList(statistics)}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  statsWrapper: { marginTop: 8 },
});

export default StatsTab;
