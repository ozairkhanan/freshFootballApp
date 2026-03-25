import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, SectionHeader } from '../common/CommonUI';

const CricketStats = ({ players, homeTeamId, awayTeamId, sportColor }) => {
  if (!players || players.length === 0) return null;

  const renderBattingTable = (batting, teamName) => {
    if (!batting || !batting.players || batting.players.length === 0) return null;

    return (
      <View style={styles.statSection}>
        <Text style={styles.teamNameHeader}>{teamName} - Batting</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Batter</Text>
          <Text style={styles.headerCell}>R</Text>
          <Text style={styles.headerCell}>B</Text>
          <Text style={styles.headerCell}>4s</Text>
          <Text style={styles.headerCell}>6s</Text>
          <Text style={styles.headerCell}>SR</Text>
        </View>
        {batting.players.map((p, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{p[0]}</Text>
            <Text style={[styles.cell, styles.bold]}>{p[1]}</Text>
            <Text style={styles.cell}>{p[2]}</Text>
            <Text style={styles.cell}>{p[3]}</Text>
            <Text style={styles.cell}>{p[4]}</Text>
            <Text style={styles.smallCell}>{p[5]}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderBowlingTable = (bowling, teamName) => {
    if (!bowling || !bowling.players || bowling.players.length === 0) return null;

    return (
      <View style={styles.statSection}>
        <Text style={styles.teamNameHeader}>{teamName} - Bowling</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Bowler</Text>
          <Text style={styles.headerCell}>O</Text>
          <Text style={styles.headerCell}>M</Text>
          <Text style={styles.headerCell}>R</Text>
          <Text style={styles.headerCell}>W</Text>
          <Text style={styles.headerCell}>Eco</Text>
        </View>
        {bowling.players.map((p, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{p[0]}</Text>
            <Text style={styles.cell}>{p[1]}</Text>
            <Text style={styles.cell}>{p[2]}</Text>
            <Text style={styles.cell}>{p[3]}</Text>
            <Text style={[styles.cell, styles.bold, { color: sportColor }]}>{p[4]}</Text>
            <Text style={styles.smallCell}>{p[5]}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {players.map((inningData, idx) => (
        <Card key={idx} sportColor={sportColor}>
          <SectionHeader 
            title={`Inning ${inningData.inning}`} 
            icon="circle-edit-outline" 
            sportColor={sportColor} 
          />
          {renderBattingTable(inningData.batting, inningData.batting?.team_id === homeTeamId ? 'Home' : 'Away')}
          <View style={{ height: 16 }} />
          {renderBowlingTable(inningData.bowling, inningData.bowling?.team_id === homeTeamId ? 'Home' : 'Away')}
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statSection: { marginTop: 12 },
  teamNameHeader: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  headerCell: {
    flex: 1,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  cell: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  bold: { fontWeight: '800' },
  smallCell: {
    flex: 1,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default CricketStats;
