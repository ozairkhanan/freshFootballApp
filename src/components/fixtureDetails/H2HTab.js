import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LoadingCard } from '../common/CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// ── Helpers ──────────────────────────────────────────────
const getResult = (match, teamId) => {
  if (!match || !match.teams) return null;
  const homeId = match.teams.home?.id;
  const homeScore = match.goals?.home ?? match.score?.home;
  const awayScore = match.goals?.away ?? match.score?.away;
  if (homeScore == null || awayScore == null) return null;
  const isHome = String(homeId) === String(teamId);
  const tScore = isHome ? homeScore : awayScore;
  const oScore = isHome ? awayScore : homeScore;
  if (tScore > oScore) return 'W';
  if (tScore < oScore) return 'L';
  return 'D';
};

const resultColors = { W: '#4CAF50', D: '#FF9800', L: '#F44336' };

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
};

// ── Sub Components ───────────────────────────────────────

/** Form badge row: W W D L W */
const FormBadges = ({ matches, teamId, label }) => {
  if (!matches || matches.length === 0) return null;
  const results = matches.slice(0, 10).map(m => getResult(m, teamId)).filter(Boolean);
  if (results.length === 0) return null;

  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formRow}>
        {results.map((r, i) => (
          <View key={i} style={[styles.formBadge, { backgroundColor: resultColors[r] }]}>
            <Text style={styles.formBadgeText}>{r}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.formSummary}>
        {results.filter(r => r === 'W').length}W {results.filter(r => r === 'D').length}D {results.filter(r => r === 'L').length}L
      </Text>
    </View>
  );
};

