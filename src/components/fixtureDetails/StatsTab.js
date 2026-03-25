import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Card, SectionHeader, StatBar, EmptyState } from '../common/CommonUI';
import MomentumChart from './MomentumChart';
import ShotChart from './ShotChart';
import CricketStats from './CricketStats';
import TennisStats from './TennisStats';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const StatsTab = ({ statistics, trendData, homeTeam, awayTeam, sport = 'football', shootPoints, cricketPlayers }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const getSportColor = () => {
    switch (sport) {
      case 'volleyball': return '#9c27b0';
      case 'basketball': return '#ff9800';
      case 'hockey': return '#00bcd4';
      case 'handball': return '#4caf50';
      default: return '#00ffe7';
    }
  };

  const sportColor = getSportColor();

  const toggleCategory = (title) => {
    setExpandedCategories(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMomentum = () => {
    if (!trendData) return null;
    return <MomentumChart trendData={trendData} homeTeam={homeTeam} awayTeam={awayTeam} sport={sport} />;
  };

  const renderShotChart = () => {
    if (sport !== 'basketball' || !shootPoints || shootPoints.length === 0) return null;
    return (
      <ShotChart 
        shots={shootPoints} 
        homeTeam={homeTeam?.name} 
        awayTeam={awayTeam?.name} 
      />
    );
  };

  if (!statistics || (Array.isArray(statistics) && statistics.length === 0)) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderMomentum()}
        {renderShotChart()}
        {sport === 'cricket' && (
          <CricketStats 
            players={cricketPlayers} 
            homeTeamId={homeTeam?.id} 
            awayTeamId={awayTeam?.id} 
            sportColor={sportColor}
          />
        )}
        {sport === 'tennis' && (
          <TennisStats 
            statistics={statistics} 
            homeTeam={homeTeam} 
            awayTeam={awayTeam} 
            sportColor={sportColor}
          />
        )}
        {!cricketPlayers && sport !== 'tennis' && <EmptyState title="No statistics available" icon="chart-bar" />}
      </ScrollView>
    );
  }

  if (sport === 'tennis') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderMomentum()}
        <TennisStats 
          statistics={statistics} 
          homeTeam={homeTeam} 
          awayTeam={awayTeam} 
          sportColor={sportColor}
        />
      </ScrollView>
    );
  }

  // === ADVANCED STATS (from team_stats/list — has categories) ===
  if (statistics?.categories) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderMomentum()}
        {renderShotChart()}

        {/* Team headers */}
        <View style={styles.teamHeaderRow}>
          <View style={styles.teamHeaderItem}>
            <Text style={[styles.teamHeaderName, { color: sportColor }]} numberOfLines={1}>
              {homeTeam?.name || 'Home'}
            </Text>
          </View>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.teamHeaderItem}>
            <Text style={[styles.teamHeaderName, { color: '#ff6b6b' }]} numberOfLines={1}>
              {awayTeam?.name || 'Away'}
            </Text>
          </View>
        </View>

        {statistics.categories.map((category, catIdx) => {
          const isExpanded = expandedCategories[category.title] !== false; // Default open

          return (
            <View key={catIdx} style={styles.categoryCard}>
              <TouchableOpacity 
                style={styles.categoryHeader} 
                onPress={() => toggleCategory(category.title)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryHeaderLeft}>
                  <Text style={styles.categoryEmoji}>{category.title.split(' ')[0]}</Text>
                  <Text style={styles.categoryTitle}>
                    {category.title.split(' ').slice(1).join(' ')}
                  </Text>
                </View>
                <Icon 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color="rgba(255,255,255,0.5)" 
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.categoryContent}>
                  {category.stats.map((stat, statIdx) => {
                    const homeVal = parseFloat(String(stat.home).replace(/[^0-9.-]/g, '')) || 0;
                    const awayVal = parseFloat(String(stat.away).replace(/[^0-9.-]/g, '')) || 0;
                    const total = homeVal + awayVal;
                    const ratio = total > 0 ? homeVal / total : 0.5;

                    return (
                      <View key={statIdx} style={styles.statRow}>
                        <Text style={[styles.statValue, styles.homeValue]}>
                          {stat.home}
                        </Text>
                        <View style={styles.statCenter}>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                          <View style={styles.barContainer}>
                            <View style={[styles.barHome, { 
                              flex: ratio, 
                              backgroundColor: sportColor 
                            }]} />
                            <View style={[styles.barAway, { 
                              flex: 1 - ratio, 
                              backgroundColor: '#ff6b6b' 
                            }]} />
                          </View>
                        </View>
                        <Text style={[styles.statValue, styles.awayValue]}>
                          {stat.away}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // === BASIC STATS (fallback from detail_live) ===
  const renderBasicStatsList = (stats) => {
    if (!stats || !Array.isArray(stats)) return null;
    return stats.map((stat, index) => {
      const homeVal = parseFloat(stat.home) || 0;
      const awayVal = parseFloat(stat.away) || 0;
      const total = homeVal + awayVal;
      const ratio = total > 0 ? homeVal / total : 0.5;
      return (
        <StatBar
          key={index}
          label={stat.type || stat.name}
          homeValue={stat.home}
          awayValue={stat.away}
          homeRatio={ratio}
          color={sportColor}
        />
      );
    });
  };

  // Football basic stats structure: [{ team: { id, name }, statistics: [{ type, value }] }]
  const renderFootballBasicStats = () => {
    if (!Array.isArray(statistics) || statistics.length < 2) return null;
    const homeStats = statistics[0].statistics;
    const awayStats = statistics[1].statistics;
    return homeStats.map((stat, index) => {
      const type = stat.type;
      const homeValStr = stat.value?.toString() || '0';
      const awayValStr = awayStats.find(s => s.type === type)?.value?.toString() || '0';
      const homeVal = parseFloat(homeValStr.replace('%', '')) || 0;
      const awayVal = parseFloat(awayValStr.replace('%', '')) || 0;
      const total = homeVal + awayVal;
      const ratio = total > 0 ? homeVal / total : 0.5;
      return (
        <StatBar
          key={index}
          label={type}
          homeValue={homeValStr}
          awayValue={awayValStr}
          homeRatio={ratio}
          color={sportColor}
        />
      );
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderMomentum()}
      {renderShotChart()}
      <Card sportColor={sportColor}>
        <SectionHeader title="Match Statistics" icon="chart-bar" sportColor={sportColor} />
        <View style={styles.statsWrapper}>
          {sport === 'football' ? renderFootballBasicStats() : renderBasicStatsList(statistics)}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  statsWrapper: { marginTop: 8 },
  // Team header row
  teamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
  },
  teamHeaderItem: {
    flex: 1,
    alignItems: 'center',
  },
  teamHeaderName: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vsText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  // Category card
  categoryCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: isTablet ? 14 : 12,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: isTablet ? 20 : 18,
    marginRight: 10,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: isTablet ? 16 : 15,
    fontWeight: '700',
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  // Stat row
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  statValue: {
    width: isTablet ? 60 : 50,
    fontSize: isTablet ? 15 : 14,
    fontWeight: '700',
    color: '#fff',
  },
  homeValue: {
    textAlign: 'right',
    paddingRight: 10,
  },
  awayValue: {
    textAlign: 'left',
    paddingLeft: 10,
  },
  statCenter: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: isTablet ? 12 : 11,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  barHome: {
    height: '100%',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  barAway: {
    height: '100%',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
});

export default StatsTab;
