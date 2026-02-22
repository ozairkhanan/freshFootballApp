import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const OddsTab = ({ odds, loading, sport = 'football' }) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Loading odds...</Text>
      </View>
    );
  }

  //new chnages

  if (!odds || !odds.response || odds.response.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="ticket-percent-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>No odds available for this match</Text>
        <Text style={styles.emptySubText}>Check back closer to kick-off</Text>
      </View>
    );
  }

  const oddsResponse = odds.response[0];
  const isLive = odds.isLive;

  // Normalize odds data from different API formats
  // ✅ Only football uses .odds for live; all others (including pre-match) use bookmakers
  const markets =
    sport === 'football' && isLive
      ? oddsResponse.odds || []
      : oddsResponse.bookmakers?.[0]?.bets || [];

  const bookmakerName =
    sport === 'football' && isLive
      ? 'Live Feed'
      : oddsResponse.bookmakers?.[0]?.name || 'Premium Feed';

  if (!markets || markets.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon
          name="ticket-percent-outline"
          size={isTablet ? 100 : 80}
          color="rgba(255,255,255,0.2)"
        />
        <Text style={styles.emptyText}>Odds currently unavailable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.oddsHeader}>
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.pulseContainer}>
              <View style={styles.pulseDot} />
              <View style={styles.pulseRing} />
            </View>
            <Text style={styles.liveLabel}>LIVE UPDATING</Text>
          </View>
        )}

        <View style={styles.bookmakerBadge}>
          <Icon name="storefront-outline" size={14} color="#00ffe7" />
          <Text style={styles.bookmakerLabel}>Odds by {bookmakerName}</Text>
        </View>
      </View>

      {markets.map((market, index) => (
        <View key={market.id || index} style={styles.marketCard}>
          <View style={styles.marketHeader}>
            <Text style={styles.marketName}>{market.name}</Text>
          </View>

          <View style={styles.valuesGrid}>
            {market.values.map((val, valIndex) => {
              // Calculate width based on number of values (2 or 3 usually)
              const count = market.values.length;
              const isThreeWay = count === 3;
              const isTwoWay = count === 2;

              return (
                <View
                  key={valIndex}
                  style={[
                    styles.oddButton,
                    val.suspended && styles.suspendedButton,
                    isTwoWay && styles.twoWayButton,
                    isThreeWay && styles.threeWayButton,
                  ]}
                >
                  <Text style={styles.oddValue} numberOfLines={1}>
                    {val.value}
                  </Text>
                  <View style={styles.rateRow}>
                    {val.suspended && (
                      <Icon
                        name="lock-outline"
                        size={14}
                        color="#ff6b6b"
                        style={styles.lockIcon}
                      />
                    )}
                    <Text
                      style={[
                        styles.oddValueRate,
                        val.suspended && styles.suspendedText,
                      ]}
                    >
                      {val.suspended ? 'SUSP' : val.odd}
                    </Text>
                  </View>
                  {val.handicap && (
                    <Text style={styles.handicapText}>({val.handicap})</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <View style={styles.sourceBadge}>
          <Text style={styles.footerText}>
            Source: {odds.source || 'Premium Feed'} •{' '}
            {new Date(oddsResponse.update || Date.now()).toLocaleTimeString()}
          </Text>
        </View>

        <View style={styles.disclaimerBox}>
          <Icon
            name="shield-check-outline"
            size={18}
            color="rgba(255,255,255,0.4)"
          />
          <View style={styles.disclaimerTextContainer}>
            <Text style={styles.responsibleLabel}>RESPONSIBLE INFORMATION</Text>
            <Text style={styles.disclaimerText}>
              Odds are provided for informational and analytical purposes only.
              Please gamble responsibly.
            </Text>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 80,
  },
  emptyText: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    marginTop: isTablet ? 24 : 20,
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: isTablet ? 16 : 14,
    marginTop: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  oddsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bookmakerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 231, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 231, 0.2)',
  },
  bookmakerLabel: {
    color: '#00ffe7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  pulseContainer: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4caf50',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    opacity: 0.3,
  },
  liveLabel: {
    color: '#4caf50',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  marketCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  marketHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marketName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  oddButton: {
    minWidth: '28%',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    margin: 4,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  twoWayButton: {
    flex: 1,
    minWidth: '45%',
  },
  threeWayButton: {
    flex: 1,
    minWidth: '28%',
  },
  suspendedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(244, 67, 54, 0.1)',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    marginRight: 4,
  },
  oddValue: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  oddValueRate: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  suspendedText: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  handicapText: {
    color: 'rgba(0, 255, 231, 0.6)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  footer: {
    marginTop: 10,
    paddingBottom: 60,
  },
  sourceBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '500',
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  disclaimerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  responsibleLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  disclaimerText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 11,
    lineHeight: 16,
  },
});

export default OddsTab;
