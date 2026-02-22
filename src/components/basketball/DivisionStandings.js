import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StandingsTable from './StandingsTable';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const DivisionStandings = ({ standings, onTeamPress }) => {
  if (!standings || standings.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="trophy-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No division standings available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {standings.map((division, index) => {
        if (!division || division.length === 0) return null;

        // ✅ FIXED: Safely extract group name (handle both object and string)
        const firstTeam = division[0];
        const groupData = firstTeam?.group;

        // Handle both cases: group could be an object {name, points} or a string
        let divisionName;
        if (typeof groupData === 'object' && groupData !== null) {
          divisionName = groupData.name || 'Unknown Division';
        } else if (typeof groupData === 'string') {
          divisionName = groupData;
        } else {
          divisionName = `Division ${index + 1}`;
        }

        const teams = division;

        return (
          <View key={index} style={styles.divisionSection}>
            <View style={styles.divisionHeader}>
              <Icon
                name="format-list-numbered"
                size={isTablet ? 26 : 22}
                color="#ff9800"
              />
              <Text style={styles.divisionName}>{divisionName}</Text>
              <View style={styles.divisionCount}>
                <Text style={styles.divisionCountText}>{teams.length}</Text>
              </View>
            </View>

            <StandingsTable teams={teams} onTeamPress={onTeamPress} />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  divisionSection: {
    marginBottom: isTablet ? 32 : 24,
  },
  divisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
    paddingHorizontal: isTablet ? 4 : 0,
  },
  divisionName: {
    color: '#fff',
    fontSize: isTablet ? 22 : 18,
    fontWeight: '900',
    marginLeft: isTablet ? 16 : 12,
    flex: 1,
  },
  divisionCount: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: isTablet ? 18 : 16,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divisionCountText: {
    color: '#ff9800',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '900',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 80,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginTop: isTablet ? 24 : 20,
  },
});

export default DivisionStandings;
