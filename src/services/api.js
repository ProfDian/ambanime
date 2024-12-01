const BASE_URL = 'https://api.jikan.moe/v4';

// Add delay to respect API rate limiting - reduced to 300ms
const delay = (ms) => new Promise(resolve => setTimeout(resolve, 300));

// Helper function for handling rate limits
const handleRateLimit = async (retries = 3) => {
  const waitTime = (retries + 1) * 1000; // Increase wait time with each retry
  console.log(`Rate limited, waiting ${waitTime}ms before retrying...`);
  await delay(waitTime);
};

export const api = {
  // Get anime list with pagination
  getAnimeList: async (page = 1, filter = '', retries = 3) => {
    try {
      await delay(1000);
      const response = await fetch(`${BASE_URL}/anime?page=${page}&${filter}`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getAnimeList(page, filter, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching anime list:', error);
      throw error;
    }
  },

  // Get top anime with rate limiting
  getTopAnime: async (filter = 'bypopularity', page = 1, retries = 3) => {
    try {
      await delay(1000);
      const response = await fetch(`${BASE_URL}/top/anime?filter=${filter}&page=${page}`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getTopAnime(filter, page, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top anime:', error);
      throw error;
    }
  },

  // Get anime by ID
  getAnimeById: async (id, retries = 3) => {
    try {
      await delay(500);
      const response = await fetch(`${BASE_URL}/anime/${id}/full`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getAnimeById(id, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching anime:', error);
      throw error;
    }
  },

  // Get anime characters
  getAnimeCharacters: async (id, retries = 3) => {
    try {
      await delay(500);
      const response = await fetch(`${BASE_URL}/anime/${id}/characters`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getAnimeCharacters(id, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  },

  // Get recommendations
  getRecommendations: async (id, retries = 3) => {
    try {
      await delay(500);
      const response = await fetch(`${BASE_URL}/anime/${id}/recommendations`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getRecommendations(id, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Search anime
  searchAnime: async (query, page = 1, retries = 3) => {
    try {
      await delay(500);
      const response = await fetch(`${BASE_URL}/anime?q=${query}&page=${page}`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.searchAnime(query, page, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  },

  // Get seasonal anime
  getSeasonalAnime: async (year, season, retries = 3) => {
    try {
      await delay(500);
      const response = await fetch(`${BASE_URL}/seasons/${year}/${season}`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getSeasonalAnime(year, season, retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching seasonal anime:', error);
      throw error;
    }
  },

  // Get genres
  getGenres: async (retries = 3) => {
    try {
      await delay(500);
      const response = await fetch(`${BASE_URL}/genres/anime`);
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getGenres(retries - 1);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }
};

export const ANIME_CATEGORIES = {
  POPULAR: 'bypopularity',
  AIRING: 'airing',
  UPCOMING: 'upcoming'
};