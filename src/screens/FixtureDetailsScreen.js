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
import {
  getFixtureById,
  getFixtureStatistics,
  getFixtureEvents,
  getFixtureLineups,
  getFixtureH2H,
  getFixtureOdds,
  getFixtureInjuries,
  getFixturePrediction,
} from '../api/sportsApi';


import FixtureHeader from '../components/fixtureDetails/FixtureHeader';
import FixtureTabs from '../components/fixtureDetails/FixtureTabs';
import OverviewTab from '../components/fixtureDetails/OverviewTab';
import StatsTab from '../components/fixtureDetails/StatsTab';
import EventsTab from '../components/fixtureDetails/EventsTab';
import LineupsTab from '../components/fixtureDetails/LineupsTab';
import H2HTab from '../components/fixtureDetails/H2HTab';
import OddsTab from '../components/fixtureDetails/OddsTab';
import InjuriesTab from '../components/fixtureDetails/InjuriesTab';
import PredictionTab from '../components/fixtureDetails/PredictionTab';

import ShimmerCard from '../components/ShimmerCard';

const FixtureDetailsScreen = ({ route, navigation }) => {
  const { fixtureId, sport = 'football' } = route.params;

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

  useEffect(() => {
    fetchFixtureDetails();
  }, [fixtureId]);

  const fetchFixtureDetails = async () => {
    try {
      setLoading(true);
      console.log(`📱 FixtureDetailsScreen: Navigated with fixtureId=${fixtureId}, sport=${sport}`);
      
      const { getVenueInfo } = require('../api/sportsApi').default || require('../api/sportsApi');

      // Get fixture details
      const fixtureData = await getFixtureById(fixtureId, sport);
      const fixtureInfo = fixtureData.response[0];
      setFixture(fixtureInfo);

      // ✅ LOAD VENUE DETAILS (If available)
      const venueId = fixtureInfo?.fixture?.venue?.id || fixtureInfo?.venue?.id;
      if (venueId && sport === 'football') {
        try {
          const vData = await getVenueInfo(venueId, sport);
          if (vData.response && vData.response.length > 0) {
            setVenueDetails(vData.response[0]);
          }
        } catch (err) {
          console.log('Venue details not available');
        }
      }

      // ✅ LOAD STATS FOR ALL SPORTS (except handball - not available)
      if (sport !== 'handball') {
        try {
          const statsData = await getFixtureStatistics(fixtureId, sport);
          setStatistics(statsData.response);
        } catch (err) {
          console.log('Stats not available:', err.message);
        }
      }

      // ✅ LOAD LINEUPS/PLAYERS FOR ALL SPORTS (except volleyball & handball)
      if (sport !== 'volleyball' && sport !== 'handball') {
        try {
          const lineupsData = await getFixtureLineups(fixtureId, sport);
          setLineups(lineupsData.response);
        } catch (err) {
          console.log('Lineups not available:', err.message);
        }
      }

      // ✅ LOAD H2H FOR ALL SPORTS INCLUDING HANDBALL
      if (fixtureInfo?.teams?.home?.id && fixtureInfo?.teams?.away?.id) {
        try {
          const h2hData = await getFixtureH2H(
            fixtureInfo.teams.home.id,
            fixtureInfo.teams.away.id,
            sport,
            10,
          );
          // ✅ FIXED: Set the full object, not just .response
          setH2h(h2hData);
        } catch (err) {
          console.log('H2H not available:', err.message);
        }
      }

      // ⚠️ FOOTBALL-ONLY FEATURES
      if (sport === 'football') {
        try {
          const eventsData = await getFixtureEvents(fixtureId, sport);
          setEvents(eventsData.response);
        } catch (err) {
          console.log('Events not available');
        }

        try {
          const injuriesData = await getFixtureInjuries(fixtureId, sport);
          setInjuries(injuriesData.response);
        } catch (err) {
          console.log('Injuries not available');
        }

        try {
          const predictionData = await getFixturePrediction(fixtureId, sport);
          setPrediction(predictionData.response[0]);
        } catch (err) {
          console.log('Prediction not available');
        }
      }

      // ✅ HOCKEY-ONLY FEATURES
      if (sport === 'hockey') {
        try {
          const eventsData = await getFixtureEvents(fixtureId, sport);
          setEvents(eventsData.response);
        } catch (err) {
          console.log('Events not available for hockey');
        }
      }

      // ✅ LOAD ODDS FOR FOOTBALL, BASKETBALL, HOCKEY, VOLLEYBALL & HANDBALL
      if (
        sport === 'football' ||
        sport === 'basketball' ||
        sport === 'hockey' ||
        sport === 'volleyball' ||
        sport === 'handball'
      ) {
        try {
          const oddsData = await getFixtureOdds(fixtureId, sport);
          setOdds(oddsData);
        } catch (err) {
          console.log('Odds not available');
        }
      }



      setLoading(false);
    } catch (error) {
      console.error('Error loading fixture details:', error);
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
        <ShimmerCard key={i} />
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab fixture={fixture} venueDetails={venueDetails} lineups={lineups} sport={sport} navigation={navigation} />;
      case 'stats':
        return <StatsTab statistics={statistics} sport={sport} />;
      case 'events':
        return <EventsTab events={events} />;
      case 'lineups':
        return <LineupsTab lineups={lineups} sport={sport} navigation={navigation} />;
      case 'h2h':
        return <H2HTab h2h={h2h} sport={sport} />;
      case 'odds':
        return <OddsTab odds={odds} sport={sport} />;
      case 'injuries':
        return <InjuriesTab injuries={injuries} />;
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
