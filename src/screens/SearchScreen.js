import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import { searchTeams, searchLeagues } from '../api/sportsApi';
import {
  isTablet,
  isLargeTablet,
  getHorizontalPadding,
  getMaxContentWidth,
} from '../utils/responsive';

const { width } = Dimensions.get('window');

const SPORTS = [
  {
    key: 'football',
    label: 'Foot Ball',
    icon: 'soccer',
    color: '#00ffe7',
  },
  {
    key: 'basketball',
    label: 'Basketball',
    icon: 'basketball',
    color: '#00ffe7',
  },
  {
    key: 'hockey',
    label: 'Hockey',
    icon: 'hockey-puck',
    color: '#00ffe7',
  },
  {
    key: 'volleyball',
    label: 'Volleyball',
    icon: 'volleyball',
    color: '#00ffe7',
  },
  {
    key: 'handball',
    label: 'Handball',
    icon: 'handball',
    color: '#00ffe7',
  },
];

const TABS = [
  { key: 'player', label: 'Player' },
  { key: 'league', label: 'League' },
  { key: 'match', label: 'Match' },
];

const SearchScreen = ({ navigation, route }) => {
  const initialSport = route.params?.sport || 'football';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('player');
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const getCurrentSport = () =>
    SPORTS.find(s => s.key === selectedSport) || SPORTS[0];

  const toggleFavorite = id => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id],
    );
  };

  const handleSearch = async text => {
    setSearchQuery(text);
    if (text.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      let data;
      if (activeTab === 'player' || activeTab === 'match') {
        data = await searchTeams(text, selectedSport);
      } else {
        data = await searchLeagues(text, selectedSport);
      }

      setResults(data.response || []);
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
      setResults([]);
    }
  };

  const renderSportDropdown = () => (
    <View style={styles.sportDropdownContainer}>
      <TouchableOpacity
        style={styles.sportDropdown}
        onPress={() => setShowSportDropdown(!showSportDropdown)}
      >
        <View style={[styles.sportIconWrapper, { backgroundColor: `${getCurrentSport().color}25` }]}>
          <Icon name={getCurrentSport().icon} size={16} color={getCurrentSport().color} />
        </View>
        <Text style={styles.sportDropdownText}>{getCurrentSport().label}</Text>
        <Icon
          name={showSportDropdown ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#1a3a38"
        />
      </TouchableOpacity>

      {showSportDropdown && (
        <View style={styles.dropdownList}>
          {SPORTS.map(sport => (
            <TouchableOpacity
              key={sport.key}
              style={[
                styles.dropdownItem,
                selectedSport === sport.key && styles.dropdownItemActive,
              ]}
              onPress={() => {
                setSelectedSport(sport.key);
                setShowSportDropdown(false);
                setResults([]);
                setHasSearched(false);
              }}
            >
              <View style={[styles.sportIconDropdownWrapper, { backgroundColor: `${sport.color}15` }]}>
                <Icon name={sport.icon} size={18} color={sport.color} />
              </View>
              <Text style={styles.dropdownItemText}>{sport.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsRow}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => {
            setActiveTab(tab.key);
            setResults([]);
            setHasSearched(false);
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResultCard = (item, index) => {
    const itemData = item.team || item.league || item;
    const id = itemData.id;
    const name = itemData.name;
    const logo = itemData.logo;
    const country = itemData.country || item.country?.name || '';
    const isFavorite = favorites.includes(id);

    return (
      <TouchableOpacity
        key={index}
        style={styles.resultCard}
        onPress={() => {
          if (activeTab === 'league') {
            navigation.navigate('Standings', {
              leagueId: id,
              leagueName: name,
              season: new Date().getFullYear(),
              sport: selectedSport,
            });
          } else {
            navigation.navigate('TeamProfile', {
              teamId: id,
              teamName: name,
              sport: selectedSport,
            });
          }
        }}
      >
        <View style={styles.cardLeft}>
          <View style={styles.logoCircle}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoImg} />
            ) : (
              <Icon name="shield-outline" size={24} color="#00ffe7" />
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.cardMeta}>
              <Icon name={getCurrentSport().icon} size={14} color={getCurrentSport().color} />
              <Text style={styles.cardMetaText}>
                {country ? `${country} • ` : ''}
                {getCurrentSport().label}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(id)}
          style={styles.favoriteBtn}
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color="#00ffe7"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        <View style={styles.contentWrapper}>
          {/* Header with Back and Search */}
          <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Icon name="magnify" size={22} color="#5a7a78" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#8aa8a6"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Sport Dropdown and Tabs */}
        <View style={styles.filterRow}>
          {renderSportDropdown()}
          {renderTabs()}
        </View>

        {/* Results */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#00ffe7" />
            </View>
          ) : !hasSearched ? (
            <View style={styles.centerBox}>
              <Icon name="magnify" size={80} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyText}>Search for {activeTab}s</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.centerBox}>
              <Icon
                name="alert-circle-outline"
                size={80}
                color="rgba(255,255,255,0.15)"
              />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : (
            <View style={styles.resultsList}>
              {results.map(renderResultCard)}
            </View>
          )}
        </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1a18',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: { flex: 1 },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: getMaxContentWidth(),
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: isTablet ? 16 : 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a4a48',
  },
  searchInput: {
    flex: 1,
    color: '#1a3a38',
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 0,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: isTablet ? 16 : 12,
    gap: isTablet ? 16 : 12,
    zIndex: 100,
  },
  sportDropdownContainer: {
    position: 'relative',
    zIndex: 100,
  },
  sportDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  sportDropdownText: {
    color: '#1a3a38',
    fontSize: 13,
    fontWeight: '600',
  },
  sportIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  sportIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportIconDropdownWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportIconSmall: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  sportIconDropdown: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    backgroundColor: '#1c2e2c',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a4a48',
    padding: 6,
    minWidth: 150,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 25,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#00ffe7',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 22,
  },
  tabActive: {
    backgroundColor: '#00d4b8',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  scrollView: { flex: 1 },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 16,
  },

  resultsList: {
    padding: getHorizontalPadding(),
    gap: isTablet ? 16 : 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1c2e2c',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2a4a48',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a1a18',
    borderWidth: 2,
    borderColor: '#2a4a48',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  favoriteBtn: {
    padding: 8,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(0, 255, 231, 0.15)',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SearchScreen;
