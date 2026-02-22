import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const LineupsTab = ({ lineups, sport = 'football', navigation }) => {
  if (!lineups || lineups.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="football-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>
          {sport === 'basketball'
            ? 'Roster not available'
            : 'Lineups not available'}
        </Text>
      </View>
    );
  }

  if (sport === 'basketball') {
    return renderBasketballRoster(lineups, navigation);
  }

  return renderFootballLineups(lineups, navigation);
};

// ✅ Basketball Roster - Simple name list
const renderBasketballRoster = (players, navigation) => {
  // Group by team
  const teams = {};
  players.forEach(player => {
    const teamName = player.team?.name || 'Unknown Team';
    if (!teams[teamName]) {
      teams[teamName] = {
        name: teamName,
        logo: player.team?.logo,
        players: [],
      };
    }
    teams[teamName].players.push(player);
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {Object.values(teams).map((team, teamIndex) => (
        <View key={teamIndex} style={styles.teamSection}>
          {/* Team Header */}
          <View style={styles.teamHeader}>
            {team.logo ? (
              <Image source={{ uri: team.logo }} style={styles.teamLogo} />
            ) : (
              <View style={styles.teamLogoPlaceholder}>
                <Icon
                  name="basketball-outline"
                  size={isTablet ? 24 : 20}
                  color="#ff9800"
                />
              </View>
            )}
            <Text style={styles.teamName}>{team.name}</Text>
            <View style={styles.playerCount}>
              <Text style={styles.playerCountText}>{team.players.length}</Text>
            </View>
          </View>

          {/* ✅ Simple Players List - Just names */}
          <View style={styles.playersList}>
            {team.players.map((player, index) => {
              const playerName =
                player.name || player.player?.name || 'Unknown';

              return (
                <View key={index} style={styles.playerCard}>
                  <View style={styles.playerIcon}>
                    <Icon
                      name="person-outline"
                      size={isTablet ? 18 : 16}
                      color="#ff9800"
                    />
                  </View>
                  <Text style={styles.playerName}>{playerName}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// Football Lineups
const renderFootballLineups = (lineups, navigation) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {lineups.map((team, teamIndex) => (
        <View key={teamIndex} style={styles.teamSection}>
          <View style={styles.teamHeader}>
            {team.team?.logo && (
              <Image source={{ uri: team.team.logo }} style={styles.teamLogo} />
            )}
            <View style={styles.teamHeaderInfo}>
              <Text style={styles.teamName}>{team.team?.name}</Text>
              {team.formation && (
                <Text style={styles.formation}>
                  Formation: {team.formation}
                </Text>
              )}
            </View>
          </View>

          {team.coach && (
            <TouchableOpacity 
              style={styles.coachRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CoachProfile', { coachId: team.coach.id, teamId: team.team?.id })}
            >
              <Image 
                source={{ uri: team.coach.photo || `https://media.api-sports.io/football/coachs/${team.coach.id}.png` }} 
                style={styles.coachPhoto} 
              />
              <Text style={styles.coachName}>{team.coach.name}</Text>
              <View style={{flex: 1}} />
              <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          )}

          {team.startXI && team.startXI.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Icon
                  name="football-outline"
                  size={isTablet ? 20 : 18}
                  color="#4caf50"
                />
                <Text style={styles.sectionTitle}>Starting XI</Text>
              </View>

              {team.startXI.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.playerRow}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('PlayerProfile', { 
                      playerId: item.player?.id, 
                      playerName: item.player?.name,
                      teamId: team.team?.id
                    })}
                  >
                    <View style={styles.playerPhotoContainer}>
                      <Image 
                        source={{ uri: `https://media.api-sports.io/football/players/${item.player?.id}.png` }} 
                        style={styles.playerPhotoMini} 
                      />
                      <View style={styles.playerNumberBadge}>
                        <Text style={styles.playerNumberBadgeText}>{item.player?.number || '-'}</Text>
                      </View>
                    </View>
                    <Text style={styles.playerNameFootball}>
                      {item.player?.name}
                    </Text>
                    <Text style={styles.playerPosition}>{item.player?.pos}</Text>
                    <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" style={{marginLeft: 8}} />
                  </TouchableOpacity>
              ))}
            </>
          )}

          {team.substitutes && team.substitutes.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Icon
                  name="swap-horizontal-outline"
                  size={isTablet ? 20 : 18}
                  color="#ff9800"
                />
                <Text style={styles.sectionTitle}>Substitutes</Text>
              </View>

              {team.substitutes.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.playerRow}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('PlayerProfile', { 
                      playerId: item.player?.id, 
                      playerName: item.player?.name,
                      teamId: team.team?.id
                    })}
                  >
                     <View style={[styles.playerPhotoContainer, styles.subPhotoContainer]}>
                      <Image 
                        source={{ uri: `https://media.api-sports.io/football/players/${item.player?.id}.png` }} 
                        style={styles.playerPhotoMini} 
                      />
                      <View style={[styles.playerNumberBadge, styles.subNumberBadge]}>
                        <Text style={styles.playerNumberBadgeText}>{item.player?.number || '-'}</Text>
                      </View>
                    </View>
                    <Text style={styles.playerNameFootball}>
                      {item.player?.name}
                    </Text>
                    <Text style={styles.playerPosition}>{item.player?.pos}</Text>
                    <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" style={{marginLeft: 8}} />
                  </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 80,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginTop: isTablet ? 24 : 20,
  },
  teamSection: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 24 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  teamLogo: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginRight: isTablet ? 16 : 12,
  },
  teamLogoPlaceholder: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginRight: isTablet ? 16 : 12,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamHeaderInfo: {
    flex: 1,
  },
  teamName: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '800',
    flex: 1,
  },
  formation: {
    color: '#00ffe7',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginTop: 4,
  },
  playerCount: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: isTablet ? 18 : 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerCountText: {
    color: '#ff9800',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '900',
  },
  playersList: {
    marginTop: isTablet ? 8 : 4,
  },
  // ✅ Simple player card - just icon + name
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 12 : 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerIcon: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: isTablet ? 18 : 16,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 14 : 12,
  },
  playerName: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    flex: 1,
  },
  // Football styles
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 8 : 6,
    paddingHorizontal: isTablet ? 12 : 10,
    backgroundColor: 'rgba(0, 255, 231, 0.1)',
    borderRadius: isTablet ? 12 : 10,
  },
  coachPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.3)',
  },
  coachPhotoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachName: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isTablet ? 16 : 12,
    marginBottom: isTablet ? 12 : 10,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '700',
    marginLeft: isTablet ? 10 : 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isTablet ? 10 : 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  playerPhotoContainer: {
    width: 44,
    height: 44,
    position: 'relative',
    marginRight: 12,
  },
  subPhotoContainer: {
    // Optional: add a slight tint or different border for subs if desired
  },
  playerPhotoMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.3)',
  },
  playerNumberBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00ffe7',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0d1a1a',
  },
  subNumberBadge: {
    backgroundColor: '#ff9800',
  },
  playerNumberBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  playerNameFootball: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    flex: 1,
  },
  playerPosition: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    width: isTablet ? 40 : 35,
    textAlign: 'right',
  },
});

export default LineupsTab;
