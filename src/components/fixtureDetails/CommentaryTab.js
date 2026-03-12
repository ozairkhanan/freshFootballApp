import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Card, EmptyState } from '../common/CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const CommentaryTab = ({ commentary, sport = 'football' }) => {
  if (!commentary || commentary.length === 0) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <EmptyState 
          title="No commentary available" 
          icon="microphone-off" 
          message="Live text commentary will appear here once the match starts."
        />
      </ScrollView>
    );
  }

  // Helper to get icon based on tlive type
  const getCommentaryIcon = (type) => {
    // Types based on theSports API docs for tlive
    switch (type) {
      case 1: // Goal
        return { name: 'football', color: '#4caf50' };
      case 2: // Corner
        return { name: 'flag', color: '#00ffe7' };
      case 3: // Yellow Card
        return { name: 'card', color: '#ffeb3b' };
      case 4: // Red Card
        return { name: 'card', color: '#f44336' };
      case 7: // Substitution
        return { name: 'swap-horizontal', color: '#2196f3', library: 'MIcon' };
      case 11: // Penalty
        return { name: 'dot-circle', color: '#ff9800', library: 'MIcon' };
      default:
        return { name: 'chatbox-ellipses-outline', color: 'rgba(255,255,255,0.4)' };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card sportColor="#00ffe7">
        <View style={styles.header}>
          <LinearGradient
            colors={['#00ffe7', '#00d2ff']}
            style={styles.headerIcon}
          >
            <Icon name="mic-outline" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Live Commentary</Text>
        </View>

        {commentary.map((item, index) => {
          const icon = getCommentaryIcon(item.type);
          const isHome = item.position === 1;
          const isAway = item.position === 2;

          return (
            <View key={index} style={styles.commentaryRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{item.time}'</Text>
                <View style={styles.timeline} />
              </View>

              <View style={styles.contentColumn}>
                <View style={[
                  styles.bubble,
                  isHome && styles.homeBubble,
                  isAway && styles.awayBubble
                ]}>
                  <View style={styles.bubbleHeader}>
                    {icon.library === 'MIcon' ? (
                      <MIcon name={icon.name} size={16} color={icon.color} />
                    ) : (
                      <Icon name={icon.name} size={16} color={icon.color} />
                    )}
                    <Text style={[styles.typeText, { color: icon.color }]}>
                      {isHome ? 'Home' : isAway ? 'Away' : 'Match'}
                    </Text>
                  </View>
                  <Text style={styles.commentaryText}>{item.data}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Card>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  commentaryRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timeColumn: {
    width: 50,
    alignItems: 'center',
  },
  timeText: {
    color: '#00ffe7',
    fontSize: 14,
    fontWeight: '800',
    backgroundColor: 'rgba(0, 255, 231, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeline: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 4,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 20,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  homeBubble: {
    borderLeftWidth: 3,
    borderLeftColor: '#00ffe7',
  },
  awayBubble: {
    borderLeftWidth: 3,
    borderLeftColor: '#ff4b81',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  commentaryText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CommentaryTab;
