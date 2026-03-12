import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// Pitch dimensions (aspect ratio ~1.5:1)
const PITCH_WIDTH = SCREEN_WIDTH - (isTablet ? 64 : 40);
const PITCH_HEIGHT = PITCH_WIDTH * 1.45;
const PLAYER_SIZE = isTablet ? 38 : 30;

// Position colors
const POS_COLORS = {
  G: '#FFC107', // Goalkeeper - yellow
  D: '#2196F3', // Defender - blue
  M: '#4CAF50', // Midfielder - green
  F: '#F44336', // Forward - red
};

// Get rating color
const getRatingColor = (rating) => {
  const r = parseFloat(rating);
  if (!r || r === 0) return null;
  if (r >= 7.5) return '#4CAF50';
  if (r >= 7.0) return '#8BC34A';
  if (r >= 6.5) return '#CDDC39';
  if (r >= 6.0) return '#FF9800';
  return '#F44336';
};

// Get incident icon for a player
const getIncidentIcons = (incidents) => {
  if (!incidents || incidents.length === 0) return [];
  const icons = [];
  incidents.forEach(inc => {
    switch (inc.type) {
      case 1: icons.push({ icon: 'soccer', color: '#4CAF50' }); break; // Goal
      case 3: icons.push({ icon: 'card', color: '#FFEB3B' }); break; // Yellow
      case 4: icons.push({ icon: 'card', color: '#F44336' }); break; // Red
      case 5: icons.push({ icon: 'card', color: '#FF5722' }); break; // Second yellow
      case 7: icons.push({ icon: 'soccer', color: '#FF9800' }); break; // Penalty goal
      case 9: icons.push({ icon: 'swap-horizontal', color: '#2196F3' }); break; // Sub
      case 10: icons.push({ icon: 'soccer', color: '#F44336' }); break; // Own goal
    }
  });
  // Deduplicate by icon+color, just count multiples
  return icons.slice(0, 3); // Max 3 icons per player
};

// Player dot component
const PlayerDot = ({ player, isAway, pitchWidth, pitchHeight }) => {
  if (player.x == null || player.y == null) return null;

  // Convert x/y (0-100) to pixel positions on the pitch
  // Home: origin top-left (x right, y down)
  // Away: origin bottom-right (x left, y up) — needs inversion
  let pxX, pxY;
  if (isAway) {
    pxX = ((100 - player.x) / 100) * (pitchWidth - PLAYER_SIZE);
    pxY = ((100 - player.y) / 100) * (pitchHeight / 2 - PLAYER_SIZE) + pitchHeight / 2;
  } else {
    pxX = (player.x / 100) * (pitchWidth - PLAYER_SIZE);
    pxY = (player.y / 100) * (pitchHeight / 2 - PLAYER_SIZE);
  }

  const posColor = POS_COLORS[player.position] || '#00ffe7';
  const ratingColor = getRatingColor(player.rating);
  const incidentIcons = getIncidentIcons(player.incidents);

  return (
    <View style={[styles.playerDot, { left: pxX, top: pxY }]}>
      {/* Main circle */}
      <View style={[styles.playerCircle, { borderColor: posColor }]}>
        <Text style={styles.shirtNumber}>
          {player.number || '-'}
        </Text>
        {/* Captain badge */}
        {player.captain && (
          <View style={styles.captainBadge}>
            <Text style={styles.captainText}>C</Text>
          </View>
        )}
      </View>

      {/* Rating badge */}
      {ratingColor && (
        <View style={[styles.ratingBadge, { backgroundColor: ratingColor }]}>
          <Text style={styles.ratingText}>{parseFloat(player.rating).toFixed(1)}</Text>
        </View>
      )}

      {/* Incident icons */}
      {incidentIcons.length > 0 && (
        <View style={styles.incidentRow}>
          {incidentIcons.map((ic, i) => (
            ic.icon === 'card' ? (
              <View key={i} style={[styles.miniCard, { backgroundColor: ic.color }]} />
            ) : (
              <Icon key={i} name={ic.icon} size={10} color={ic.color} />
            )
          ))}
        </View>
      )}

      {/* Player name */}
      <Text style={styles.playerName} numberOfLines={1}>
        {(player.name || '').split(' ').pop()}
      </Text>
    </View>
  );
};

