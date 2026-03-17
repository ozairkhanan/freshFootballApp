import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TeamLogo, Card, SectionHeader, InfoRow, EmptyState } from '../common/CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const OverviewTab = ({ fixture, venueDetails, lineups, sport = 'football', navigation }) => {
  if (!fixture) {
    return <EmptyState title="No match information available" message="Please try again later" icon="information-circle-outline" />;
  }

  const getSportConfig = () => {
    switch (sport) {
      case 'volleyball': return { color: '#9c27b0', icon: 'volleyball' };
      case 'basketball': return { color: '#ff9800', icon: 'basketball' };
      case 'hockey': return { color: '#00bcd4', icon: 'hockey-puck' };
      case 'handball': return { color: '#4caf50', icon: 'handball' };
      default: return { color: '#00ffe7', icon: 'soccer' };
    }
  };

  const config = getSportConfig();

  const renderSectionHeader = (title, icon) => (
    <SectionHeader title={title} icon={icon} sportColor={config.color} />
  );

  const renderMomentum = () => {
    if (!trendData) return null;
    return <MomentumChart trendData={trendData} homeTeam={fixture.teams?.home} awayTeam={fixture.teams?.away} sport={sport} />;
  };

  const renderInfoSection = () => {
    const matchDate = fixture.date || fixture.fixture?.date;
    const venue = fixture.venue || venueDetails;
    
    // Support both string venue (new mapping) and object venue (old/specific lookup)
    const venueValue = typeof venue === 'string' 
      ? venue 
      : (venue?.name ? `${venue.name}${venue.city ? `, ${venue.city}` : ''}` : null);
    
    return (
      <Card sportColor={config.color}>
        {renderSectionHeader('Match Information', config.icon)}
        
        {fixture.league && (
          <InfoRow label="Competition" value={fixture.league.name} icon="trophy-outline" iconColor={config.color} />
        )}
        
        {matchDate && (
          <InfoRow 
            label="Date" 
            value={new Date(matchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
            icon="calendar-outline" 
            iconColor={config.color} 
          />
        )}
        
        <InfoRow label="Time" value={fixture.time || fixture.fixture?.status?.long || 'TBD'} icon="clock-outline" iconColor={config.color} />
        
        {venueValue && (
          <InfoRow label="Venue" value={venueValue} icon="map-marker-outline" iconColor={config.color} />
        )}

        {(fixture.referee || fixture.fixture?.referee) && (
          <InfoRow label="Referee" value={fixture.referee || fixture.fixture.referee} icon="whistle-outline" iconColor={config.color} />
        )}

        {fixture.environment?.temperature && (
          <InfoRow label="Weather" value={`${fixture.environment.temperature} (${fixture.environment.humidity} Hum)`} icon="weather-cloudy" iconColor={config.color} />
        )}
      </Card>
    );
  };

  const renderScoreBreakdown = () => {
    const periods = fixture.periods || {};
    const homeTeam = fixture.teams?.home || fixture.homeTeam;
    const awayTeam = fixture.teams?.away || fixture.awayTeam;
    
    let items = [];
    if (sport === 'volleyball') {
      ['first', 'second', 'third', 'fourth', 'fifth'].forEach((name, i) => {
        if (periods[name] && periods[name].home !== null) {
          items.push({ name: `Set ${i + 1}`, home: periods[name].home, away: periods[name].away });
        }
      });
    } else if (sport === 'hockey') {
      ['first', 'second', 'third'].forEach((name, i) => {
        if (periods[name] && periods[name].home !== null) {
          items.push({ name: `Period ${i + 1}`, home: periods[name].home, away: periods[name].away });
        }
      });
    } else if (sport === 'basketball') {
      const scores = fixture.scores || {};
      ['quarter_1', 'quarter_2', 'quarter_3', 'quarter_4'].forEach((name, i) => {
        if (scores.home && scores.home[name] !== undefined) {
          items.push({ name: `Q${i + 1}`, home: scores.home[name], away: scores.away[name] });
        }
      });
      
      // Multi-OT support
      if (scores.home?.otBreakdown && Array.isArray(scores.home.otBreakdown)) {
        scores.home.otBreakdown.forEach((score, i) => {
          items.push({ 
            name: scores.home.otBreakdown.length > 1 ? `OT ${i + 1}` : 'OT', 
            home: score, 
            away: scores.away.otBreakdown[i] || 0 
          });
        });
      } else if (scores.home?.over_time > 0 || scores.away?.over_time > 0) {
        items.push({ name: 'OT', home: scores.home.over_time || 0, away: scores.away.over_time || 0 });
      }
    }

    if (items.length === 0) return null;

    return (
      <Card sportColor={config.color}>
        {renderSectionHeader('Score Breakdown', 'format-list-bulleted')}
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownLabel}>Period</Text>
          <Text style={styles.breakdownValue}>{homeTeam?.name}</Text>
          <Text style={styles.breakdownValue}>{awayTeam?.name}</Text>
        </View>
        {items.map((item, index) => (
          <View key={index} style={styles.breakdownRow}>
            <Text style={styles.breakdownName}>{item.name}</Text>
            <Text style={[styles.breakdownScore, item.home > item.away && { color: config.color, fontWeight: '800' }]}>{item.home}</Text>
            <Text style={[styles.breakdownScore, item.away > item.home && { color: config.color, fontWeight: '800' }]}>{item.away}</Text>
          </View>
        ))}
      </Card>
    );
  };

  const isLive = fixture.status?.short === 'LIVE' || ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT'].includes(fixture.status?.short);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderInfoSection()}
      {renderScoreBreakdown()}
      
      {/* Final Result Card */}
      <Card sportColor={config.color}>
        {renderSectionHeader(isLive ? 'Live Score' : 'Final Result', 'trophy-outline')}
        <View style={styles.finalScoreContainer}>
          <View style={styles.finalTeam}>
            <TeamLogo logo={fixture.teams?.home?.logo || fixture.homeTeam?.logo} sport={sport} color={config.color} size={isTablet ? 60 : 50} />
            <Text style={styles.finalTeamName}>{fixture.teams?.home?.name || fixture.homeTeam?.name}</Text>
            {fixture.teams?.home?.position && (
              <Text style={styles.finalRankText}>Rank: {fixture.teams.home.position}</Text>
            )}
          </View>
          <View style={styles.finalScoreBox}>
            <Text style={[styles.finalScoreText, { color: config.color }]}>
              {fixture.scores?.home?.total ?? fixture.goals?.home ?? 0} - {fixture.scores?.away?.total ?? fixture.goals?.away ?? 0}
            </Text>
            <Text style={styles.finalLabel}>
              {isLive ? (fixture.status?.clock?.display || fixture.status?.short || 'LIVE') : (fixture.status?.long || 'FINAL')}
            </Text>
          </View>
          <View style={styles.finalTeam}>
            <TeamLogo logo={fixture.teams?.away?.logo || fixture.awayTeam?.logo} sport={sport} color={config.color} size={isTablet ? 60 : 50} />
            <Text style={styles.finalTeamName}>{fixture.teams?.away?.name || fixture.awayTeam?.name}</Text>
            {fixture.teams?.away?.position && (
              <Text style={styles.finalRankText}>Rank: {fixture.teams.away.position}</Text>
            )}
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  breakdownHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  breakdownLabel: { flex: 1, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  breakdownValue: { width: 60, color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  breakdownRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  breakdownName: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' },
  breakdownScore: { width: 60, color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
  finalScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  finalTeam: { flex: 1, alignItems: 'center' },
  finalTeamName: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  finalScoreBox: { alignItems: 'center', paddingHorizontal: 16 },
  finalScoreText: { fontSize: 32, fontWeight: '900' },
  finalLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700', marginTop: 4 },
  finalRankText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default OverviewTab;
