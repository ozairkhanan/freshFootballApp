import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TeamLogo, Card, SectionHeader, EmptyState } from '../common/CommonUI';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LineupsTab = ({ lineups, sport = 'football', navigation }) => {
  if (!lineups || lineups.length === 0) {
    return <EmptyState title="Lineups not available" icon="account-group-outline" />;
  }

  const getSportColor = () => {
    switch (sport) {
      case 'basketball': return '#ff9800';
      default: return '#00ffe7';
    }
  };

  const sportColor = getSportColor();

  const renderPlayer = (player, index) => (
    <TouchableOpacity 
      key={index} 
      style={styles.playerRow}
      onPress={() => navigation.navigate('PlayerProfile', { playerId: player.id || player.player?.id, playerName: player.name || player.player?.name })}
    >
      <View style={[styles.playerNumber, { backgroundColor: `${sportColor}20` }]}>
        <Text style={[styles.playerNumberText, { color: sportColor }]}>{player.number || player.player?.number || '-'}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.name || player.player?.name}</Text>
        <Text style={styles.playerPos}>{player.pos || player.player?.pos || player.position}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.2)" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {lineups.map((teamLineup, index) => (
        <Card key={index} sportColor={sportColor}>
          <View style={styles.teamHeader}>
            <TeamLogo logo={teamLineup.team?.logo} sport={sport} size={32} color={sportColor} />
            <Text style={styles.teamName}>{teamLineup.team?.name}</Text>
            {teamLineup.formation && <Text style={styles.formation}>{teamLineup.formation}</Text>}
          </View>
          
          <SectionHeader title="Starting Eleven" icon="account-group" sportColor={sportColor} style={styles.subHeader} />
          {teamLineup.startXI?.map((p, i) => renderPlayer(p, i))}
          
          {teamLineup.substitutes && teamLineup.substitutes.length > 0 && (
            <>
              <SectionHeader title="Substitutes" icon="account-convert" sportColor={sportColor} style={styles.subHeader} />
              {teamLineup.substitutes.map((p, i) => renderPlayer(p, i))}
            </>
          )}

          {/* Basketball roster is often flat list of players */}
          {(!teamLineup.startXI && teamLineup.players) && (
            <View style={styles.rosterList}>
              {teamLineup.players.map((p, i) => renderPlayer(p, i))}
            </View>
          )}
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  teamName: { color: '#fff', fontSize: 18, fontWeight: '800', marginLeft: 12, flex: 1 },
  formation: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700' },
  subHeader: { marginBottom: 8, borderBottomWidth: 0, paddingBottom: 0, marginTop: 12 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerNumber: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerNumberText: { fontSize: 12, fontWeight: '800' },
  playerInfo: { flex: 1 },
  playerName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  playerPos: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  rosterList: { marginTop: 8 },
});

export default LineupsTab;