const PitchFormation = ({ homePlayers, awayPlayers, homeFormation, awayFormation, homeTeam, awayTeam, confirmed }) => {
  const [activeTeam, setActiveTeam] = useState('both'); // 'home', 'away', 'both'

  const homeStarters = (homePlayers || []).filter(p => p.starter && p.x != null);
  const awayStarters = (awayPlayers || []).filter(p => p.starter && p.x != null);

  if (homeStarters.length === 0 && awayStarters.length === 0) {
    return null; // No formation data available
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={['#00ffe7', '#00d2ff']} style={styles.headerIcon}>
          <Icon name="soccer-field" size={isTablet ? 18 : 16} color="#fff" />
        </LinearGradient>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Formation</Text>
          {confirmed !== undefined && (
            <View style={[styles.confirmedBadge, confirmed ? styles.confirmedYes : styles.confirmedNo]}>
              <Text style={styles.confirmedText}>
                {confirmed ? 'Official' : 'Projected'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Formation labels */}
      <View style={styles.formationRow}>
        <View style={styles.formationTeam}>
          <View style={[styles.formationDot, { backgroundColor: '#00ffe7' }]} />
          <Text style={styles.formationLabel}>{homeTeam || 'Home'}</Text>
          {homeFormation ? <Text style={styles.formationValue}>{homeFormation}</Text> : null}
        </View>
        <View style={styles.formationTeam}>
          <View style={[styles.formationDot, { backgroundColor: '#ff9800' }]} />
          <Text style={styles.formationLabel}>{awayTeam || 'Away'}</Text>
          {awayFormation ? <Text style={styles.formationValue}>{awayFormation}</Text> : null}
        </View>
      </View>

      {/* Pitch */}
      <View style={[styles.pitch, { width: PITCH_WIDTH, height: PITCH_HEIGHT }]}>
        <LinearGradient
          colors={['#1a5e2a', '#2d8a47', '#1a5e2a']}
          style={styles.pitchGradient}
        >
          {/* Field markings */}
          {/* Half-way line */}
          <View style={styles.halfwayLine} />
          {/* Center circle */}
          <View style={styles.centerCircle} />
          <View style={styles.centerDot} />

          {/* Top penalty area */}
          <View style={styles.penaltyAreaTop} />
          <View style={styles.goalAreaTop} />
          {/* Bottom penalty area */}
          <View style={styles.penaltyAreaBottom} />
          <View style={styles.goalAreaBottom} />

          {/* Corner arcs (decorative) */}
          <View style={[styles.cornerArc, styles.cornerTL]} />
          <View style={[styles.cornerArc, styles.cornerTR]} />
          <View style={[styles.cornerArc, styles.cornerBL]} />
          <View style={[styles.cornerArc, styles.cornerBR]} />

          {/* Home players (top half) */}
          {(activeTeam === 'home' || activeTeam === 'both') &&
            homeStarters.map((p, i) => (
              <PlayerDot
                key={`h-${i}`}
                player={p}
                isAway={false}
                pitchWidth={PITCH_WIDTH}
                pitchHeight={PITCH_HEIGHT}
              />
            ))
          }

          {/* Away players (bottom half) */}
          {(activeTeam === 'away' || activeTeam === 'both') &&
            awayStarters.map((p, i) => (
              <PlayerDot
                key={`a-${i}`}
                player={p}
                isAway={true}
                pitchWidth={PITCH_WIDTH}
                pitchHeight={PITCH_HEIGHT}
              />
            ))
          }
        </LinearGradient>
      </View>

      {/* Toggle buttons */}
      <View style={styles.toggleRow}>
        {['both', 'home', 'away'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.toggleBtn, activeTeam === mode && styles.toggleActive]}
            onPress={() => setActiveTeam(mode)}
          >
            <Text style={[styles.toggleText, activeTeam === mode && styles.toggleTextActive]} numberOfLines={1}>
              {mode === 'both' ? 'Both' : mode === 'home' ? (homeTeam || 'Home') : (awayTeam || 'Away')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerIcon: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: isTablet ? 10 : 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '800',
    marginRight: 8,
  },
  confirmedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confirmedYes: { backgroundColor: 'rgba(76,175,80,0.15)' },
  confirmedNo: { backgroundColor: 'rgba(255,152,0,0.15)' },
  confirmedText: { fontSize: 10, fontWeight: '700', color: '#4CAF50' },
  formationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formationTeam: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  formationLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
    maxWidth: 100,
  },
  formationValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  // Pitch
  pitch: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
  pitchGradient: {
    flex: 1,
    position: 'relative',
  },
  // Field markings
  halfwayLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  centerCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: PITCH_WIDTH * 0.22,
    height: PITCH_WIDTH * 0.22,
    borderRadius: PITCH_WIDTH * 0.11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    transform: [
      { translateX: -(PITCH_WIDTH * 0.11) },
      { translateY: -(PITCH_WIDTH * 0.11) },
    ],
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  penaltyAreaTop: {
    position: 'absolute',
    top: 0,
    left: '20%',
    width: '60%',
    height: '14%',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  goalAreaTop: {
    position: 'absolute',
    top: 0,
    left: '33%',
    width: '34%',
    height: '6%',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  penaltyAreaBottom: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    width: '60%',
    height: '14%',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  goalAreaBottom: {
    position: 'absolute',
    bottom: 0,
    left: '33%',
    width: '34%',
    height: '6%',
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cornerArc: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cornerTL: { top: -7, left: -7, borderRadius: 0, borderBottomRightRadius: 14, borderTopWidth: 0, borderLeftWidth: 0 },
  cornerTR: { top: -7, right: -7, borderRadius: 0, borderBottomLeftRadius: 14, borderTopWidth: 0, borderRightWidth: 0 },
  cornerBL: { bottom: -7, left: -7, borderRadius: 0, borderTopRightRadius: 14, borderBottomWidth: 0, borderLeftWidth: 0 },
  cornerBR: { bottom: -7, right: -7, borderRadius: 0, borderTopLeftRadius: 14, borderBottomWidth: 0, borderRightWidth: 0 },
  // Player dot
  playerDot: {
    position: 'absolute',
    alignItems: 'center',
    width: PLAYER_SIZE + 16,
    transform: [{ translateX: -8 }],
  },
  playerCircle: {
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shirtNumber: {
    color: '#fff',
    fontSize: isTablet ? 13 : 11,
    fontWeight: '800',
  },
  captainBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captainText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
  },
  ratingBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 1,
  },
  ratingText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
  incidentRow: {
    flexDirection: 'row',
    marginTop: 1,
    gap: 2,
  },
  miniCard: {
    width: 6,
    height: 8,
    borderRadius: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: isTablet ? 9 : 7,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: PLAYER_SIZE + 20,
  },
  // Toggle
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: 'rgba(0,255,231,0.15)',
  },
  toggleText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#00ffe7',
    fontWeight: '700',
  },
});

export default PitchFormation;
