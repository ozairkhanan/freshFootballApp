import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Text,
  Platform,
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
  const [loading, setLoading] = useState(true);
  const [fixture, setFixture] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [events, setEvents] = useState(null);
  const [lineups, setLineups] = useState(null);
  const [h2h, setH2h] = useState(null);
  const [odds, setOdds] = useState(null);
  const [injuries, setInjuries] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [venueDetails, setVenueDetails] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [commentary, setCommentary] = useState(null);

  useEffect(() => {
    fetchFixtureDetails();
  }, [fixtureId]);

  const fetchFixtureDetails = async () => {
    try {
      setLoading(true);
      console.log(`📱 FixtureDetailsScreen: Navigated with fixtureId=${fixtureId}, sport=${sport}`);
      
      // Step 1: Get fixture details FIRST (needed for team IDs for H2H)
      const fixtureData = await getFixtureById(fixtureId, sport, initialDate);
      const fixtureInfo = fixtureData.response[0];
      setFixture(fixtureInfo);

      // Step 2: Fire ALL other calls in parallel
      const promises = [];
      const promiseLabels = [];

      // Venue
      const venueId = fixtureInfo?.fixture?.venue?.id || fixtureInfo?.venue?.id;
      if (venueId && sport === 'football') {
        promises.push(getVenueInfo(venueId, sport).catch(() => null));
        promiseLabels.push('venue');
      }

      // Stats
      if (sport !== 'handball') {
        promises.push(getFixtureStatistics(fixtureId, sport).catch(() => null));
        promiseLabels.push('stats');
      }

      // Lineups
      if (sport !== 'volleyball' && sport !== 'handball') {
        promises.push(getFixtureLineups(fixtureId, sport).catch(() => null));
        promiseLabels.push('lineups');
      }

      // H2H / Analysis
      if (sport === 'football') {
        // Football uses match analysis API (richer data: form, goal distribution, future matches)
        promises.push(getFixtureAnalysis(fixtureId, sport).catch(() => null));
        promiseLabels.push('h2h');
      } else if (fixtureInfo?.teams?.home?.id && fixtureInfo?.teams?.away?.id) {
        promises.push(getFixtureH2H(fixtureInfo.teams.home.id, fixtureInfo.teams.away.id, sport, 10).catch(() => null));
        promiseLabels.push('h2h');
      }

      // Football-only
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

      // Hockey events
      if (sport === 'hockey') {
        promises.push(getFixtureEvents(fixtureId, sport).catch(() => null));
        promiseLabels.push('events');
      }

      // Odds
      if (['football', 'basketball', 'hockey', 'volleyball', 'handball'].includes(sport)) {
        promises.push(getFixtureOdds(fixtureId, sport).catch(() => null));
        promiseLabels.push('odds');
      }

      // Trend / Momentum
      promises.push(getFixtureTrend(fixtureId, sport).catch(() => null));
      promiseLabels.push('trend');

      // Wait for ALL to complete in parallel
      const results = await Promise.all(promises);

      // Map results back to state
      results.forEach((result, idx) => {
        const label = promiseLabels[idx];
        if (!result) return;
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
          }
        } catch (parseErr) {
          console.log(`⚠️ Error processing ${label}:`, parseErr.message);
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading fixture details:', error?.message || error);
      if (error?.response) {
        console.error(`❌ API returned ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        console.error(`❌ Failed URL: ${error.config?.url}`);
      }
      setLoading(false);
    }
  };

  // ✅ Helper function to extract score based on sport
  const getScore = (fixture, sport) => {
    if (!fixture) return { home: 0, away: 0 };

    // ✅ NEW: Handball scores are direct integers (like volleyball)
    if (sport === 'handball') {
      return {
        home: fixture.scores?.home ?? 0,
        away: fixture.scores?.away ?? 0,
      };
    }

    if (sport === 'volleyball') {
      // Volleyball: scores are integers directly
      return {
        home: fixture.scores?.home ?? 0,
        away: fixture.scores?.away ?? 0,
      };
    } else if (sport === 'basketball') {
      // Basketball: scores.home.total
      return {
        home: fixture.scores?.home?.total ?? 0,
        away: fixture.scores?.away?.total ?? 0,
      };
    } else if (sport === 'hockey') {
      // Hockey: similar to basketball
      return {
        home: fixture.scores?.home ?? 0,
        away: fixture.scores?.away ?? 0,
      };
    } else {
      // Football: goals.home
      return {
        home: fixture.goals?.home ?? 0,
        away: fixture.goals?.away ?? 0,
      };
    }
  };

  // ✅ Get accent color - consistent teal for all sports
  const getAccentColor = () => {
    return '#00ffe7';
  };

  const renderShimmerLoading = () => (
    <View style={styles.shimmerContainer}>
      {[1, 2, 3, 4].map(i => (
        <LoadingCard key={i} sport={sport} />
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab fixture={fixture} venueDetails={venueDetails} lineups={lineups} sport={sport} navigation={navigation} />;
      case 'stats':
        return <StatsTab statistics={statistics} trendData={trendData} homeTeam={fixture?.teams?.home} awayTeam={fixture?.teams?.away} sport={sport} />;
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
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={gradients.background}
          style={styles.background}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Match Details</Text>
            <View style={styles.backButton} />
          </View>
          {renderShimmerLoading()}
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!fixture) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={gradients.background}
          style={styles.background}
        >
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={80} color="#ff6b6b" />
            <Text style={styles.errorText}>Failed to load fixture</Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: getAccentColor() },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.retryText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ✅ SAFE DATA EXTRACTION - Works for ALL sports
  const teams = fixture.teams || {};
  const homeTeam = teams.home || {};
  const awayTeam = teams.away || {};

  // ✅ FIXED: Use helper function for sport-specific score extraction
  const { home: homeScore, away: awayScore } = getScore(fixture, sport);

  // ✅ FIXED: Handle status for different API structures
  const fixtureInfo = fixture.fixture || fixture;
  const status = fixtureInfo.status || fixture.status || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={gradients.background}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share-variant" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Fixture Header with teams and scores */}
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

        {/* Tabs */}
        <FixtureTabs
          sport={sport}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
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
  background: { flex: 1 },
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
  scrollView: { flex: 1 },
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