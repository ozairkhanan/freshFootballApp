import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
// Custom Tab Icon with Vector Icon support
const TabIcon = ({ iconName, focused, isLive }) => {
  const activeColor = '#A1FF0F'; // Neon Green matching the design

  if (isLive) {
    return (
      <View style={styles.liveIconContainer}>
        <Icon
          name="broadcast"
          size={20}
          color="#ff1744"
          style={styles.liveBroadcastIcon}
        />
        <View style={styles.liveIconBadge}>
          <Text style={styles.liveIconText}>LIVE</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabIconContainer}>
      <Icon
        name={iconName}
        size={ICON_SIZE}
        color={focused ? activeColor : '#ffffff'}
        style={focused ? styles.iconFocused : null}
      />
    </View>
  );
};

const BottomTabNavigator = () => {
  const [selectedSport, setSelectedSport] = useState('football');

  const handleSportChange = newSport => {
    setSelectedSport(newSport);
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#A1FF0F', // Neon Green
        tabBarInactiveTintColor: '#ffffff',
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
        tabBarBackground: () => (
          <View style={styles.tabBarBackgroundContainer}>
            {/* Footer background - #202a28 */}
            <View style={styles.tabBarGradient} />
            {/* Top Border - stroke #545e5c size 2pt */}
            <View style={styles.tabBarBorder} />
          </View>
        ),
      }}
    >
      {/* 1. HOME tab */}
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home-outline" focused={focused} />
          ),
        }}
      >
        {({ navigation }) => (
          <HomeScreen
            filter="all"
            selectedSport={selectedSport}
            onSportChange={handleSportChange}
            navigation={navigation}
          />
        )}
      </Tab.Screen>

      {/* 2. LIVE tab */}
      <Tab.Screen
        name="Live"
        options={{
          tabBarLabel: 'Live',
          tabBarIcon: ({ focused }) => (
            <TabIcon isLive={true} focused={focused} />
          ),
          tabBarLabelStyle: { display: 'none' },
        }}
      >
        {({ navigation }) => (
          <HomeScreen
            filter="live"
            selectedSport={selectedSport}
            onSportChange={handleSportChange}
            navigation={navigation}
          />
        )}
      </Tab.Screen>

      {/* 3. FINISHED tab */}
      <Tab.Screen
        name="Finished"
        options={{
          tabBarLabel: 'Finished',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="check-circle-outline" focused={focused} />
          ),
        }}
      >
        {({ navigation }) => (
          <HomeScreen
            filter="finished"
            selectedSport={selectedSport}
            onSportChange={handleSportChange}
            navigation={navigation}
          />
        )}
      </Tab.Screen>

      {/* 4. UPCOMING tab */}
      <Tab.Screen
        name="Upcoming"
        options={{
          tabBarLabel: 'Upcoming',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="calendar-clock" focused={focused} />
          ),
        }}
      >
        {({ navigation }) => (
          <HomeScreen
            filter="upcoming"
            selectedSport={selectedSport}
            onSportChange={handleSportChange}
            navigation={navigation}
          />
        )}
      </Tab.Screen>

      {/* 5. FOLLOWING tab */}
      <Tab.Screen
        name="Following"
        options={{
          tabBarLabel: 'Following',
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="heart-outline" focused={focused} />
          ),
        }}
      >
        {({ navigation }) => (
          <HomeScreen
            filter="following"
            selectedSport={selectedSport}
            onSportChange={handleSportChange}
            navigation={navigation}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.select({
      ios: isTablet ? 100 : 85, // Extra space for iOS home indicator
      android: isTablet ? 90 : 80,
    }),
    paddingBottom: Platform.select({
      ios: isTablet ? 22 : 20, // Extra padding for iOS home indicator
      android: isTablet ? 12 : 10,
    }),
    paddingTop: 12,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBackgroundContainer: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBarGradient: {
    flex: 1,
    backgroundColor: '#202a28', // Footer background color
  },
  tabBarBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2, // Stroke size 2pt
    backgroundColor: '#545e5c', // Footer stroke color
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },

  // Icon Styles - same sizes as original Icon component (24px mobile, 28px tablet)
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tabImage: {
    width: isTablet ? 28 : 24, // Same as Icon size
    height: isTablet ? 28 : 24, // Same as Icon size
    resizeMode: 'contain',
  },
  iconFocused: {
    shadowColor: '#A1FF0F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },

  // Custom Live Icon
  liveIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    height: '100%',
  },
  liveBroadcastIcon: {
    marginBottom: 0,
    marginTop: 0,
  },
  liveIconBadge: {
    backgroundColor: '#ff1744',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 28,
    alignItems: 'center',
    marginTop: 2,
  },
  liveIconText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

export default BottomTabNavigator;
