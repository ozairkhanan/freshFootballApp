  import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
  import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Text,
    Platform,
    InteractionManager,
  } from 'react-native';
  import LinearGradient from 'react-native-linear-gradient';
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
  import { gradients } from '../theme';
  import { LoadingCard } from '../components/common/CommonUI';

  // API Imports
  import {
    getFixtureById,
    getFixtureStatistics,
    getFixtureLineups,
    getFixtureEvents,
    getFixtureH2H,
    getFixtureAnalysis,
    getFixtureInjuries,
    getFixturePrediction,
    getFixtureOdds,
    getFixtureTrend,
    getVenueInfo,
    getFixtureCommentary,
    getBasketballShootPoints,
  } from '../api/sportsApi';

  // Component Imports
  import FixtureHeader from '../components/fixtureDetails/FixtureHeader';
  import FixtureTabs from '../components/fixtureDetails/FixtureTabs';
  import OverviewTab from '../components/fixtureDetails/OverviewTab';
  import StatsTab from '../components/fixtureDetails/StatsTab';
  import EventsTab from '../components/fixtureDetails/EventsTab';
  import LineupsTab from '../components/fixtureDetails/LineupsTab';
  import PitchFormation from '../components/fixtureDetails/PitchFormation';
  import H2HTab from '../components/fixtureDetails/H2HTab';
  import OddsTab from '../components/fixtureDetails/OddsTab';
  import InjuriesTab from '../components/fixtureDetails/InjuriesTab';
  import PredictionTab from '../components/fixtureDetails/PredictionTab';
  import CommentaryTab from '../components/fixtureDetails/CommentaryTab';

  const FixtureDetailsScreen = ({ route, navigation }) => {
    const { fixtureId, sport = 'football', date: initialDate } = route.params;

    const [activeTab, setActiveTab] = useState('overview');

    // ─── Split loading states ─────────────────────────────────────────────────────
    // headerLoading: blocks the entire screen until score/teams arrive
    // secondaryLoading: only blocks the tab content area — header stays visible
    const [headerLoading,    setHeaderLoading]    = useState(true);
    const [secondaryLoading, setSecondaryLoading] = useState(false);

    // ─── Data state (identical to original — no child component changes needed) ───
    const [fixture,      setFixture]      = useState(null);
    const [statistics,   setStatistics]   = useState(null);
    const [events,       setEvents]       = useState(null);
    const [lineups,      setLineups]      = useState(null);
    const [h2h,          setH2h]          = useState(null);
    const [odds,         setOdds]         = useState(null);
    const [injuries,     setInjuries]     = useState(null);
    const [prediction,   setPrediction]   = useState(null);
    const [venueDetails, setVenueDetails] = useState(null);
    const [trendData,    setTrendData]    = useState(null);
    const [commentary,   setCommentary]   = useState(null);
    const [shootPoints,  setShootPoints]  = useState(null);

    // ─── OPTIMIZATION 1: InteractionManager ──────────────────────────────────────
    // Defers ALL network calls until the navigation slide animation finishes.
    // Without this, the JS thread is split between animation + fetch, causing
    // janky transitions. The screen now appears instantly before any fetch runs.
    useEffect(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        fetchFixtureDetails();
      });
      return () => task.cancel(); // cancel if user navigates away quickly
    }, [fixtureId]);

    // ─── PHASE 1: Fetch only the fixture header ───────────────────────────────────
    // The user sees teams + score as soon as this single call resolves.
    // All other data loads in phase 2, in the background.
    const fetchFixtureDetails = async () => {
      try {
        setHeaderLoading(true);

        const fixtureData = await getFixtureById(fixtureId, sport, initialDate);
        const fixtureInfo = fixtureData.response[0];
        setFixture(fixtureInfo);
        setHeaderLoading(false); // ✅ Header + score visible to the user NOW

        // Phase 2 runs immediately after — tab area shows skeleton
        setSecondaryLoading(true);
        await fetchSecondaryData(fixtureInfo);
        setSecondaryLoading(false);

      } catch (error) {
        console.error('❌ Error loading fixture details:', error?.message || error);
        if (error?.response) {
          console.error(`❌ API ${error.response.status}: ${JSON.stringify(error.response.data)}`);
          console.error(`❌ Failed URL: ${error.config?.url}`);
        }
        setHeaderLoading(false);
        setSecondaryLoading(false);
      }
    };

    // ─── PHASE 2: All secondary data in parallel ─────────────────────────────────
    // Wrapped in useCallback so the function reference is stable and won't
    // accidentally trigger any effects that depend on it.
    const fetchSecondaryData = useCallback(async (fixtureInfo) => {
      const promises = [];
      const promiseLabels = [];

      const venueId = fixtureInfo?.fixture?.venue?.id || fixtureInfo?.venue?.id;
      if (venueId && sport === 'football') {
        promises.push(getVenueInfo(venueId, sport).catch(() => null));
        promiseLabels.push('venue');
      }

      if (sport !== 'handball') {
        promises.push(getFixtureStatistics(fixtureId, sport).catch(() => null));
        promiseLabels.push('stats');
      }

      if (sport !== 'volleyball' && sport !== 'handball') {
        promises.push(getFixtureLineups(fixtureId, sport).catch(() => null));
        promiseLabels.push('lineups');
      }

      if (['football', 'basketball'].includes(sport)) {
        promises.push(getFixtureAnalysis(fixtureId, sport).catch(() => null));
        promiseLabels.push('h2h');
      } else if (fixtureInfo?.teams?.home?.id && fixtureInfo?.teams?.away?.id) {
        promises.push(
          getFixtureH2H(fixtureInfo.teams.home.id, fixtureInfo.teams.away.id, sport, 10).catch(() => null)
        );
        promiseLabels.push('h2h');
      }

      if (sport === 'football') {
        promises.push(getFixtureEvents(fixtureId, sport).catch(() => null));
        promiseLabels.push('events');
        promises.push(getFixtureInjuries(fixtureId, sport).catch(() => null));
        promiseLabels.push('injuries');
        promises.push(getFixtureCommentary(fixtureId, sport).catch(() => null));
        promiseLabels.push('commentary');
        promises.push(getFixturePrediction(fixtureId, sport).catch(() => null));
        promiseLabels.push('prediction');
      }

      if (sport === 'hockey') {
        promises.push(getFixtureEvents(fixtureId, sport).catch(() => null));
        promiseLabels.push('events');
      }

      if (['football', 'basketball', 'hockey', 'volleyball', 'handball'].includes(sport)) {
        promises.push(getFixtureOdds(fixtureId, sport).catch(() => null));
        promiseLabels.push('odds');
      }

      if (sport === 'basketball') {
        promises.push(getBasketballShootPoints(fixtureId).catch(() => null));
        promiseLabels.push('shootPoints');
      }

      const results = await Promise.all(promises);

      // ─── OPTIMIZATION 2: Single-pass state updates ────────────────────────────
      // All setters are called once each in this loop — no duplicates, no waste.
      results.forEach((result, idx) => {
        if (!result) return;
        const label = promiseLabels[idx];
        try {
          switch (label) {
            case 'venue':
              if (result.response?.[0]) setVenueDetails(result.response[0]);
              break;
            case 'stats':
              if (result.response) setStatistics(result.response);
              break;
            case 'lineups':
              if (result.response) setLineups(result.response);
              break;
            case 'h2h':
              setH2h(result);
              break;
            case 'events':
              if (result.response) setEvents(result.response);
              break;
            case 'injuries':
              if (result.response) setInjuries(result.response);
              break;
            case 'commentary':
              if (result.response) setCommentary(result.response);
              break;
            case 'prediction':
              if (result.response?.[0]) setPrediction(result.response[0]);
              break;
            case 'odds':
              setOdds(result);
              break;
            case 'trend':
              if (result.response) setTrendData(result.response);
              break;
            case 'shootPoints':
              if (result.response) setShootPoints(result.response);
              break;
          }
        } catch (parseErr) {
          console.log(`⚠️ Error processing ${label}:`, parseErr.message);
        }
      });
    }, [fixtureId, sport]);

    // ─── OPTIMIZATION 3: useMemo for score extraction ────────────────────────────
    // Previously getScore() ran on every render. Now it only recalculates
    // when fixture data or sport actually changes.
    const { homeScore, awayScore } = useMemo(() => {
      if (!fixture) return { homeScore: 0, awayScore: 0 };

      let home = 0;
      let away = 0;

      if (sport === 'handball' || sport === 'hockey') {
        home = fixture.scores?.home ?? 0;
        away = fixture.scores?.away ?? 0;
      } else if (sport === 'volleyball') {
        home = fixture.scores?.home ?? 0;
        away = fixture.scores?.away ?? 0;
      } else if (sport === 'basketball') {
        home = fixture.scores?.home?.total ?? 0;
        away = fixture.scores?.away?.total ?? 0;
      } else {
        home = fixture.goals?.home ?? 0;
        away = fixture.goals?.away ?? 0;
      }

      return { homeScore: home, awayScore: away };
    }, [fixture, sport]);

    // ─── OPTIMIZATION 4: useMemo for tab content ─────────────────────────────────
    // The switch/JSX previously ran on every render regardless of what changed.
    // Now child components only re-render when their specific data slice updates.
    const tabContent = useMemo(() => {
      if (!fixture) return null;

      switch (activeTab) {
        case 'overview':
          return (
            <OverviewTab
              fixture={fixture}
              venueDetails={venueDetails}
              lineups={lineups}
              sport={sport}
              navigation={navigation}
            />
          );
        case 'stats':
          return (
            <StatsTab
              statistics={statistics}
              trendData={trendData}
              homeTeam={fixture?.teams?.home}
              awayTeam={fixture?.teams?.away}
              sport={sport}
              shootPoints={shootPoints}
            />
          );
        case 'commentary':
          return <CommentaryTab commentary={commentary} sport={sport} />;
        case 'events':
          return <EventsTab events={events} />;
        case 'lineups':
          return (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {sport === 'football' && lineups && !Array.isArray(lineups) && (
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                  <PitchFormation
                    homePlayers={lineups.home || []}
                    awayPlayers={lineups.away || []}
                    homeFormation={lineups.homeFormation}
                    awayFormation={lineups.awayFormation}
                    homeTeam={fixture?.teams?.home?.name}
                    awayTeam={fixture?.teams?.away?.name}
                    confirmed={lineups.confirmed}
                  />
                </View>
              )}
              <LineupsTab lineups={lineups} sport={sport} navigation={navigation} />
            </ScrollView>
          );
        case 'h2h':
          return <H2HTab h2h={h2h} sport={sport} />;
        case 'odds':
          return <OddsTab odds={odds} sport={sport} />;
        case 'injuries':
          return (
            <InjuriesTab
              injuries={injuries}
              homeTeam={fixture?.teams?.home}
              awayTeam={fixture?.teams?.away}
            />
          );
        case 'prediction':
          return <PredictionTab prediction={prediction} />;
        default:
          return null;
      }
    }, [
      activeTab, fixture, venueDetails, lineups, statistics,
      trendData, commentary, events, h2h, odds, injuries,
      prediction, sport, navigation,
    ]);

    // ─── OPTIMIZATION 5: Memoized shimmer skeleton ───────────────────────────────
    // This JSX doesn't change — no need to recreate it every render.
    const shimmerLoading = useMemo(() => (
      <View style={styles.shimmerContainer}>
        {[1, 2, 3, 4].map(i => (
          <LoadingCard key={i} sport={sport} />
        ))}
      </View>
    ), [sport]);

    // ─── OPTIMIZATION 6: Stable callback for tab changes ─────────────────────────
    // Without useCallback, a new function reference is created every render,
    // causing FixtureTabs to re-render unnecessarily (if it uses React.memo).
    const handleTabChange = useCallback((tab) => {
      setActiveTab(tab);
    }, []);

    // ── Full-screen loading (only until the first API call resolves) ──────────────
    if (headerLoading) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <LinearGradient colors={gradients.background} style={styles.background}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Match Details</Text>
              <View style={styles.backButton} />
            </View>
            {shimmerLoading}
          </LinearGradient>
        </SafeAreaView>
      );
    }

    if (!fixture) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <LinearGradient colors={gradients.background} style={styles.background}>
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={80} color="#ff6b6b" />
              <Text style={styles.errorText}>Failed to load fixture</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.retryText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </SafeAreaView>
      );
    }

    const teams       = fixture.teams || {};
    const homeTeam    = teams.home || {};
    const awayTeam    = teams.away || {};
    const fixtureInfo = fixture.fixture || fixture;
    const status      = fixtureInfo.status || fixture.status || {};

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>

          {/* Top bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Match Details</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share-variant" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Score card — visible immediately after phase 1 resolves ✅ */}
          <FixtureHeader
            teams={{ home: homeTeam, away: awayTeam }}
            homeScore={homeScore}
            awayScore={awayScore}
            status={status}
            sport={sport}
            venue={fixture.venue || venueDetails?.name}
            aggScore={fixture.agg_score}
            environment={fixture.environment}
          />

          {/* Tab bar */}
          <FixtureTabs
            sport={sport}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Tab body — skeleton while secondary data loads, real content after */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {secondaryLoading ? shimmerLoading : tabContent}
          </ScrollView>

        </LinearGradient>
      </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    background:   { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    shareButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
    },
    scrollView:       { flex: 1 },
    shimmerContainer: { flex: 1, padding: 16 },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      color: '#ff6b6b',
      fontSize: 20,
      fontWeight: '700',
      marginTop: 20,
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: '#00ffe7',
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    retryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  });

  export default FixtureDetailsScreen;