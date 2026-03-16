import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import FixtureDetailsScreen from './src/screens/FixtureDetailsScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import SearchScreen from './src/screens/SearchScreen';
import TeamProfileScreen from './src/screens/TeamProfileScreen';
import PlayerProfileScreen from './src/screens/PlayerProfileScreen';
import CoachProfileScreen from './src/screens/CoachProfileScreen';
import TransferMarketScreen from './src/screens/TransferMarketScreen';
import BasketballStandingsScreen from './src/screens/BasketballStandingsScreen';
import VolleyballStandingsScreen from './src/screens/VolleyballStandingsScreen';
import HandballStandingsScreen from './src/screens/HandballStandingsScreen';
import HockeyStandingsScreen from './src/screens/HockeyStandingsScreen';
import BrowseBasketballScreen from './src/screens/BrowseBasketballScreen';
import SplashScreen from './src/screens/SplashScreen';

import SplashAdScreen from './src/screens/SplashAdScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showAd, setShowAd] = useState(true); 

  // 1. First show the static branding logo (SplashScreen)
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Next, fire up the video ad check
  if (showAd) {
    return <SplashAdScreen onFinish={() => setShowAd(false)} />;
  }

  // 3. Finally render the main app
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="FixtureDetails"
          component={FixtureDetailsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="Standings"
          component={StandingsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="BasketballStandings"
          component={BasketballStandingsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="VolleyballStandings"
          component={VolleyballStandingsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        {/* ✅ NEW: Handball Standings */}
        <Stack.Screen
          name="HandballStandings"
          component={HandballStandingsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        {/* ✅ NEW: Hockey Standings */}
        <Stack.Screen
          name="HockeyStandings"
          component={HockeyStandingsScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />

        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="TeamProfile"
          component={TeamProfileScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="PlayerProfile"
          component={PlayerProfileScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="CoachProfile"
          component={CoachProfileScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="TransferMarket"
          component={TransferMarketScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        {/* ✅ NEW: Browse Basketball Leagues/Countries */}
        <Stack.Screen
          name="BrowseBasketball"
          component={BrowseBasketballScreen}
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
