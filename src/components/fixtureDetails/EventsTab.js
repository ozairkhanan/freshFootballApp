import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const EventsTab = ({ events, sport = 'football' }) => {
  if (!events || events.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="time-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No events available</Text>
      </View>
    );
  }

  // ✅ Route to sport-specific events
  if (sport === 'hockey') {
    return <HockeyEvents events={events} />;
  }

  return <FootballEvents events={events} />;
};

// ✅ HOCKEY EVENTS
const HockeyEvents = ({ events }) => {
  // Get event icon based on type
  const getEventIcon = type => {
    switch (type?.toLowerCase()) {
      case 'goal':
        return { name: 'hockey-puck', color: '#4caf50', library: 'MIcon' };
      case 'penalty':
        return { name: 'close-circle-outline', color: '#f44336', library: 'MIcon' };
      case 'assist':
        return { name: 'account-plus-outline', color: '#ff9800', library: 'MIcon' };
      default:
        return { name: 'circle-outline', color: '#00bcd4' };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.card, { borderColor: 'rgba(0, 188, 212, 0.2)' }]}>
        <View style={styles.cardHeader}>
          <Icon
            name="time-outline"
            size={isTablet ? 28 : 24}
            color="#00bcd4"
          />
          <Text style={styles.cardTitle}>Game Events</Text>
        </View>

        {events.map((event, index) => {
          const icon = getEventIcon(event.type);

          return (
            <View key={index} style={styles.eventRow}>
              {/* Time/Period */}
              <View style={styles.eventTime}>
                <Text style={styles.eventPeriod}>{event.period || '-'}</Text>
                <Text style={styles.eventMinute}>{event.minute || ''}</Text>
              </View>

              {/* Icon */}
              <View
                style={[
                  styles.eventIconContainer,
                  { backgroundColor: `${icon.color}20` },
                ]}
              >
                {icon.library === 'MIcon' ? (
                  <MIcon
                    name={icon.name}
                    size={isTablet ? 20 : 18}
                    color={icon.color}
                  />
                ) : (
                  <Icon
                    name={icon.name}
                    size={isTablet ? 20 : 18}
                    color={icon.color}
                  />
                )}
              </View>

              {/* Details */}
              <View style={styles.eventDetails}>
                <Text style={styles.eventType}>{event.type || 'Event'}</Text>

                {/* Players */}
                {event.players && event.players.length > 0 && (
                  <Text style={styles.eventPlayer}>
                    {event.players.join(', ')}
                  </Text>
                )}

                {/* Assists */}
                {event.assists && event.assists.length > 0 && (
                  <Text style={styles.eventAssist}>
                    Assist: {event.assists.join(', ')}
                  </Text>
                )}

                {/* Comment/Reason */}
                {event.comment && (
                  <Text style={styles.eventComment}>{event.comment}</Text>
                )}

                {/* Team */}
                {event.team && (
                  <View style={styles.eventTeam}>
                    {event.team.logo && (
                      <Image
                        source={{ uri: event.team.logo }}
                        style={styles.eventTeamLogo}
                      />
                    )}
                    <Text style={styles.eventTeamName}>{event.team.name}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

// ✅ FOOTBALL EVENTS
const FootballEvents = ({ events }) => {
  const getEventIcon = (type, detail) => {
    switch (type) {
      case 'Goal':
        if (detail === 'Own Goal') return { name: 'football', color: '#f44336', library: 'Ionicons' };
        if (detail === 'Penalty') return { name: 'football', color: '#ff9800', library: 'Ionicons' };
        return { name: 'football', color: '#4caf50', library: 'Ionicons' };
      case 'Card':
        if (detail === 'Yellow Card') return { name: 'card', color: '#ffeb3b', library: 'Ionicons' };
        if (detail === 'Red Card') return { name: 'card', color: '#f44336', library: 'Ionicons' };
        return { name: 'card', color: '#ff9800', library: 'Ionicons' };
      case 'subst':
        return { name: 'repeat', color: '#2196f3', library: 'Ionicons' };
      case 'Var':
        return { name: 'videocam-outline', color: '#9c27b0', library: 'Ionicons' };
      default:
        return { name: 'ellipse-outline', color: '#00ffe7', library: 'Ionicons' };
    }
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['#00ffe7', '#00d2ff']}
            style={styles.headerIconContainer}
          >
            <Icon name="flash-outline" size={isTablet ? 20 : 18} color="#fff" />
          </LinearGradient>
          <Text style={styles.cardTitle}>Match Events</Text>
        </View>

        {events.map((event, index) => {
          const icon = getEventIcon(event.type, event.detail);

          return (
            <View key={index} style={styles.eventRow}>
              <View style={styles.eventTime}>
                <Text style={styles.eventMinute}>
                  {event.time?.elapsed || '-'}'
                </Text>
              </View>

              <View
                style={[
                  styles.eventIconContainer,
                  { backgroundColor: `${icon.color}20` },
                ]}
              >
                {icon.name === 'card' ? (
                  <View style={[styles.realCard, { backgroundColor: icon.color }]} />
                ) : (
                  <Icon
                    name={icon.name}
                    size={isTablet ? 20 : 18}
                    color={icon.color}
                  />
                )}
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.eventHeaderRow}>
                  <Text style={styles.eventType}>{event.type}</Text>
                  {event.team?.name && (
                    <View style={styles.eventTeamBadge}>
                      {event.team.logo && (
                        <Image
                          source={{ uri: event.team.logo }}
                          style={styles.eventTeamLogoSmall}
                        />
                      )}
                      <Text style={styles.eventTeamNameSmall} numberOfLines={1}>
                        {event.team.name}
                      </Text>
                    </View>
                  )}
                </View>

                {event.player?.name && (
                  <Text style={styles.eventPlayer}>{event.player.name}</Text>
                )}
                {event.assist?.name && (
                  <Text style={styles.eventAssist}>Assist: {event.assist.name}</Text>
                )}
                {event.detail && (
                  <Text style={styles.eventComment}>{event.detail}</Text>
                )}
              </View>

            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 24 : 16,
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
  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.8)',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 24 : 20,
    marginBottom: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerIconContainer: {
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    borderRadius: isTablet ? 12 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '800',
  },
  realCard: {
    width: 14,
    height: 18,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: isTablet ? 14 : 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  eventTime: {
    width: isTablet ? 50 : 45,
    alignItems: 'center',
  },
  eventPeriod: {
    color: '#00bcd4',
    fontSize: isTablet ? 12 : 10,
    fontWeight: '700',
  },
  eventMinute: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  eventIconContainer: {
    width: isTablet ? 40 : 36,
    height: isTablet ? 40 : 36,
    borderRadius: isTablet ? 20 : 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: isTablet ? 12 : 10,
  },
  eventDetails: {
    flex: 1,
  },
  eventType: {
    color: '#fff',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  eventPlayer: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: isTablet ? 14 : 13,
    fontWeight: '600',
    marginTop: 2,
  },
  eventAssist: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
    marginTop: 2,
  },
  eventComment: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 13 : 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  eventTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  eventTeamLogo: {
    width: isTablet ? 20 : 18,
    height: isTablet ? 20 : 18,
    borderRadius: isTablet ? 10 : 9,
    marginRight: 6,
  },
  eventTeamName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: isTablet ? 12 : 11,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  eventTeamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    maxWidth: '50%',
  },
  eventTeamLogoSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 4,
  },
  eventTeamNameSmall: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
});


export default EventsTab;
