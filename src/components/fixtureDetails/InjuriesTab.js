import React from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import EmptyState from './EmptyState';

const {width} = Dimensions.get('window');
const isTablet = width >= 768;

const InjuriesTab = ({injuries}) => {
  if (!injuries || injuries.length === 0) {
    return (
      <EmptyState
        icon="ambulance"
        title="No injuries reported"
        subtitle="All players available for selection"
      />
    );
  }

  const groupedInjuries = injuries.reduce((acc, injury) => {
    const teamName = injury.team.name;
    if (!acc[teamName]) {
      acc[teamName] = {
        team: injury.team,
        players: [],
      };
    }
    acc[teamName].players.push(injury.player);
    return acc;
  }, {});

  return (
    <View style={styles.tabContent}>
      {Object.values(groupedInjuries).map((teamInjuries, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            {teamInjuries.team.logo && (
              <Image source={{uri: teamInjuries.team.logo}} style={styles.injuryTeamLogo} />
            )}
            <Text style={styles.cardTitle}>
              {teamInjuries.team.name} ({teamInjuries.players.length})
            </Text>
          </View>

          {teamInjuries.players.map((player, idx) => (
            <View key={idx} style={styles.injuryCard}>
              {player.photo && (
                <Image source={{uri: player.photo}} style={styles.injuryPlayerPhoto} />
              )}
              <View style={styles.injuryDetails}>
                <Text style={styles.injuryPlayerName}>{player.name}</Text>
                <View style={styles.injuryReason}>
                  <Icon
                    name={player.type === 'Missing Fixture' ? 'close-circle-outline' : 'help-circle-outline'}
                    size={16}
                    color={player.type === 'Missing Fixture' ? '#ff1744' : '#ffc107'}
                  />
                  <Text
                    style={[
                      styles.injuryReasonText,
                      player.type === 'Missing Fixture' ? styles.missing : styles.questionable,
                    ]}>
                    {player.reason}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.injuryTypeBadge,
                  player.type === 'Missing Fixture' ? styles.missingBadge : styles.questionableBadge,
                ]}>
                <Text style={styles.injuryTypeText}>
                  {player.type === 'Missing Fixture' ? 'OUT' : '?'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
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
  injuryTeamLogo: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    marginRight: isTablet ? 12 : 8,
  },
  injuryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  injuryPlayerPhoto: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 28 : 24,
    marginRight: isTablet ? 16 : 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  injuryDetails: {flex: 1},
  injuryPlayerName: {
    color: '#fff',
    fontSize: isTablet ? 17 : 15,
    fontWeight: '700',
    marginBottom: isTablet ? 8 : 6,
  },
  injuryReason: {flexDirection: 'row', alignItems: 'center'},
  injuryReasonText: {
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
    marginLeft: isTablet ? 8 : 6,
  },
  missing: {color: '#ff1744'},
  questionable: {color: '#ffc107'},
  injuryTypeBadge: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingBadge: {backgroundColor: 'rgba(255, 23, 68, 0.2)'},
  questionableBadge: {backgroundColor: 'rgba(255, 193, 7, 0.2)'},
  injuryTypeText: {color: '#fff', fontSize: isTablet ? 16 : 14, fontWeight: '900'},
});

export default InjuriesTab;
