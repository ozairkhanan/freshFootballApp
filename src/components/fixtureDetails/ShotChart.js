import React from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = (CHART_WIDTH * 40.5) / 50; // Maintain aspect ratio from API coordinates

const ShotChart = ({ shots, homeTeam, awayTeam }) => {
  if (!shots || shots.length === 0) return null;

  const renderShot = (shot, index) => {
    // Map 0-50 to 0-CHART_WIDTH
    const left = (shot.x / 50) * CHART_WIDTH;
    // Map 0-40.5 to 0-CHART_HEIGHT
    const top = (shot.y / 40.5) * CHART_HEIGHT;

    return (
      <View
        key={`shot-${index}`}
        style={[
          styles.shotMarker,
          {
            left: left - 4,
            top: top - 4,
            backgroundColor: shot.isHit ? '#4ade80' : '#f87171', // Green for hit, Red for miss
            borderColor: shot.teamType === 1 ? '#2dd4bf' : '#fb923c', // Home Teal border, Away Orange border
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shot Chart</Text>
      
      <View style={styles.courtContainer}>
        {/* Simple visual court representation or ImageBackground */}
        <View style={styles.court}>
          {/* Basket Area (Top Centerish based on typical data origin) */}
          <View style={styles.hoop} />
          <View style={styles.paint} />
          <View style={styles.threePointLine} />
          
          {/* Render all shots */}
          {shots.map((shot, index) => renderShot(shot, index))}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#4ade80' }]} />
          <Text style={styles.legendText}>Made</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#f87171' }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#2dd4bf', borderWidth: 1 }]} />
          <Text style={styles.legendText}>{homeTeam || 'Home'}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#fb923c', borderWidth: 1 }]} />
          <Text style={styles.legendText}>{awayTeam || 'Away'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  courtContainer: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    backgroundColor: '#262626',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  court: {
    flex: 1,
  },
  hoop: {
    position: 'absolute',
    top: 20,
    left: CHART_WIDTH / 2 - 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  paint: {
    position: 'absolute',
    top: 0,
    left: CHART_WIDTH / 2 - 50,
    width: 100,
    height: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopWidth: 0,
  },
  threePointLine: {
    position: 'absolute',
    top: -50,
    left: CHART_WIDTH / 2 - 140,
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shotMarker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    zIndex: 10,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: '#aaa',
    fontSize: 12,
  },
});

export default ShotChart;
