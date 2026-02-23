import { useState, useEffect, useCallback } from 'react';
import { getStandings, getStandingsGroups } from '../api/sportsApi';

/**
 * Hook to fetch and manage standings data for any sport
 */
const useStandings = (leagueId, season, sport = 'football') => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasGroups, setHasGroups] = useState(false);

  const fetchStandings = useCallback(async () => {
    if (!leagueId || !season) return;

    try {
      setLoading(true);
      setError(null);
      
      let data;
      // Some sports use groups/conferences, others use a flat list
      if (['basketball', 'volleyball', 'hockey'].includes(sport)) {
        data = await getStandingsGroups(leagueId, season, sport);
        
        if (data.response && data.response.length > 0) {
          // Check if it has multiple groups or is just a single group
          const groups = data.response;
          const isGrouped = groups.length > 1 || (groups[0]?.length > 0 && groups[0][0]?.group?.name);
          setHasGroups(isGrouped);
          setStandings(groups);
        } else {
          setStandings([]);
        }
      } else {
        // Football and generic sports
        data = await getStandings(leagueId, season, sport);
        
        if (data.response && data.response.length > 0) {
          const leagueData = data.response[0].league || data.response[0];
          setStandings(leagueData.standings || []);
          setHasGroups(Array.isArray(leagueData.standings) && leagueData.standings.length > 1);
        } else {
          setStandings([]);
        }
      }
    } catch (err) {
      console.error(`❌ Error fetching ${sport} standings:`, err);
      setError(err.message || 'Failed to load standings');
    } finally {
      setLoading(false);
    }
  }, [leagueId, season, sport]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return { standings, loading, error, hasGroups, refresh: fetchStandings };
};

export default useStandings;
