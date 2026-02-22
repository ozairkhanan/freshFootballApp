import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StandingsTable from './StandingsTable';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// ✅ Helper function to safely get group name
const getGroupName = group => {
  if (!group) return 'Unknown';
  if (typeof group === 'string') return group;
  if (typeof group === 'object' && group.name) return group.name;
  return 'Unknown';
};

const ConferenceStandings = ({ standings, onTeamPress }) => {
  if (!standings || standings.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="trophy-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No standings available</Text>
      </View>
    );
  }

  // ✅ FIXED: Filter for conferences only, handle object group structure
  const conferenceGroups = standings.filter(group => {
    if (!group || group.length === 0) return false;
    const groupName = getGroupName(group[0]?.group);
    return groupName.toLowerCase().includes('conference');
  });

  // If no conference groups found, show all groups
  const groupsToShow =
    conferenceGroups.length > 0 ? conferenceGroups : standings;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {groupsToShow.map((group, index) => {
        if (!group || group.length === 0) return null;

        // ✅ FIXED: Safely get conference name as STRING
        const conferenceName = getGroupName(group[0]?.group);

        return (
          <View key={conferenceName + index} style={styles.conferenceSection}>
            <View style={styles.conferenceHeader}>
              <Icon
                name={
                  conferenceName.toLowerCase().includes('east')
                    ? 'arrow-right-bold'
                    : 'arrow-left-bold'
                }
                size={isTablet ? 28 : 24}
                color="#ff9800"
              />
              <Text style={styles.conferenceName}>{conferenceName}</Text>
              <View style={styles.conferenceCount}>
                <Text style={styles.conferenceCountText}>
                  {group.length} Teams
                </Text>
              </View>
            </View>

            <StandingsTable teams={group} onTeamPress={onTeamPress} />
          </View>
        );
      })}

      {/* Playoff Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.playoffIndicator} />
          <Text style={styles.legendText}>Playoff Position (Top 8)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
  },
  conferenceSection: {
    marginBottom: isTablet ? 32 : 24,
  },
  conferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
    paddingHorizontal: isTablet ? 4 : 0,
  },
  conferenceName: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '900',
    marginLeft: isTablet ? 16 : 12,
    flex: 1,
  },
  conferenceCount: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: isTablet ? 16 : 12,
  },
  conferenceCountText: {
    color: '#ff9800',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '700',
  },
  legend: {
    marginTop: isTablet ? 24 : 20,
    marginBottom: isTablet ? 16 : 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playoffIndicator: {
    width: isTablet ? 16 : 14,
    height: isTablet ? 16 : 14,
    borderRadius: isTablet ? 8 : 7,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 1,
    borderColor: '#4caf50',
    marginRight: isTablet ? 12 : 10,
  },
  legendText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
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

export default ConferenceStandings;
