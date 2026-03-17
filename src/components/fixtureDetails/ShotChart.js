import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, gradients } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = (CHART_WIDTH * 40.5) / 50; 

const ShotChart = ({ shots, homeTeam, awayTeam }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'home', 'away'

  const filteredShots = useMemo(() => {
    if (filter === 'all') return shots;
    const type = filter === 'home' ? 1 : 2;
    return shots.filter(s => s.teamType === type);
  }, [shots, filter]);

  const stats = useMemo(() => {
    const calc = (list) => {
      const total = list.length;
      const made = list.filter(s => s.isHit).length;
      const pct = total > 0 ? ((made / total) * 100).toFixed(1) : '0.0';
      return { total, made, pct };
    };

    return {
      all: calc(shots),
      home: calc(shots.filter(s => s.teamType === 1)),
      away: calc(shots.filter(s => s.teamType === 2)),
    };
  }, [shots]);

  const renderShot = (shot, index) => {
    const left = (shot.x / 50) * CHART_WIDTH;
    const top = (shot.y / 40.5) * CHART_HEIGHT;

    return (
      <View
        key={`shot-${index}`}
        style={[
          styles.shotMarker,
          {
            left: left - 5,
            top: top - 5,
            backgroundColor: shot.isHit ? '#4ade80' : 'rgba(248, 113, 113, 0.4)',
            borderColor: shot.teamType === 1 ? '#00ffe7' : '#ff6b6b',
            borderWidth: 1.5,
            shadowColor: shot.isHit ? '#4ade80' : '#000',
            shadowOpacity: 0.5,
            elevation: 3,
          },
        ]}
      >
        {shot.isHit && <View style={styles.hitInner} />}
      </View>
    );
  };

  const FilterButton = ({ label, value, isActive }) => (
    <TouchableOpacity 
      style={[styles.filterBtn, isActive && styles.filterBtnActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterBtnText, isActive && styles.filterBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  if (!shots || shots.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Shot Map</Text>
          <Text style={styles.subtitle}>
            {stats[filter].made}/{stats[filter].total} FG ({stats[filter].pct}%)
          </Text>
        </View>
        <View style={styles.filterContainer}>
          <FilterButton label="All" value="all" isActive={filter === 'all'} />
          <FilterButton label="Home" value="home" isActive={filter === 'home'} />
          <FilterButton label="Away" value="away" isActive={filter === 'away'} />
        </View>
      </View>
      
      <View style={styles.courtContainer}>
        <LinearGradient
          colors={['#1a2a28', '#0d1a1a']}
          style={styles.courtBackground}
        >
          {/* Court markings */}
          <View style={styles.baseline} />
          <View style={styles.sidelineLeft} />
          <View style={styles.sidelineRight} />
          
          {/* Top Key / Paint */}
          <View style={styles.paint}>
            <View style={styles.restrictedArea} />
          </View>
          
          {/* Three point line */}
          <View style={styles.threePointLine} />
          
          {/* Hoop & Backboard */}
          <View style={styles.backboard} />
          <View style={styles.hoop} />
          
          {/* Render shots */}
          {filteredShots.map((shot, index) => renderShot(shot, index))}
        </LinearGradient>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendGroup}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#4ade80' }]} />
            <Text style={styles.legendText}>Made</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: 'rgba(248, 113, 113, 0.4)', borderColor: '#ff6b6b', borderWidth: 1 }]} />
            <Text style={styles.legendText}>Missed</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.legendGroup}>
          <View style={styles.legendItem}>
            <View style={[styles.ring, { borderColor: '#00ffe7' }]} />
            <Text style={styles.legendText} numberOfLines={1}>{homeTeam || 'Home'}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.ring, { borderColor: '#ff6b6b' }]} />
            <Text style={styles.legendText} numberOfLines={1}>{awayTeam || 'Away'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(29, 45, 44, 0.7)',
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#00ffe7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 2,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterBtnActive: {
    backgroundColor: '#00ffe7',
  },
  filterBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
  },
  filterBtnTextActive: {
    color: '#0d1a1a',
  },
  courtContainer: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },
  courtBackground: {
    flex: 1,
  },
  // MARKINGS
  baseline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  paint: {
    position: 'absolute',
    top: 0,
    left: CHART_WIDTH / 2 - (CHART_WIDTH * 0.2), // Roughly 16ft/50ft
    width: CHART_WIDTH * 0.4,
    height: CHART_HEIGHT * 0.45,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 0,
  },
  restrictedArea: {
    position: 'absolute',
    bottom: -30,
    left: '25%',
    width: '50%',
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  threePointLine: {
    position: 'absolute',
    top: - (CHART_WIDTH * 0.1),
    left: CHART_WIDTH / 2 - (CHART_WIDTH * 0.45),
    width: CHART_WIDTH * 0.9,
    height: CHART_WIDTH * 0.9,
    borderRadius: CHART_WIDTH * 0.45,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backboard: {
    position: 'absolute',
    top: 15,
    left: CHART_WIDTH / 2 - 20,
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  hoop: {
    position: 'absolute',
    top: 17,
    left: CHART_WIDTH / 2 - 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  shotMarker: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  hitInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  legendGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  ring: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginRight: 6,
  },
  legendText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
  },
});

export default ShotChart;
