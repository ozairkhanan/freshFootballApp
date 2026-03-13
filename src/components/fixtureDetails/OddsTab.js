import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, SectionHeader, EmptyState, LoadingCard } from '../common/CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const OddsTab = ({ odds, sport = 'football' }) => {
  if (odds === undefined || odds === null) {
    return (
      <View style={styles.container}>
        <LoadingCard sport={sport} />
        <Text style={styles.loadingText}>Loading latest odds...</Text>
      </View>
    );
  }

  if (!odds || !odds.response || (Array.isArray(odds.response) && odds.response.length === 0)) {
    return (
      <EmptyState
        icon="dice-5-outline"
        title="Odds not available"
        subtitle="Check back closer to match day for live betting odds"
      />
    );
  }

  // Basic implementation to show something
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card sportColor="#00ffe7">
        <SectionHeader title="Match Odds" icon="dice-5" sportColor="#00ffe7" />
        <Text style={styles.infoText}>Live odds data is being updated.</Text>
      </Card>
      {/* Dynamic odds rendering would go here */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 10 },
  infoText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginVertical: 10 },
});

export default OddsTab;
