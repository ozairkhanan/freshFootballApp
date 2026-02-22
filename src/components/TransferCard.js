import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const TransferCard = ({ transfer, playerName, onPlayerPress, onTeamPress }) => {
  const { date, type, teams } = transfer;
  const teamIn = teams?.in || {};
  const teamOut = teams?.out || {};

  const formatDateRange = dateStr => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const start = d.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    const end = new Date(d);
    end.setMonth(end.getMonth() + 1);
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
    return `${start} - ${endStr}`;
  };

  const TeamLogo = ({ logo }) => (
    <View style={styles.logoCircle}>
      {logo ? (
        <Image source={{ uri: logo }} style={styles.logoImg} />
      ) : (
        <Icon name="shield" size={18} color="#4a5a58" />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <LinearGradient
        colors={['#0d1a1a', '#1c2e2c', '#1c2e2c', '#0d1a1a']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.card}
      >
        {/* Player Name Tab - Trapezoid */}
        {playerName && (
          <TouchableOpacity
            style={styles.nameTab}
            onPress={onPlayerPress}
            activeOpacity={0.8}
          >
            <View style={styles.trapezoid}>
              <View style={styles.trapezoidLeft} />
              <View style={styles.trapezoidCenter}>
                <Text style={styles.playerName}>{playerName}</Text>
              </View>
              <View style={styles.trapezoidRight} />
            </View>
          </TouchableOpacity>
        )}

        {/* Content Row */}
        <View style={styles.content}>
          {/* Player Photo */}
          <View style={styles.photoWrap}>
            <View style={styles.photoBorder}>
              <Image
                source={{
                  uri: transfer.player?.id
                    ? `https://media.api-sports.io/football/players/${transfer.player.id}.png`
                    : 'https://via.placeholder.com/150',
                }}
                style={styles.photo}
              />
            </View>
          </View>

          {/* Date in Center */}
          <View style={styles.dateWrap}>
            <Text style={styles.dateText}>{formatDateRange(date)}</Text>
          </View>

          {/* Teams */}
          <View style={styles.teamsWrap}>
            {/* From Team */}
            <TouchableOpacity
              style={styles.teamRow}
              onPress={() => onTeamPress?.(teamOut.id)}
            >
              <View style={styles.teamPill}>
                <Text style={styles.teamText} numberOfLines={1}>
                  {teamOut.name || 'Unknown'}
                </Text>
              </View>
              <TeamLogo logo={teamOut.logo} />
            </TouchableOpacity>

            {/* Arrow */}
            <View style={styles.arrowWrap}>
              <Icon name="arrow-down" size={22} color="#fff" />
            </View>

            {/* To Team */}
            <TouchableOpacity
              style={styles.teamRow}
              onPress={() => onTeamPress?.(teamIn.id)}
            >
              <TeamLogo logo={teamIn.logo} />
              <View style={styles.teamPill}>
                <Text style={styles.teamText} numberOfLines={1}>
                  {teamIn.name || 'Unknown'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {type === 'Loan' ? 'End of loan' : type || 'Transfer'}
          </Text>
          <Text style={styles.footerText}>{transfer.fee || 'Free'}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: isTablet ? 24 : 16,
    marginBottom: isTablet ? 20 : 16,
    marginTop: isTablet ? 20 : 16,
  },
  card: {
    borderRadius: 20,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,

  },
  nameTab: {
    position: 'absolute',
    top: -1,
    alignSelf: 'center',
  },
  trapezoid: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  trapezoidLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 32,
    borderLeftWidth: 16,
    borderTopColor: '#1a4a45',
    borderLeftColor: 'transparent',
  },
  trapezoidCenter: {
    backgroundColor: '#1a4a45',
    height: 32,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trapezoidRight: {
    width: 0,
    height: 0,
    borderTopWidth: 32,
    borderRightWidth: 16,
    borderTopColor: '#1a4a45',
    borderRightColor: 'transparent',
  },
  playerName: {
    color: '#b8e8e8',
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoWrap: {
    flex: 0.35,
    alignItems: 'center',
  },
  photoBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3a5a58',
    backgroundColor: '#0a1a18',
    padding: 6,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  dateWrap: {
    flex: 0.35,
    alignItems: 'center',
  },
  dateText: {
    color: '#b8e8e8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamsWrap: {
    flex: 0.45,
    alignItems: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamPill: {
    backgroundColor: '#2a3a38',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  teamText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4a5a58',
    backgroundColor: '#1c2423',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -8,
    zIndex: 1,
  },
  logoImg: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  arrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3a4a48',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  footerText: {
    color: '#00ffe7',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default memo(TransferCard);