/** Goal distribution bar chart */
const GoalDistChart = ({ data, label, color }) => {
  if (!data || !data.scored || data.scored.length === 0) return null;
  const maxPct = Math.max(...data.scored.map(s => s.percentage), ...data.conceded.map(s => s.percentage), 1);

  return (
    <View style={styles.distSection}>
      <Text style={styles.distLabel}>{label} ({data.matches} matches)</Text>
      <View style={styles.distChart}>
        {data.scored.map((seg, i) => (
          <View key={i} style={styles.distCol}>
            <View style={styles.distBarContainer}>
              <View style={[styles.distBar, styles.distBarScored, {
                height: `${Math.max((seg.percentage / maxPct) * 100, 4)}%`,
                backgroundColor: color,
              }]}>
                <Text style={styles.distBarText}>{seg.count}</Text>
              </View>
              <View style={[styles.distBar, styles.distBarConceded, {
                height: `${Math.max((data.conceded[i]?.percentage / maxPct) * 100, 4)}%`,
              }]}>
                <Text style={styles.distBarText}>{data.conceded[i]?.count || 0}</Text>
              </View>
            </View>
            <Text style={styles.distMinLabel}>{seg.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.distLegend}>
        <View style={styles.distLegendItem}>
          <View style={[styles.distLegendDot, { backgroundColor: color }]} />
          <Text style={styles.distLegendText}>Scored</Text>
        </View>
        <View style={styles.distLegendItem}>
          <View style={[styles.distLegendDot, { backgroundColor: 'rgba(244,67,54,0.6)' }]} />
          <Text style={styles.distLegendText}>Conceded</Text>
        </View>
      </View>
    </View>
  );
};

/** Match row for history / future */
const MatchRow = ({ match, highlightTeamId, sportColor }) => {
  if (!match) return null;
  const isFinished = match.statusId >= 7;
  const result = getResult(match, highlightTeamId);
  const rColor = result ? resultColors[result] : null;

  return (
    <View style={styles.matchRow}>
      {rColor ? (
        <View style={[styles.resultIndicator, { backgroundColor: rColor }]}>
          <Text style={styles.resultIndicatorText}>{result}</Text>
        </View>
      ) : (
        <View style={[styles.resultIndicator, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Text style={styles.resultIndicatorText}>-</Text>
        </View>
      )}
      <View style={styles.matchInfo}>
        <View style={styles.matchMetaRow}>
            <Text style={styles.matchDate}>{formatDate(match.time)}</Text>
            {match.competitionName && (
                <>
                    <View style={styles.metaDot} />
                    <Text style={styles.matchComp}>{match.competitionName}</Text>
                </>
            )}
        </View>
        <Text style={styles.matchTeams} numberOfLines={1}>
          {match.teams?.home?.name || 'Home'} — {match.teams?.away?.name || 'Away'}
        </Text>
        {match.round > 0 && <Text style={styles.matchRound}>Round {match.round}</Text>}
      </View>
      <Text style={[styles.matchScore, isFinished && { color: '#fff' }]}>
        {isFinished ? `${match.goals?.home ?? '-'} - ${match.goals?.away ?? '-'}` : 'vs'}
      </Text>
    </View>
  );
};

// ── Main Component ───────────────────────────────────────

const H2HTab = ({ h2h, sport = 'football' }) => {
  const [activeSection, setActiveSection] = useState('overview');

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

  // Detect if this is the new analysis format or legacy H2H
  const isAnalysis = h2h?.response?.history || h2h?.response?.info;

  // ── Legacy H2H (non-football) ──
  const legacyGames = useMemo(() => {
    if (isAnalysis) return [];
    if (!h2h?.response || !Array.isArray(h2h.response)) return [];
    return h2h.response;
  }, [h2h, isAnalysis]);

  // ── Analysis Data (football) ──
  const analysis = useMemo(() => {
    if (!isAnalysis) return null;
    const r = h2h.response;
    return {
      info: r.info,
      vs: r.history?.vs || [],
      homeForm: r.history?.home || [],
      awayForm: r.history?.away || [],
      homeFuture: r.future?.home || [],
      awayFuture: r.future?.away || [],
      goalDist: r.goalDistribution || null,
      homeTeamId: r.info?.teams?.home?.id,
      awayTeamId: r.info?.teams?.away?.id,
    };
  }, [h2h, isAnalysis]);

  // ── Loading / Empty States ──
  if (!h2h && !isAnalysis) {
    return (
      <View style={styles.emptyState}>
        <LoadingCard sport={sport} />
        <Text style={[styles.emptyText, { fontSize: 14, marginTop: 10 }]}>Loading H2H analysis...</Text>
      </View>
    );
  }

  if (!isAnalysis && legacyGames.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="tournament" size={isTablet ? 100 : 80} color="rgba(255,255,255,0.2)" />
        <Text style={styles.emptyText}>No head-to-head history available</Text>
      </View>
    );
  }

  if (isAnalysis && !analysis) {
    return (
      <View style={styles.emptyState}>
        <Icon name="tournament" size={isTablet ? 100 : 80} color="rgba(255,255,255,0.2)" />
        <Text style={styles.emptyText}>Preparing analysis data...</Text>
      </View>
    );
  }

  // ── Legacy H2H (keep simple for non-football) ──
  if (!isAnalysis) {
    const UnifiedMatchCard = require('../common/UnifiedMatchCard').default;
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Icon name="history" size={20} color={sportColor} />
            <Text style={styles.sectionTitle}>Match History</Text>
          </View>
          {legacyGames.map((game, index) => (
            <UnifiedMatchCard
              key={game.fixture?.id || game.id || index}
              fixture={game}
              sport={sport}
              onPress={() => {}}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  // ── Analysis H2H (football) ──
  const { vs, homeForm, awayForm, homeFuture, awayFuture, goalDist, homeTeamId, awayTeamId } = analysis;

  // Calculate H2H stats from vs matches
  let team1Wins = 0, team2Wins = 0, draws = 0;
  vs.forEach(m => {
    const r = getResult(m, homeTeamId);
    if (r === 'W') team1Wins++;
    else if (r === 'L') team2Wins++;
    else if (r === 'D') draws++;
  });
  const totalPlayed = team1Wins + team2Wins + draws;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'chart-bar' },
    { key: 'form', label: 'Form', icon: 'trending-up' },
    { key: 'goals', label: 'Goals', icon: 'soccer' },
    { key: 'future', label: 'Upcoming', icon: 'calendar' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tab Selector */}
      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeSection === t.key && { backgroundColor: `${sportColor}20`, borderColor: sportColor }]}
            onPress={() => setActiveSection(t.key)}
          >
            <Icon name={t.icon} size={14} color={activeSection === t.key ? sportColor : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.tabText, activeSection === t.key && { color: sportColor }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── OVERVIEW ── */}
      {activeSection === 'overview' && (
        <>
          {/* H2H Summary */}
          <View style={[styles.card, { borderColor: `${sportColor}33` }]}>
            <View style={styles.sectionHeader}>
              <Icon name="chart-bar" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Head to Head</Text>
              <Text style={styles.sectionSubtitle}>{totalPlayed} matches</Text>
            </View>

            {/* Win Distribution Bar */}
            {totalPlayed > 0 && (
              <View style={styles.winBar}>
                {team1Wins > 0 && (
                  <View style={[styles.winSegment, { flex: team1Wins, backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.winSegText}>{team1Wins}</Text>
                  </View>
                )}
                {draws > 0 && (
                  <View style={[styles.winSegment, { flex: draws, backgroundColor: '#FF9800' }]}>
                    <Text style={styles.winSegText}>{draws}</Text>
                  </View>
                )}
                {team2Wins > 0 && (
                  <View style={[styles.winSegment, { flex: team2Wins, backgroundColor: '#F44336' }]}>
                    <Text style={styles.winSegText}>{team2Wins}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.winLabels}>
              <Text style={[styles.winLabelText, { color: '#4CAF50' }]}>Home Wins</Text>
              <Text style={[styles.winLabelText, { color: '#FF9800' }]}>Draws</Text>
              <Text style={[styles.winLabelText, { color: '#F44336' }]}>Away Wins</Text>
            </View>
          </View>

          {/* Recent H2H Matches */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="history" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Previous Meetings</Text>
            </View>
            {vs.slice(0, 6).map((m, i) => (
              <MatchRow key={m.id || i} match={m} highlightTeamId={homeTeamId} sportColor={sportColor} />
            ))}
            {vs.length === 0 && <Text style={styles.noDataText}>No previous meetings found</Text>}
          </View>
        </>
      )}

      {/* ── FORM ── */}
      {activeSection === 'form' && (
        <>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="trending-up" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Recent Form</Text>
            </View>
            <FormBadges matches={homeForm} teamId={homeTeamId} label="Home Team" />
            <FormBadges matches={awayForm} teamId={awayTeamId} label="Away Team" />
          </View>

          {/* Home Team Recent Results */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="home" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Home Team Recent</Text>
            </View>
            {homeForm.slice(0, 8).map((m, i) => (
              <MatchRow key={m.id || i} match={m} highlightTeamId={homeTeamId} sportColor={sportColor} />
            ))}
          </View>

          {/* Away Team Recent Results */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="bus" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Away Team Recent</Text>
            </View>
            {awayForm.slice(0, 8).map((m, i) => (
              <MatchRow key={m.id || i} match={m} highlightTeamId={awayTeamId} sportColor={sportColor} />
            ))}
          </View>
        </>
      )}

      {/* ── GOAL DISTRIBUTION ── */}
      {activeSection === 'goals' && goalDist && (
        <>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="soccer" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Goal Distribution</Text>
            </View>
            <Text style={styles.distSubtitle}>When teams score & concede (by 15 min intervals)</Text>
            <GoalDistChart data={goalDist.home?.all} label="Home Team" color={sportColor} />
            <GoalDistChart data={goalDist.away?.all} label="Away Team" color="#ff9800" />
          </View>
        </>
      )}

      {/* ── FUTURE MATCHES ── */}
      {activeSection === 'future' && (
        <>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Home Team Upcoming</Text>
            </View>
            {homeFuture.slice(0, 5).map((m, i) => (
              <MatchRow key={m.id || i} match={m} highlightTeamId={homeTeamId} sportColor={sportColor} />
            ))}
            {homeFuture.length === 0 && <Text style={styles.noDataText}>No upcoming matches</Text>}
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="calendar" size={20} color={sportColor} />
              <Text style={styles.sectionTitle}>Away Team Upcoming</Text>
            </View>
            {awayFuture.slice(0, 5).map((m, i) => (
              <MatchRow key={m.id || i} match={m} highlightTeamId={awayTeamId} sportColor={sportColor} />
            ))}
            {awayFuture.length === 0 && <Text style={styles.noDataText}>No upcoming matches</Text>}
          </View>
        </>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

// ── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, padding: isTablet ? 24 : 16 },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100,
  },
  emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: 18, marginTop: 20 },

  // Tab selector
  tabRow: {
    flexDirection: 'row', gap: 8, marginBottom: 16,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'transparent',
  },
  tabText: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700',
  },

  // Card
  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)', borderRadius: 20, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: '#fff', fontSize: 16, fontWeight: '800', marginLeft: 10, flex: 1,
  },
  sectionSubtitle: {
    color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600',
  },

  // Win distribution bar
  winBar: {
    flexDirection: 'row', height: 32, borderRadius: 10, overflow: 'hidden', marginBottom: 8,
  },
  winSegment: {
    justifyContent: 'center', alignItems: 'center', minWidth: 24,
  },
  winSegText: {
    color: '#fff', fontSize: 13, fontWeight: '900',
  },
  winLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  winLabelText: {
    fontSize: 10, fontWeight: '700',
  },

  // Form badges
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  formRow: {
    flexDirection: 'row', gap: 4, marginBottom: 6,
  },
  formBadge: {
    width: 28, height: 28, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  formBadgeText: {
    color: '#fff', fontSize: 11, fontWeight: '900',
  },
  formSummary: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600',
  },

  // Match row
  matchRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  resultIndicator: {
    width: 24, height: 24, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  resultIndicatorText: {
    color: '#fff', fontSize: 10, fontWeight: '900',
  },
  matchInfo: {
    flex: 1,
  },
  matchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 6,
  },
  matchComp: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
  },
  matchDate: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
  },
  matchTeams: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  matchRound: {
    color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '600',
  },
  matchScore: {
    color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '800',
  },
  noDataText: {
    color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', paddingVertical: 16,
  },

  // Goal distribution
  distSection: {
    marginTop: 16, marginBottom: 8,
  },
  distLabel: {
    color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', marginBottom: 10,
  },
  distSubtitle: {
    color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 12,
  },
  distChart: {
    flexDirection: 'row', justifyContent: 'space-between', height: 100, gap: 4,
  },
  distCol: {
    flex: 1, alignItems: 'center',
  },
  distBarContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: '100%',
  },
  distBar: {
    flex: 1, borderRadius: 4, minHeight: 4, justifyContent: 'flex-end', alignItems: 'center',
    paddingBottom: 2,
  },
  distBarScored: {},
  distBarConceded: {
    backgroundColor: 'rgba(244,67,54,0.6)',
  },
  distBarText: {
    color: '#fff', fontSize: 8, fontWeight: '800',
  },
  distMinLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '600', marginTop: 4,
  },
  distLegend: {
    flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8,
  },
  distLegendItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  distLegendDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  distLegendText: {
    color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600',
  },

  // Legacy
  historySection: { paddingBottom: 20 },
});

export default H2HTab;
