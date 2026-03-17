import axios from 'axios';

// ⚠️ UPDATE THIS IP TO YOUR COMPUTER'S IP
const BASE_URL = 'https://api.taleemimarkaz.pk/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== CORE FIXTURES ====================

/**
 * Get fixtures based on tab filter
 * @param {string} sport - football, basketball, hockey, volleyball
 * @param {string} filter - all, live, upcoming, finished, following
 */
export const getFixtures = async (
  sport = 'football',
  filter = 'all',
  date = null,
) => {
  try {
    console.log(`📡 API Call: ${sport} - ${filter}${date ? ' - ' + date : ''}`);
    // ✅ Use isolated sport-specific endpoints for better optimization
    let url = '/fixtures/all';
    if (sport === 'basketball') {
      url = '/basketball/fixtures/realtime';
    } else if (sport === 'tennis') {
      url = '/tennis/fixtures/realtime';
    }

    const response = await apiClient.get(url, {
      params: {
        sport,
        filter,
        date,
      },
    });
    console.log(`✅ Received ${response.data.results} fixtures`);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error.message);
    throw error;
  }
};

/**
 * Get single fixture details
 */
export const getFixtureById = async (fixtureId, sport = 'football') => {
  try {
    const response = await apiClient.get(`/fixtures/${fixtureId}`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== FIXTURE DETAILS ====================

/**
 * Get fixture statistics (possession, shots, etc.)
 */
export const getFixtureStatistics = async (fixtureId, sport = 'football') => {
  try {
    console.log(`📊 Fetching stats for fixture ${fixtureId}`);

    // Basketball uses different endpoint
    if (sport === 'basketball') {
      const response = await apiClient.get(`/basketball/fixtures/${fixtureId}/statistics`);
      return response.data;
    }

    if (sport === 'volleyball') {
      const response = await apiClient.get('/games/statistics/teams', {
        params: { id: fixtureId, sport },
      });
      return response.data;
    }

    // Football uses path parameter
    const response = await apiClient.get(`/fixtures/${fixtureId}/statistics`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get fixture lineups (football) or player stats (basketball)
 */
export const getFixtureLineups = async (fixtureId, sport = 'football') => {
  try {
    console.log(`👥 Fetching lineups for fixture ${fixtureId}`);

    // Basketball uses different endpoint for player stats
    if (sport === 'basketball') {
      const response = await apiClient.get(`/basketball/fixtures/${fixtureId}/lineup`);
      return response.data;
    }

    if (sport === 'volleyball') {
      const response = await apiClient.get('/games/statistics/players', {
        params: { id: fixtureId, sport },
      });
      return response.data;
    }

    // Football uses path parameter for lineups
    const response = await apiClient.get(`/fixtures/${fixtureId}/lineups`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get fixture events (goals, cards, substitutions)
 */
export const getFixtureEvents = async (fixtureId, sport = 'football') => {
  try {
    const response = await apiClient.get(`/fixtures/events/${fixtureId}`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get head to head between two teams
 */
export const getFixtureH2H = async (
  team1,
  team2,
  sport = 'football',
  last = 5,
) => {
  try {
    console.log(`🔄 Fetching H2H: ${team1} vs ${team2}`);

    // Basketball, Volleyball, Hockey, and Handball use /games endpoint
    if (
      sport === 'basketball' ||
      sport === 'volleyball' ||
      sport === 'hockey' ||
      sport === 'handball'
    ) {
      const response = await apiClient.get('/games', {
        params: { h2h: `${team1}-${team2}`, sport },
      });
      return response.data;
    }

    // Football uses path parameters
    const response = await apiClient.get(`/fixtures/h2h/${team1}/${team2}`, {
      params: { sport, last },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get fixture injuries (Football only)
 */
export const getFixtureInjuries = async (fixtureId, sport = 'football') => {
  try {
    console.log(`🚑 Fetching injuries for fixture ${fixtureId}`);
    const response = await apiClient.get(`/fixtures/${fixtureId}/injuries`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get fixture prediction (Football only)
 */
export const getFixturePrediction = async (fixtureId, sport = 'football') => {
  try {
    console.log(`🔮 Fetching prediction for fixture ${fixtureId}`);
    const response = await apiClient.get(`/fixtures/${fixtureId}/prediction`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

export const getFixtureAnalysis = async (fixtureId, sport = 'football') => {
  try {
    console.log(`📊 Fetching analysis for fixture ${fixtureId} (${sport})`);
    
    // Basketball has its own specific analysis endpoint
    const url = sport === 'basketball' 
      ? `/basketball/fixtures/${fixtureId}/analysis` 
      : `/fixtures/${fixtureId}/analysis`;
      
    const response = await apiClient.get(url, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get odds for a specific fixture
 */
export const getFixtureOdds = async (fixtureId, sport = 'football') => {
  try {
    console.log(`🎲 Fetching odds for fixture ${fixtureId}`);
    const response = await apiClient.get(`/fixtures/${fixtureId}/odds`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get fixture commentary (Football only)
 */
export const getFixtureCommentary = async (fixtureId, sport = 'football') => {
  try {
    console.log(`💬 Fetching commentary for fixture ${fixtureId}`);
    const response = await apiClient.get(`/fixtures/${fixtureId}/commentary`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get fixture trend / momentum data
 */
export const getFixtureTrend = async (fixtureId, sport = 'football') => {
  try {
    console.log(`📈 Fetching trend for fixture ${fixtureId}`);
    const response = await apiClient.get(`/fixtures/${fixtureId}/trend`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball shooting points
 */
export const getBasketballShootPoints = async (fixtureId) => {
  try {
    console.log(`🏀 Fetching shoot points for fixture ${fixtureId}`);
    const response = await apiClient.get(`/basketball/fixtures/${fixtureId}/shoot-points`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== STANDINGS ====================

/**
 * Get league standings/table
 */
export const getStandings = async (league, season, sport = 'football') => {
  try {
    console.log(`🏆 Fetching standings for league ${league}, season ${season}`);
    
    if (sport === 'basketball') {
      const response = await apiClient.get('/basketball/standings', {
        params: { league, season }
      });
      return response.data;
    }

    const response = await apiClient.get('/standings', {
      params: { league, season, sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get standings groups (Eastern/Western Conference for basketball)
 */
export const getStandingsGroups = async (
  league,
  season,
  sport = 'basketball',
) => {
  try {
    console.log(
      `🏀 Fetching standings groups: League ${league}, Season ${season}`,
    );
    const response = await apiClient.get('/standings/groups', {
      params: { league, season, sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get standings stages (Regular Season, Playoffs)
 */
export const getStandingsStages = async (
  league,
  season,
  sport = 'basketball',
) => {
  try {
    console.log(
      `🏀 Fetching standings stages: League ${league}, Season ${season}`,
    );
    const response = await apiClient.get('/standings/stages', {
      params: { league, season, sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== SEARCH ====================

/**
 * Search teams by name
 */
export const searchTeams = async (query, sport = 'football') => {
  try {
    console.log(`🔍 Searching teams: "${query}"`);
    
    if (sport === 'basketball') {
      const response = await apiClient.get('/basketball/search/teams', {
        params: { query },
      });
      return response.data;
    }

    const response = await apiClient.get('/search/teams', {
      params: { query, sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Search leagues by name
 */
export const searchLeagues = async (query, sport = 'football') => {
  try {
    console.log(`🔍 Searching leagues: "${query}"`);
    const response = await apiClient.get('/search/leagues', {
      params: { query, sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== TEAMS ====================

/**
 * Get team information
 */
export const getTeamInfo = async (teamId, sport = 'football') => {
  try {
    console.log(`🛡️ Fetching team info: ${teamId}`);
    const response = await apiClient.get(`/teams/${teamId}/info`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get team statistics
 */
export const getTeamStatistics = async (
  teamId,
  league,
  season,
  sport = 'football',
) => {
  try {
    console.log(`📊 Fetching team statistics: ${teamId}`);
    const response = await apiClient.get(`/teams/${teamId}/statistics`, {
      params: { league, season, sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get team fixtures
 */
export const getTeamFixtures = async (
  teamId,
  season,
  sport = 'football',
  last = 20,
) => {
  try {
    console.log(`📅 Fetching fixtures for team ${teamId}`);
    const response = await apiClient.get(`/teams/${teamId}/fixtures`, {
      params: { season, last, sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get team squad
 */
export const getTeamSquad = async (teamId, sport = 'football') => {
  try {
    console.log(`👥 Fetching team squad: ${teamId}`);
    const response = await apiClient.get(`/teams/${teamId}/squad`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== SYSTEM ====================

/**
 * Get available sports
 */
export const getSports = async () => {
  try {
    const response = await apiClient.get('/sports');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get API status
 */
export const getStatus = async (sport = 'football') => {
  try {
    const response = await apiClient.get('/status', {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get available seasons
 */
export const getSeasons = async (sport = 'basketball') => {
  try {
    console.log(`📅 Fetching seasons for ${sport}`);
    const response = await apiClient.get('/seasons', {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get available bookmakers
 */
export const getBookmakers = async (sport = 'football') => {
  try {
    const response = await apiClient.get('/bookmakers', {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get available bets
 */
export const getBets = async (sport = 'football') => {
  try {
    const response = await apiClient.get('/bets', {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== METADATA (NEW) ====================

/**
 * Get Football Leagues (filtered by country, type, etc.)
 */
export const getLeagues = async (params = {}) => {
  try {
    const response = await apiClient.get('/leagues/all', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get available football seasons
 */
export const getLeaguesSeasons = async () => {
  try {
    const response = await apiClient.get('/leagues/seasons');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get countries for team filtering
 */
export const getTeamCountries = async () => {
  try {
    const response = await apiClient.get('/teams/countries');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get available seasons for a specific team
 */
export const getTeamSeasons = async teamId => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/seasons`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get venue details
 */
export const getVenueInfo = async (venueId, sport = 'football') => {
  try {
    const response = await apiClient.get(`/venues/${venueId}`, {
      params: { sport },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== COACHES & PLAYERS (NEW) ====================

/**
 * Get Football Coaches
 */
export const getCoaches = async (params = {}) => {
  try {
    const response = await apiClient.get('/coachs', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get Football Player Seasons
 */
export const getPlayerSeasons = async (playerId = null) => {
  try {
    const response = await apiClient.get('/players/seasons', {
      params: { playerId },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get Football Player Profiles
 */
export const getPlayerProfiles = async (params = {}) => {
  try {
    const response = await apiClient.get('/players/profiles', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get Football Player Statistics
 */
export const getPlayers = async (params = {}) => {
  try {
    const response = await apiClient.get('/players', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get Football Player Transfers
 */
export const getTransfers = async (params = {}) => {
  try {
    const response = await apiClient.get('/transfers', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== BASKETBALL SPECIFIC ====================

/**
 * Get basketball countries
 * @param {object} params - { id, name, code, search }
 */
export const getBasketballCountries = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball countries');
    const response = await apiClient.get('/basketball/countries', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball leagues
 * @param {object} params - { id, name, country_id, country, type, season, search, code }
 */
export const getBasketballLeagues = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball leagues', params);
    const response = await apiClient.get('/basketball/leagues', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball teams
 * @param {object} params - { id, name, country_id, country, league, season, search }
 */
export const getBasketballTeams = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball teams', params);
    const response = await apiClient.get('/basketball/teams', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball team statistics
 * @param {object} params - { league (required), season (required), team (required), date }
 */
export const getBasketballTeamStatistics = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball team statistics', params);
    const response = await apiClient.get('/basketball/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball players
 * @param {object} params - { id, team, season, search }
 */
export const getBasketballPlayers = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball players', params);
    const response = await apiClient.get('/basketball/players', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball seasons
 */
export const getBasketballSeasons = async () => {
  try {
    console.log('🏀 Fetching basketball seasons');
    const response = await apiClient.get('/basketball/seasons');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball timezones
 */
export const getBasketballTimezones = async () => {
  try {
    console.log('🏀 Fetching basketball timezones');
    const response = await apiClient.get('/basketball/timezone');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball games/fixtures
 * @param {object} params - { id, date, league, season, team, timezone, h2h }
 */
export const getBasketballGames = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball games', params);
    const response = await apiClient.get('/basketball/games', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball game statistics (teams)
 * @param {number} gameId - The game ID
 */
export const getBasketballGameStatsTeams = async gameId => {
  try {
    console.log('🏀 Fetching basketball game team stats', gameId);
    const response = await apiClient.get('/basketball/games/statistics/teams', {
      params: { id: gameId },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball game statistics (players)
 * @param {number} gameId - The game ID
 */
export const getBasketballGameStatsPlayers = async gameId => {
  try {
    console.log('🏀 Fetching basketball game player stats', gameId);
    const response = await apiClient.get(
      '/basketball/games/statistics/players',
      {
        params: { id: gameId },
      },
    );
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball standings
 * @param {object} params - { league (required), season (required), stage, group }
 */
export const getBasketballStandings = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball standings', params);
    const response = await apiClient.get('/basketball/standings', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

/**
 * Get basketball odds
 * @param {object} params - { game, league, season, bookmaker, bet }
 */
export const getBasketballOdds = async (params = {}) => {
  try {
    console.log('🏀 Fetching basketball odds', params);
    const response = await apiClient.get('/basketball/odds', { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};

// ==================== DEFAULT EXPORT ====================

export default {
  // Core
  getFixtures,
  getFixtureById,

  // Fixture Details
  getFixtureStatistics,
  getFixtureLineups,
  getFixtureEvents,
  getFixtureH2H,
  getFixtureOdds,
  getFixtureInjuries,
  getFixturePrediction,
  getFixtureAnalysis,
  getFixtureCommentary,
  getFixtureTrend,

  // Metadata
  getLeagues,
  getLeaguesSeasons,
  getTeamCountries,
  getTeamSeasons,
  getVenueInfo,

  // Coaches & Players
  getCoaches,
  getPlayerSeasons,
  getPlayerProfiles,
  getPlayers,
  getTransfers,

  // Standings
  getStandings,
  getStandingsGroups,
  getStandingsStages,

  // Search
  searchTeams,
  searchLeagues,

  // Teams
  getTeamInfo,
  getTeamStatistics,
  getTeamFixtures,
  getTeamSquad,

  // System
  getSports,
  getStatus,
  getSeasons,
  getBookmakers,
  getBets,

  // Basketball Specific
  getBasketballCountries,
  getBasketballLeagues,
  getBasketballTeams,
  getBasketballTeamStatistics,
  getBasketballPlayers,
  getBasketballSeasons,
  getBasketballTimezones,
  getBasketballGames,
  getBasketballGameStatsTeams,
  getBasketballGameStatsPlayers,
  getBasketballStandings,
  getBasketballOdds,
  getBasketballShootPoints,
};