import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

/**
 * MomentumChart - Match momentum/trend visualization
 */
const MomentumChart = ({ trendData, homeTeam, awayTeam, sport = 'football' }) => {
  if (!trendData) return null;

  let allValues = [];
  let sectionMarkers = [];
  let per = trendData.per || (sport === 'basketball' ? 12 : 45);
  let sections = [];

  // Handle flat momentum array (Basketball/Generic)
  if (trendData.momentum && Array.isArray(trendData.momentum)) {
    allValues = trendData.momentum.map(m => Number(m.value) || 0);
    
    // Find markers where section changes
    trendData.momentum.forEach((m, i) => {
      if (i > 0 && m.section !== trendData.momentum[i-1].section) {
        sectionMarkers.push(i - 1);
      }
    });

    let currentSection = [];
    trendData.momentum.forEach(m => {
      if (currentSection.length > 0 && m.section !== currentSection[0].section) {
        sections.push(currentSection.map(p => Number(p.value) || 0));
        currentSection = [m];
      } else {
        currentSection.push(m);
      }
    });
    if (currentSection.length > 0) sections.push(currentSection.map(p => Number(p.value) || 0));
  } 
  // Handle legacy halves array (Football)
  else if (trendData.halves && Array.isArray(trendData.halves)) {
    sections = trendData.halves;
    sections.forEach((half, halfIndex) => {
      if (!Array.isArray(half)) return;
      half.forEach(val => allValues.push(Number(val) || 0));
      if (halfIndex < sections.length - 1) {
        sectionMarkers.push(allValues.length - 1);
      }
    });
  }

  if (allValues.length === 0) return null;

  const maxAbsOriginal = Math.max(...allValues.map(v => Math.abs(v)), 1);
  const maxAbs = maxAbsOriginal || 1;
  
  const chartPadding = isTablet ? 16 : 12;
  const chartWidth = SCREEN_WIDTH - (isTablet ? 80 : 64) - chartPadding * 2;
  const barAreaHeight = isTablet ? 70 : 55;
  const totalBars = allValues.length;
  const barWidth = Math.max(1.2, (chartWidth / totalBars) - 0.5);

  const timeLabels = [];
  let minuteOffset = 0;
  sections.forEach((section, si) => {
    const secLen = section.length;
    [0, Math.floor(secLen * 0.5), secLen - 1].forEach(idx => {
      if (idx >= 0 && idx < secLen) {
        const globalIdx = minuteOffset + idx;
        const minute = (si * per) + idx + 1;
        if (!timeLabels.find(t => t.index === globalIdx)) {
          timeLabels.push({ index: globalIdx, label: `${minute}'` });
        }
      }
    });
    minuteOffset += secLen;
  });

  const getMarkerLabel = (index) => {
    if (sport === 'basketball') return `Q${index + 1}`;
    return index === 0 ? 'HT' : `P${index + 1}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#00ffe7', '#00d2ff']}
          style={styles.headerIcon}
        >
          <Icon name="chart-line-variant" size={isTablet ? 18 : 16} color="#fff" />
        </LinearGradient>
        <Text style={styles.headerTitle}>{sport === 'basketball' ? 'Game Momentum' : 'Match Momentum'}</Text>
      </View>

      <View style={styles.teamLabels}>
        <View style={styles.teamRow}>
          <View style={[styles.teamDot, { backgroundColor: '#00ffe7' }]} />
          <Text style={styles.teamName} numberOfLines={1}>
            {typeof homeTeam === 'object' ? homeTeam.name : (homeTeam || 'Home')}
          </Text>
        </View>
        <View style={styles.teamRow}>
          <View style={[styles.teamDot, { backgroundColor: '#ff9800' }]} />
          <Text style={styles.teamName} numberOfLines={1}>
            {typeof awayTeam === 'object' ? awayTeam.name : (awayTeam || 'Away')}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabels}>
          <Text style={styles.yLabel}>▲</Text>
          <Text style={styles.yLabelCenter}>0</Text>
          <Text style={styles.yLabel}>▼</Text>
        </View>

        <View style={styles.chartArea}>
          {/* Top (Home) area */}
          <View style={[styles.halfArea, { height: barAreaHeight }]}>
            <View style={styles.barsRow}>
              {allValues.map((val, i) => {
                const isPositive = val > 0;
                const hFactor = Math.abs(val) / maxAbs;
                const barHeight = isPositive ? hFactor * barAreaHeight : 0;
                const isSectionEnd = sectionMarkers.includes(i);
                
                return (
                  <View key={`top-${i}`} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: barWidth,
                          height: Math.max(isPositive ? 1.5 : 0, barHeight),
                          backgroundColor: isPositive 
                            ? (hFactor > 0.5 ? '#00ffe7' : '#00ffe7bb')
                            : 'transparent',
                          borderRadius: barWidth > 2 ? 1 : 0,
                        },
                      ]}
                    />
                    {isSectionEnd && <View style={styles.halfDividerTop} />}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.centerLine}>
            {sectionMarkers.map((markerIdx, i) => (
              <View
                key={`sec-${i}`}
                style={[
                  styles.htMarker,
                  {
                    left: `${(markerIdx / (totalBars - 1)) * 100}%`,
                  },
                ]}
              >
                <Text style={styles.htText}>{getMarkerLabel(i)}</Text>
              </View>
            ))}
            <View style={[styles.htMarker, { right: 0, left: undefined }]}>
              <Text style={styles.htText}>FT</Text>
            </View>
          </View>

          {/* Bottom (Away) area */}
          <View style={[styles.halfArea, { height: barAreaHeight }]}>
            <View style={[styles.barsRow, styles.barsRowBottom]}>
              {allValues.map((val, i) => {
                const isNegative = val < 0;
                const hFactor = Math.abs(val) / maxAbs;
                const barHeight = isNegative ? hFactor * barAreaHeight : 0;
                const isSectionEnd = sectionMarkers.includes(i);
                
                return (
                  <View key={`bot-${i}`} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: barWidth,
                          height: Math.max(isNegative ? 1.5 : 0, barHeight),
                          backgroundColor: isNegative 
                            ? (hFactor > 0.5 ? '#ff9800' : '#ff9800bb')
                            : 'transparent',
                          borderRadius: barWidth > 2 ? 1 : 0,
                        },
                      ]}
                    />
                    {isSectionEnd && <View style={styles.halfDividerBottom} />}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.timeAxis}>
        {timeLabels.map((t, i) => (
          <Text
            key={i}
            style={[
              styles.timeLabel,
              {
                left: `${(t.index / (totalBars - 1)) * 100}%`,
              },
            ]}
          >
            {t.label}
          </Text>
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
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
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
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '800',
  },
  teamLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  teamName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 120,
  },
  chartContainer: {
    flexDirection: 'row',
  },
  yAxisLabels: {
    width: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  yLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
  },
  yLabelCenter: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '700',
  },
  chartArea: {
    flex: 1,
  },
  halfArea: {
    overflow: 'hidden',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingHorizontal: 1,
  },
  barsRowBottom: {
    alignItems: 'flex-start',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  bar: {
    minWidth: 1.5,
  },
  centerLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    position: 'relative',
  },
  halfDividerTop: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: 1,
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  halfDividerBottom: {
    position: 'absolute',
    right: -1,
    top: 0,
    width: 1,
    height: '200%',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  htMarker: {
    position: 'absolute',
    top: -8,
    transform: [{ translateX: -10 }],
  },
  htText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(29, 45, 44, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timeAxis: {
    height: 20,
    marginTop: 6,
    marginLeft: 20,
    position: 'relative',
  },
  timeLabel: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '600',
    transform: [{ translateX: -12 }],
  },
});

export default MomentumChart;
