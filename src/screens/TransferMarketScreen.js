import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { gradients } from '../theme';
import { getTransfers } from '../api/sportsApi';
import TransferCard from '../components/TransferCard';
import {
  isTablet,
  isLargeTablet,
  getHorizontalPadding,
  getMaxContentWidth,
} from '../utils/responsive';

const { width } = Dimensions.get('window');

const TransferMarketScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [sortField, setSortField] = useState('date'); // 'date' or 'fee'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('🔄 Fetching transfers...');

      // Try multiple popular teams to get recent transfers
      const popularTeams = [
        { id: 33, name: 'Manchester United' },
        { id: 541, name: 'Real Madrid' },
        { id: 85, name: 'PSG' },
        { id: 50, name: 'Manchester City' },
        { id: 529, name: 'Barcelona' },
      ];

      let allTransfers = [];

      for (const team of popularTeams) {
        try {
          console.log(`📦 Fetching transfers for ${team.name}...`);
          const data = await getTransfers({ team: team.id });

          if (data.response && data.response.length > 0) {
            console.log(
              `✅ Found ${data.response.length} transfers for ${team.name}`,
            );
            allTransfers = [...allTransfers, ...data.response];

            // Stop if we have enough transfers
            if (allTransfers.length >= 10) break;
          }
        } catch (err) {
          console.log(`⚠️ Error fetching ${team.name}:`, err.message);
        }
      }

      if (allTransfers.length > 0) {
        console.log(`✅ Total transfers found: ${allTransfers.length}`);
        setTransfers(allTransfers.slice(0, 20));
      } else {
        console.log('❌ No transfers found for any team');
        setTransfers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching market transfers:', error);
      setTransfers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchTransfers(true);
  }, [fetchTransfers]);

  const handleSort = useCallback(
    field => {
      if (sortField === field) {
        setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    },
    [sortField],
  );

  const parseFee = useCallback(feeStr => {
    if (!feeStr || feeStr === 'Free' || feeStr === 'Loan') return 0;
    const numeric = parseFloat(feeStr.replace(/[^0-9.]/g, ''));
    if (isNaN(numeric)) return 0;
    if (feeStr.toLowerCase().includes('m')) return numeric * 1000000;
    if (feeStr.toLowerCase().includes('k')) return numeric * 1000;
    return numeric;
  }, []);

  // Memoize sorted transfers to avoid recalculating on every render
  const sortedTransfers = useMemo(() => {
    // Flatten transfers for sorting as they are grouped by player
    const flatTransfers = [];
    transfers.forEach(playerItem => {
      if (playerItem.transfers) {
        playerItem.transfers.forEach(t => {
          flatTransfers.push({
            ...t,
            player: playerItem.player,
            uniqueKey: `${playerItem.player?.id}-${t.date}-${t.teams?.in?.id}`,
          });
        });
      }
    });

    return flatTransfers
      .sort((a, b) => {
        let valA, valB;
        if (sortField === 'date') {
          valA = new Date(a.date || 0).getTime();
          valB = new Date(b.date || 0).getTime();
        } else {
          valA = parseFee(a.type || '');
          valB = parseFee(b.type || '');
        }

        return sortOrder === 'desc' ? valB - valA : valA - valB;
      })
      .slice(0, 50); // Limit to 50 transfers max
  }, [transfers, sortField, sortOrder, parseFee]);

  const renderTransferItem = useCallback(
    ({ item, index }) => (
      <TransferCard
        key={item.uniqueKey || index}
        transfer={item}
        playerName={item.player?.name}
        onPlayerPress={() =>
          navigation.navigate('PlayerProfile', { playerId: item.player?.id })
        }
        onTeamPress={id =>
          navigation.navigate('TeamProfile', { teamId: id, sport: 'football' })
        }
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0d1a1a', '#1c2e2c', '#0d1a1a']}
        style={styles.background}
      >
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
          >
            <Icon name="chevron-left" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Football Transfer Market</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnSmall}>
              <Icon name="tune-variant" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtnSmall}>
              <Icon name="calendar-month-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              sortField === 'date' && styles.activeFilterPill,
            ]}
            onPress={() => handleSort('date')}
          >
            <Text
              style={[
                styles.filterText,
                sortField === 'date' && styles.activeFilterText,
              ]}
            >
              Date
            </Text>
            <Icon
              name={
                sortField === 'date'
                  ? sortOrder === 'desc'
                    ? 'chevron-down'
                    : 'chevron-up'
                  : 'unfold-more-horizontal'
              }
              size={18}
              color="#1a3a38"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              sortField === 'fee' && styles.activeFilterPill,
            ]}
            onPress={() => handleSort('fee')}
          >
            <Text
              style={[
                styles.filterText,
                sortField === 'fee' && styles.activeFilterText,
              ]}
            >
              Fee
            </Text>
            <Icon
              name={
                sortField === 'fee'
                  ? sortOrder === 'desc'
                    ? 'chevron-down'
                    : 'chevron-up'
                  : 'unfold-more-horizontal'
              }
              size={18}
              color="#1a3a38"
            />
          </TouchableOpacity>
        </View>

        {/* Subtitle / Separator */}
        <View style={styles.dateSeparator}>
          <View style={styles.sepLine} />
          <Text style={styles.sepText}>RECENT TRANSFERS</Text>
          <View style={styles.sepLine} />
        </View>

        {loading && transfers.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00ffe7" />
            <Text style={styles.loadingText}>Fetching Market Data...</Text>
          </View>
        ) : sortedTransfers.length > 0 ? (
          <FlatList
            data={sortedTransfers}
            renderItem={renderTransferItem}
            keyExtractor={(item, index) =>
              item.uniqueKey || `transfer-${index}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#00ffe7"
                colors={['#00ffe7']}
              />
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
          />
        ) : (
          !loading && (
            <View style={styles.emptyState}>
              <Icon
                name="swap-horizontal"
                size={80}
                color="rgba(255,255,255,0.1)"
              />
              <Text style={styles.emptyText}>No recent transfers found</Text>
            </View>
          )
        )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1a1a',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  background: { flex: 1 },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: getMaxContentWidth(),
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: isTablet ? 16 : 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: 'row',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: isTablet ? 24 : 20,
    gap: isTablet ? 20 : 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  activeFilterPill: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: '#1a3a38',
    fontSize: 15,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#1a3a38',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 210, 255, 0.2)',
  },
  sepText: {
    color: '#00d2ff',
    fontSize: 12,
    fontWeight: '800',
    marginHorizontal: 15,
  },
});

export default TransferMarketScreen;
