const BASE_URL = 'https://api.jikan.moe/v4';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleRateLimit = async (retries = 3) => {
  const waitTime = (retries + 1) * 1000;
  console.log(`Rate limited, waiting ${waitTime}ms before retrying...`);
  await delay(waitTime);
};

export const api = {
  // Existing methods
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
      return response.json();
    } catch (error) {
      console.error('Error fetching top anime:', error);
      throw error;
    }
  },

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

  // Enhanced recommendations method with better rate limiting
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

  // Enhanced getAnimeByGenre with rate limiting and retries
  getAnimeByGenre: async (genreId, retries = 3) => {
    try {
      await delay(500);
      const response = await fetch(
        `${BASE_URL}/anime?genres=${genreId}&limit=18&order_by=score&sort=desc&sfw=true`
      );
      
      if (response.status === 429 && retries > 0) {
        await handleRateLimit(retries);
        return api.getAnimeByGenre(genreId, retries - 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching anime by genre:', error);
      throw error;
    }
  },

  // New method for batch recommendations
  getBatchRecommendations: async (animeIds, limit = 10, retries = 3) => {
    try {
      let allRecs = [];
      for (const id of animeIds) {
        await delay(500);
        try {
          const response = await api.getRecommendations(id, retries);
          if (response.data) {
            allRecs = [...allRecs, ...response.data];
          }
        } catch (err) {
          console.error(`Error fetching recommendations for anime ${id}:`, err);
          continue;
        }
      }

      return allRecs
        .filter((rec, index, self) => 
          index === self.findIndex(r => r.entry.mal_id === rec.entry.mal_id)
        )
        .sort((a, b) => b.votes - a.votes)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching batch recommendations:', error);
      throw error;
    }
  },
};

export const ANIME_CATEGORIES = {
  POPULAR: 'bypopularity',
  AIRING: 'airing',
  UPCOMING: 'upcoming',
};