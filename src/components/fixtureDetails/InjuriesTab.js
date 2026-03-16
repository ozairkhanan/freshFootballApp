import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, SectionHeader, EmptyState, LoadingCard } from '../common/CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const InjuriesTab = ({ injuries, homeTeam, awayTeam, sport = 'football' }) => {
  if (injuries === undefined || injuries === null) {
    return (
      <View style={styles.container}>
        <LoadingCard sport={sport} />
        <Text style={styles.loadingText}>Loading injuries data...</Text>
      </View>
    );
  }

  const hasHomeInjuries = injuries.home && injuries.home.length > 0;
  const hasAwayInjuries = injuries.away && injuries.away.length > 0;

  if (!hasHomeInjuries && !hasAwayInjuries) {
    return (
      <EmptyState
        icon="hospital-box"
        title="No Injuries Reported"
        subtitle="Both teams have fully fit squads for this match"
      />
    );
  }

  const getInjuryIcon = (typeLabel) => {
    switch (typeLabel?.toLowerCase()) {
      case 'suspended':
        return { name: 'card-bulleted', color: '#ffeb3b' }; // Yellow/Red card conceptually
      case 'questionable':
        return { name: 'help-circle-outline', color: '#ff9800' };
      default:
        return { name: 'hospital-box', color: '#f44336' }; // Injured
    }
  };

  const renderPlayerList = (players, team) => {
    if (!players || players.length === 0) return null;

    return (
      <Card sportColor="#00ffe7" style={{ marginBottom: isTablet ? 20 : 16 }}>
        <SectionHeader 
          title={`${team?.name || 'Team'} Missing Players`} 
          icon="hospital-box-outline" 
          sportColor="#00ffe7" 
        />
        
        {players.map((player, index) => {
          const icon = getInjuryIcon(player.typeLabel);
          return (
            <View key={player.id || index} style={styles.playerRow}>
              {player.logo ? (
                <Image source={{ uri: player.logo }} style={styles.playerImage} />
              ) : (
                <View style={[styles.playerImageFallback, { backgroundColor: `${icon.color}20` }]}>
                  <Icon name="account" size={isTablet ? 20 : 18} color={icon.color} />
                </View>
              )}
              
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                
                <View style={styles.reasonRow}>
                  <Icon name={icon.name} size={14} color={icon.color} style={{ marginRight: 4 }} />
                  <Text style={[styles.reasonText, { color: icon.color }]}>
                    {player.typeLabel || 'Unavailable'}
                  </Text>
                  {player.reason ? (
                    <Text style={styles.reasonDetail}> • {player.reason}</Text>
                  ) : null}
                </View>
                
                {player.missedMatches > 0 && (
                  <Text style={styles.missedMatches}>
                    Missed {player.missedMatches} match{player.missedMatches !== 1 ? 'es' : ''}
                  </Text>
                )}
              </View>
              
              {player.position && (
                <View style={styles.positionBadge}>
                  <Text style={styles.positionBadgeText}>{player.position}</Text>
                </View>
              )}
            </View>
          );
        })}
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderPlayerList(injuries.home, homeTeam)}
      {renderPlayerList(injuries.away, awayTeam)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 14 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerImage: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  playerImageFallback: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: isTablet ? 16 : 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: isTablet ? 13 : 12,
    fontWeight: '600',
  },
  reasonDetail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
  },
  missedMatches: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  positionBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  positionBadgeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 12 : 11,
    fontWeight: '700',
  },
});

export default InjuriesTab;
