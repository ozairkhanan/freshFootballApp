import { useState, useEffect, useCallback, useRef } from 'react';
import { getFixtures } from '../api/sportsApi';

// ✅ Live statuses per sport
const LIVE_STATUSES = {
  football: ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'],
  basketball: ['Q1', 'Q2', 'Q3', 'Q4', 'OT', 'BT', 'HT'],
  hockey: ['P1', 'P2', 'P3', 'OT', 'BT'],
  volleyball: ['S1', 'S2', 'S3', 'S4', 'S5', 'BT'],
  mma: ['LIVE', 'IN', 'PF', 'WO', 'EOR'],
  // ✅ Handball live statuses (similar to football)
  handball: ['1H', '2H', 'HT', 'ET', 'BT', 'PT'],
  cricket: ['LIVE'],
  tennis: ['S1', 'S2', 'S3', 'S4', 'S5', 'TIE', 'LIVE'],
};

const useLiveFixtures = (
  pollInterval = 15000,
  sport = 'football',
  filter = 'all',
  date = null,
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const prevSportRef = useRef(sport);
  const prevFilterRef = useRef(filter);
  const prevDateRef = useRef(date);

  const fetchFixtures = useCallback(async () => {
    try {
      setError(null);
      
      // ✅ Use local date formatting instead of toISOString() to avoid UTC shifts
      const formatDateLocal = (d) => {
        if (!(d instanceof Date)) return d;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const dateParam = formatDateLocal(date);
      
      console.log(`📱 Fetching: ${sport} - ${filter} - ${dateParam || 'today'}`);

      const response = await getFixtures(sport, filter, dateParam);

      // Backend already returns grouped by league
      let rawData = response?.response || [];
      // Sanitize: ensure every section has a 'data' array to prevent SectionList crashes
      const sanitizedData = Array.isArray(rawData) 
        ? rawData.filter(section => section && Array.isArray(section.data))
        : [];
      
      setData(sanitizedData);
      setLoading(false);

      console.log(`✅ Loaded ${response?.results || 0} fixtures`);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'Failed to fetch fixtures');
      setLoading(false);
    }
  }, [sport, filter, date]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchFixtures();
  }, [fetchFixtures]);

  // ✅ Check if a fixture is live based on sport
  const isLive = useCallback(
    fixture => {
      const status = fixture?.status?.short;
      const sportStatuses = LIVE_STATUSES[sport] || LIVE_STATUSES.football;
      return sportStatuses.includes(status);
    },
    [sport],
  );

  // ✅ Get count of live fixtures
  const getLiveCount = useCallback(() => {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((acc, section) => {
      if (!section || !section.data || !Array.isArray(section.data)) return acc;
      const liveMatches = section.data.filter(f => isLive(f));
      return acc + liveMatches.length;
    }, 0);
  }, [data, isLive]);

  useEffect(() => {
    // Check if sport, filter or date changed
    const sportChanged = prevSportRef.current !== sport;
    const filterChanged = prevFilterRef.current !== filter;
    const dateChanged = prevDateRef.current !== date;

    if (sportChanged || filterChanged || dateChanged) {
      console.log(
        `🔄 Change: ${prevSportRef.current}/${prevFilterRef.current}/${prevDateRef.current} → ${sport}/${filter}/${date}`,
      );
      setLoading(true);
      setData([]); // Clear old data immediately
      prevSportRef.current = sport;
      prevFilterRef.current = filter;
      prevDateRef.current = date;
    }

    // Initial fetch
    fetchFixtures();

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Setup polling for live updates (only for live and all tabs, and if date is today/null)
    const isToday = !date || isSameDay(new Date(date), new Date());
    if ((filter === 'live' || filter === 'all') && isToday) {
      console.log(`⏱️  Setting up polling every ${pollInterval}ms`);
      intervalRef.current = setInterval(() => {
        console.log(`🔄 Polling: ${sport} - ${filter}`);
        fetchFixtures();
      }, pollInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchFixtures, pollInterval, sport, filter, date]);

  // Helper for date comparison
  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  return {
    data,
    loading,
    error,
    refresh,
    isLive,
    getLiveCount,
  };
};

export default useLiveFixtures;
