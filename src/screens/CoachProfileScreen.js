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
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import { getCoaches } from '../api/sportsApi';
import { LoadingCard } from '../components/common/CommonUI';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const CoachProfileScreen = ({ route, navigation }) => {
  const { coachId, teamId } = route.params;

  const [loading, setLoading] = useState(true);
  const [coachData, setCoachData] = useState(null);

  useEffect(() => {
    fetchCoachData();
  }, [coachId]);

  const fetchCoachData = async () => {
    try {
      setLoading(true);
      const data = await getCoaches({ id: coachId });
      if (data.response && data.response.length > 0) {
        setCoachData(data.response[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coach data:', error);
      setLoading(false);
    }
  };

  const renderHeader = () => {
    if (!coachData) return null;

    return (
      <View style={styles.headerProfile}>
        <View style={styles.photoContainer}>
          <Image
            source={{
              uri:
                coachData.photo ||
                `https://media.api-sports.io/football/coachs/${coachData.id}.png`,
            }}
            style={styles.coachPhoto}
          />
        </View>
        <Text style={styles.coachName}>{coachData.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon name="calendar" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaText}>{coachData.age} Years</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Icon name="flag" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.metaText}>{coachData.nationality}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCareerHistory = () => {
    if (!coachData || !coachData.career || coachData.career.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon
            name="briefcase-outline"
            size={60}
            color="rgba(255,255,255,0.2)"
          />
          <Text style={styles.emptyText}>No career history available</Text>
        </View>
      );
    }

    return (
      <View style={styles.careerContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="history" size={20} color="#00ffe7" />
            <Text style={styles.cardTitle}>Career History</Text>
          </View>

          {coachData.career.map((entry, index) => (
            <View key={index} style={styles.careerItem}>
              <View style={styles.careerDotContainer}>
                <View
                  style={[styles.careerDot, index === 0 && styles.currentDot]}
                />
                {index < coachData.career.length - 1 && (
                  <View style={styles.careerLine} />
                )}
              </View>

              <View style={styles.careerContent}>
                <View style={styles.teamInfo}>
                  <Image
                    source={{ uri: entry.team.logo }}
                    style={styles.teamLogo}
                  />
                  <Text style={styles.teamName}>{entry.team.name}</Text>
                </View>
                <View style={styles.periodRow}>
                  <Icon
                    name="calendar-range"
                    size={12}
                    color="rgba(255,255,255,0.4)"
                  />
                  <Text style={styles.periodText}>
                    {entry.start} — {entry.end || 'Present'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={gradients.background} style={styles.background}>
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.shimmerBox}>
            <LoadingCard />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={gradients.background} style={styles.background}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.navBtn}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Coach Profile</Text>
          <View style={styles.navBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {renderHeader()}
          {renderCareerHistory()}
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
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },

  headerProfile: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  photoContainer: {
    marginBottom: 20,
  },
  coachPhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#00ffe7',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  coachName: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },

  careerContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(29, 45, 44, 0.9)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  careerItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  careerDotContainer: {
    alignItems: 'center',
    width: 20,
    marginRight: 16,
  },
  careerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 6,
  },
  currentDot: {
    backgroundColor: '#00ffe7',
    transform: [{ scale: 1.2 }],
    shadowColor: '#00ffe7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  careerLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  careerContent: {
    flex: 1,
    paddingBottom: 24,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  teamLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  periodText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '600',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  shimmerBox: {
    padding: 16,
  },
});

export default CoachProfileScreen;
