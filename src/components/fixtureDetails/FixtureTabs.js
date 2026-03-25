import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// ✅ Define available tabs per sport
const SPORT_TABS = {
  football: [
    'overview',
    'stats',
    'commentary',
    'events',
    'lineups',
    'h2h',
    'odds',
    'injuries',
    'prediction',
  ],

  basketball: ['overview', 'stats', 'lineups', 'h2h', 'odds'],
  tennis: ['overview', 'stats', 'timeline', 'h2h', 'odds'],
  cricket: ['overview', 'stats', 'timeline', 'h2h', 'odds'],
  hockey: ['overview', 'stats', 'events', 'h2h', 'odds'],
  volleyball: ['overview', 'h2h', 'odds'],
  mma: ['overview'],
  // ✅ Handball: Added odds
  handball: ['overview', 'h2h', 'odds'],
};

const TAB_LABELS = {
  overview: 'Overview',
  stats: 'Stats',
  timeline: 'Timeline',
  commentary: 'Commentary',
  events: 'Events',
  lineups: 'Lineups',
  h2h: 'H2H',
  odds: 'Odds',
  injuries: 'Injuries',
  prediction: 'Prediction',
};

// ✅ Sport-specific colors
const SPORT_COLORS = {
  football: '#00ffe7',
  basketball: '#ff9800',
  hockey: '#00bcd4',
  volleyball: '#9c27b0',
  mma: '#f44336',
  handball: '#4caf50', // ✅ Green for handball
  tennis: '#A1FF0F',
  cricket: '#ffeb3b',
};

const FixtureTabs = ({ sport, activeTab, onTabChange }) => {
  const availableTabs = SPORT_TABS[sport] || SPORT_TABS.football;
  const accentColor = SPORT_COLORS[sport] || SPORT_COLORS.football;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {availableTabs.map(tab => {
          const isActive = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.7}
              style={[
                styles.tab,
                isActive && [
                  styles.tabActive,
                  { borderBottomColor: accentColor },
                ],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && [styles.tabTextActive, { color: accentColor }],
                ]}
              >
                {TAB_LABELS[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabsContainer: {
    paddingHorizontal: isTablet ? 20 : 12,
  },
  tab: {
    paddingHorizontal: isTablet ? 20 : 16,
    paddingVertical: isTablet ? 14 : 12,
    marginRight: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#00ffe7',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#00ffe7',
    fontWeight: '700',
  },
});

export default FixtureTabs;
