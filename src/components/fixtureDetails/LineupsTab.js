import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { TeamLogo, Card, SectionHeader, EmptyState } from '../common/CommonUI';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// Rating color helper
const getRatingColor = (rating) => {
  const r = parseFloat(rating);
  if (!r || r === 0) return null;
  if (r >= 7.5) return '#4CAF50';
  if (r >= 7.0) return '#8BC34A';
  if (r >= 6.5) return '#CDDC39';
  if (r >= 6.0) return '#FF9800';
  return '#F44336';
};

const LineupsTab = ({ lineups, sport = 'football', navigation }) => {
  const [expandedPlayer, setExpandedPlayer] = useState(null);

  // Normalize lineups data
  const normalizedLineups = React.useMemo(() => {
    if (!lineups) return [];
    
    if (Array.isArray(lineups)) {
      return lineups;
    }
    
    // Handle football/basketball/handball object format
    if (lineups.home || lineups.away) {
      const teams = [];
      if (lineups.home) {
        // Detect Basketball structure: home: { players: [...] } or home: [...]
        const players = lineups.home.players || (Array.isArray(lineups.home) ? lineups.home : []);
        
        teams.push({
          team: lineups.homeTeam || lineups.home.team || { name: 'Home' },
          startXI: players,
          substitutes: lineups.homeSubs || [],
          formation: lineups.homeFormation,
          teamStats: lineups.home.teamStats
        });
      }
      if (lineups.away) {
        // Detect Basketball structure: away: { players: [...] } or away: [...]
        const players = lineups.away.players || (Array.isArray(lineups.away) ? lineups.away : []);

        teams.push({
          team: lineups.awayTeam || lineups.away.team || { name: 'Away' },
          startXI: players,
          substitutes: lineups.awaySubs || [],
          formation: lineups.awayFormation,
          teamStats: lineups.away.teamStats
        });
      }
      return teams;
    }
    
    return [];
  }, [lineups]);

  if (!normalizedLineups || normalizedLineups.length === 0) {
    return <EmptyState title="Lineups not available" icon="account-group" />;
  }

  const getSportColor = () => {
    switch (sport) {
      case 'basketball': return '#ff9800';
      default: return '#00ffe7';
    }
  };

  const sportColor = getSportColor();

  const toggleExpand = (playerId) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  const renderStatMini = (icon, value, color = 'rgba(255,255,255,0.7)') => {
    if (!value || value === 0) return null;
    return (
      <View style={styles.miniStatBadge}>
        <Icon name={icon} size={10} color={color} />
        <Text style={[styles.miniStatText, { color }]}>{value}</Text>
      </View>
    );
  };

  const renderExpandedStats = (player) => {
    let statRows = [];
    
    if (sport === 'basketball') {
      statRows = [
        { label: 'Points', value: player.points, icon: 'scoreboard' },
        { label: 'Assists', value: player.assists, icon: 'hand-pointing-right' },
        { label: 'Rebounds (O/D)', value: player.rebounds ? `${player.rebounds.total} (${player.rebounds.offensive}/${player.rebounds.defensive})` : null, icon: 'basketball-hoop' },
        { label: 'Steals', value: player.steals, icon: 'hand-back-right' },
        { label: 'Blocks', value: player.blocks, icon: 'hand-front-right' },
        { label: 'Turnovers', value: player.turnovers, icon: 'alert-circle-outline' },
        { label: 'Fouls', value: player.fouls, icon: 'whistle' },
        { label: 'Plus/Minus', value: player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus, icon: 'plus-minus' },
        { label: 'FG (Accurate)', value: player.fieldGoals ? `${player.fieldGoals.made}/${player.fieldGoals.attempted} (${player.fieldGoals.percentage}%)` : null, icon: 'target' },
        { label: '3PT (Accurate)', value: player.threePointers ? `${player.threePointers.made}/${player.threePointers.attempted} (${player.threePointers.percentage}%)` : null, icon: 'shooting-stars' },
        { label: 'FT (Accurate)', value: player.freeThrows ? `${player.freeThrows.made}/${player.freeThrows.attempted} (${player.freeThrows.percentage}%)` : null, icon: 'bullseye' },
      ];
    } else {
      statRows = [
        { label: 'Minutes Played', value: player.minutesPlayed, icon: 'clock-outline' },
        { label: 'Shots (On Target)', value: player.shots ? `${player.shotsOnTarget}/${player.shots}` : null, icon: 'target' },
        { label: 'Passes (Accurate)', value: player.passes ? `${player.passesAccuracy}/${player.passes}` : null, icon: 'swap-horizontal' },
        { label: 'Key Passes', value: player.keyPasses, icon: 'key-variant' },
        { label: 'Dribbles (Success)', value: player.dribble ? `${player.dribbleSucc}/${player.dribble}` : null, icon: 'run' },
        { label: 'Tackles', value: player.tackles, icon: 'shoe-cleat' },
        { label: 'Interceptions', value: player.interceptions, icon: 'hand-back-left' },
        { label: 'Clearances', value: player.clearances, icon: 'shield-check' },
        { label: 'Duels (Won)', value: player.duels ? `${player.duelsWon}/${player.duels}` : null, icon: 'sword-cross' },
        { label: 'Fouls / Fouled', value: (player.fouls || player.wasFouled) ? `${player.fouls}/${player.wasFouled}` : null, icon: 'whistle' },
      ];

      // Add goalkeeper stats if applicable
      if (player.saves > 0 || player.punches > 0) {
        statRows.push(
          { label: 'Saves', value: player.saves, icon: 'hand-wave' },
          { label: 'Punches', value: player.punches, icon: 'boxing-glove' },
        );
      }
    }

    const validStats = statRows.filter(s => s.value && s.value !== 0 && s.value !== '0/0');

    if (validStats.length === 0) return null;

    return (
      <View style={styles.expandedContainer}>
        {validStats.map((stat, idx) => (
          <View key={idx} style={styles.expandedRow}>
            <View style={styles.expandedLeft}>
              <Icon name={stat.icon} size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.expandedLabel}>{stat.label}</Text>
            </View>
            <Text style={styles.expandedValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPlayer = (player, index) => {
    const playerId = player.id || player.player?.id || `p-${index}`;
    const isExpanded = expandedPlayer === playerId;
    const rating = player.rating;
    const ratingColor = getRatingColor(rating);
    const hasStats = player.minutesPlayed > 0;
    const playerLogo = player.logo || player.player?.logo;

    return (
      <View key={index}>
        <TouchableOpacity 
          style={styles.playerRow}
          onPress={() => navigation?.navigate('PlayerProfile', { playerId: playerId, playerName: player.name || player.player?.name })}
        >
          {/* Player image or number */}
          {playerLogo ? (
            <Image 
              source={{ uri: playerLogo }} 
              style={styles.playerImage}
            />
          ) : (
            <View style={[styles.playerNumber, { backgroundColor: `${sportColor}20` }]}>
              <Text style={[styles.playerNumberText, { color: sportColor }]}>
                {player.number || player.player?.number || '-'}
              </Text>
            </View>
          )}

          {/* Player info */}
          <View style={styles.playerInfo}>
            <View style={styles.playerNameRow}>
              <Text style={styles.playerName}>
                {player.name || player.player?.name}
              </Text>
              {player.captain && (
                <View style={styles.captainBadge}>
                  <Text style={styles.captainText}>C</Text>
                </View>
              )}
            </View>
            <View style={styles.playerMeta}>
              <Text style={styles.playerPos}>
                {player.pos || player.player?.pos || player.position}
              </Text>
              {player.minutesPlayed > 0 && (
                <Text style={styles.minutesText}>{player.minutesPlayed}'</Text>
              )}
            </View>
          </View>

          {/* Event badges */}
          <View style={styles.badgesRow}>
            {sport === 'basketball' ? (
              <>
                {renderStatMini('scoreboard', player.points, sportColor)}
                {renderStatMini('basketball-hoop', player.rebounds?.total, '#8BC34A')}
                {renderStatMini('hand-pointing-right', player.assists, '#2196F3')}
              </>
            ) : (
              <>
                {renderStatMini('soccer', player.goals, '#4CAF50')}
                {renderStatMini('shoe-cleat', player.assists, '#2196F3')}
                {renderStatMini('card', player.yellowCards, '#FFC107')}
                {renderStatMini('card', player.redCards, '#F44336')}
              </>
            )}
          </View>

          {/* Rating badge */}
          {ratingColor && (
            <View style={[styles.ratingBadge, { backgroundColor: ratingColor }]}>
              <Text style={styles.ratingText}>{parseFloat(rating).toFixed(1)}</Text>
            </View>
          )}

          {/* Expand stats button */}
          {hasStats ? (
            <TouchableOpacity 
              onPress={(e) => { e.stopPropagation?.(); toggleExpand(playerId); }}
              style={styles.expandBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={18} 
                color="rgba(255,255,255,0.3)" 
              />
            </TouchableOpacity>
          ) : (
            <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.15)" />
          )}
        </TouchableOpacity>

        {/* Expanded stats */}
        {isExpanded && renderExpandedStats(player)}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {normalizedLineups.map((teamLineup, index) => (
        <Card key={index} sportColor={sportColor}>
          <View style={styles.teamHeader}>
            <TeamLogo logo={teamLineup.team?.logo} sport={sport} size={32} color={sportColor} />
            <Text style={styles.teamName}>{teamLineup.team?.name || (index === 0 ? 'Home' : 'Away')}</Text>
            {teamLineup.formation && <Text style={styles.formation}>{teamLineup.formation}</Text>}
          </View>
          
          <SectionHeader title="Starting Eleven" icon="account-group" sportColor={sportColor} style={styles.subHeader} />
          {teamLineup.startXI?.map((p, i) => renderPlayer(p, i))}
          
          {teamLineup.substitutes && teamLineup.substitutes.length > 0 && (
            <>
              <SectionHeader title="Substitutes" icon="account-convert" sportColor={sportColor} style={styles.subHeader} />
              {teamLineup.substitutes.map((p, i) => renderPlayer(p, `sub-${i}`))}
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
    </View>
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
  playerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
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
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  captainBadge: {
    backgroundColor: '#FFC107',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  captainText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  playerPos: { 
    color: 'rgba(255,255,255,0.4)', 
    fontSize: 11, 
    fontWeight: '600', 
    textTransform: 'uppercase',
  },
  minutesText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Event badges
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 4,
  },
  miniStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  miniStatText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Rating
  ratingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  ratingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  // Expanded stats
  expandedContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  expandedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
  },
  expandedValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  expandBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rosterList: { marginTop: 8 },
});

export default LineupsTab;
