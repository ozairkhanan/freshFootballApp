import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import {
  getBasketballCountries,
  getBasketballLeagues,
  getBasketballSeasons,
} from '../api/sportsApi';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const BrowseBasketballScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('leagues');
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('2024-2025');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchLeaguesByCountry(selectedCountry);
    }
  }, [selectedCountry, selectedSeason]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch countries and seasons in parallel
      const [countriesData, seasonsData] = await Promise.all([
        getBasketballCountries(),
        getBasketballSeasons(),
      ]);

      if (countriesData.response) {
        setCountries(countriesData.response);
      }

      if (seasonsData.response) {
        const sorted = seasonsData.response.sort((a, b) => {
          const yearA = parseInt(a.toString().split('-')[0]);
          const yearB = parseInt(b.toString().split('-')[0]);
          return yearB - yearA;
        });
        setSeasons(sorted.slice(0, 5));
        if (sorted.length > 0) {
          setSelectedSeason(sorted[0]);
        }
      }

      // Fetch all leagues initially
      const leaguesData = await getBasketballLeagues({
        season: selectedSeason,
      });
      if (leaguesData.response) {
        setLeagues(leaguesData.response);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchLeaguesByCountry = async countryId => {
    try {
      setLoading(true);
      const leaguesData = await getBasketballLeagues({
        country_id: countryId,
        season: selectedSeason,
      });
      if (leaguesData.response) {
        setLeagues(leaguesData.response);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(league => {
    if (!searchQuery) return true;
    const name = league.name || league.league?.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredCountries = countries.filter(country => {
    if (!searchQuery) return true;
    return country.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderSeasonSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.seasonSelector}
      contentContainerStyle={styles.seasonSelectorContent}
    >
      {seasons.map(s => (
        <TouchableOpacity
          key={s}
          style={[
            styles.seasonChip,
            selectedSeason === s && styles.seasonChipActive,
          ]}
          onPress={() => setSelectedSeason(s)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.seasonChipText,
              selectedSeason === s && styles.seasonChipTextActive,
            ]}
          >
            {s}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'leagues' && styles.tabActive]}
        onPress={() => {
          setActiveTab('leagues');
          setSelectedCountry(null);
        }}
        activeOpacity={0.7}
      >
        <Icon
          name="trophy"
          size={isTablet ? 22 : 18}
          color={activeTab === 'leagues' ? '#ff9800' : 'rgba(255,255,255,0.5)'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'leagues' && styles.tabTextActive,
          ]}
        >
          Leagues
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'countries' && styles.tabActive]}
        onPress={() => setActiveTab('countries')}
        activeOpacity={0.7}
      >
        <Icon
          name="earth"
          size={isTablet ? 22 : 18}
          color={
            activeTab === 'countries' ? '#ff9800' : 'rgba(255,255,255,0.5)'
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'countries' && styles.tabTextActive,
          ]}
        >
          Countries
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeagueCard = (league, index) => {
    const leagueData = league.league || league;
    const countryData = league.country || {};

    return (
      <TouchableOpacity
        key={leagueData.id || index}
        style={styles.card}
        onPress={() => {
          navigation.navigate('BasketballStandings', {
            leagueId: leagueData.id,
            leagueName: leagueData.name,
            season: selectedSeason,
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          {leagueData.logo ? (
            <Image source={{ uri: leagueData.logo }} style={styles.cardLogo} />
          ) : (
            <View style={[styles.cardLogo, styles.cardLogoPlaceholder]}>
              <Icon name="trophy" size={24} color="#ff9800" />
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{leagueData.name}</Text>
            <View style={styles.cardMeta}>
              <Icon name="map-marker" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.cardMetaText}>
                {countryData.name || leagueData.country || 'International'}
              </Text>
              {leagueData.type && (
                <>
                  <Text style={styles.cardMetaDot}>•</Text>
                  <Text style={styles.cardMetaText}>{leagueData.type}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#ff9800" />
      </TouchableOpacity>
    );
  };

  const renderCountryCard = (country, index) => (
    <TouchableOpacity
      key={country.id || index}
      style={[
        styles.card,
        selectedCountry === country.id && styles.cardSelected,
      ]}
      onPress={() => {
        setSelectedCountry(country.id);
        setActiveTab('leagues');
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        {country.flag ? (
          <Image source={{ uri: country.flag }} style={styles.flagImage} />
        ) : (
          <View style={[styles.cardLogo, styles.cardLogoPlaceholder]}>
            <Icon name="flag" size={24} color="#ff9800" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{country.name}</Text>
          {country.code && (
            <Text style={styles.cardMetaText}>{country.code}</Text>
          )}
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#ff9800" />
    </TouchableOpacity>
  );

  if (loading && leagues.length === 0 && countries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={isTablet ? 28 : 24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🏀 Browse Basketball</Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff9800" />
            <Text style={styles.loadingText}>Loading basketball data...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={isTablet ? 28 : 24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏀 Browse Basketball</Text>
          <View style={styles.backButton} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon
                name="close-circle"
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Season Selector */}
        {activeTab === 'leagues' && renderSeasonSelector()}

        {/* Tabs */}
        {renderTabs()}

        {/* Selected Country Indicator */}
        {selectedCountry && activeTab === 'leagues' && (
          <TouchableOpacity
            style={styles.filterBadge}
            onPress={() => {
              setSelectedCountry(null);
              fetchInitialData();
            }}
          >
            <Icon name="filter-variant" size={16} color="#ff9800" />
            <Text style={styles.filterBadgeText}>Filtered by country</Text>
            <Icon name="close" size={16} color="#ff9800" />
          </TouchableOpacity>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff9800" />
            </View>
          ) : activeTab === 'leagues' ? (
            <View style={styles.cardsContainer}>
              <Text style={styles.sectionTitle}>
                {filteredLeagues.length} Leagues Available
              </Text>
              {filteredLeagues.map(renderLeagueCard)}
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              <Text style={styles.sectionTitle}>
                {filteredCountries.length} Countries
              </Text>
              {filteredCountries.map(renderCountryCard)}
            </View>
          )}
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
    paddingHorizontal: isTablet ? 24 : 16,
    paddingVertical: isTablet ? 20 : 16,
  },
  backButton: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 12 : 10,
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 16 : 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    marginLeft: isTablet ? 12 : 8,
  },
  seasonSelector: {
    maxHeight: isTablet ? 50 : 44,
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 16 : 12,
  },
  seasonSelectorContent: {
    gap: isTablet ? 10 : 8,
  },
  seasonChip: {
    backgroundColor: 'rgba(29, 45, 44, 0.6)',
    borderRadius: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 10 : 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  seasonChipActive: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: '#ff9800',
  },
  seasonChipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  seasonChipTextActive: {
    color: '#ff9800',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 16 : 12,
    gap: isTablet ? 12 : 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29, 45, 44, 0.6)',
    borderRadius: isTablet ? 14 : 12,
    paddingVertical: isTablet ? 14 : 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: '#ff9800',
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginLeft: isTablet ? 10 : 8,
  },
  tabTextActive: {
    color: '#ff9800',
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: 12,
    gap: 6,
  },
  filterBadgeText: {
    color: '#ff9800',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: { flex: 1 },
  cardsContainer: {
    padding: isTablet ? 24 : 16,
    paddingBottom: isTablet ? 40 : 32,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '700',
    marginBottom: isTablet ? 16 : 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 16 : 14,
    padding: isTablet ? 16 : 14,
    marginBottom: isTablet ? 12 : 10,
  },
  cardSelected: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderColor: '#ff9800',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,

  },
  cardLogo: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginRight: isTablet ? 16 : 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardLogoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  flagImage: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 32 : 28,
    borderRadius: 4,
    marginRight: isTablet ? 16 : 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: isTablet ? 17 : 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMetaText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
    marginLeft: 4,
  },
  cardMetaDot: {
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginTop: isTablet ? 20 : 16,
  },
});

export default BrowseBasketballScreen;
