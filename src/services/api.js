const BASE_URL = 'https://api.jikan.moe/v4';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class JikanAPI {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  async handleRateLimit(retries) {
    const waitTime = (retries + 1) * 1000;
    console.log(`Rate limited, waiting ${waitTime}ms before retrying...`);
    await delay(waitTime);
  }

  async fetchData(endpoint, queryParams = '', retries = 3) {
    try {
      await delay(500);
      const response = await fetch(`${this.baseUrl}/${endpoint}?${queryParams}`);

      if (response.status === 429 && retries > 0) {
        await this.handleRateLimit(retries);
        return this.fetchData(endpoint, queryParams, retries - 1);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  }

  async getAnimeList(page = 1, filter = '') {
    return this.fetchData(`anime`, `page=${page}&${filter}`);
  }

  async getTopAnime(filter = 'bypopularity', page = 1) {
    return this.fetchData(`top/anime`, `filter=${filter}&page=${page}`);
  }

  async getAnimeById(id) {
    return this.fetchData(`anime/${id}/full`);
  }

  async getAnimeCharacters(id) {
    return this.fetchData(`anime/${id}/characters`);
  }

  async getRecommendations(id) {
    return this.fetchData(`anime/${id}/recommendations`);
  }

  async searchAnime(query, page = 1) {
    return this.fetchData(`anime`, `q=${query}&page=${page}`);
  }

  async getSeasonalAnime(year, season) {
    return this.fetchData(`seasons/${year}/${season}`);
  }

  async getAnimeByGenre(genreId) {
    return this.fetchData(`anime`, `genres=${genreId}&limit=18&order_by=score&sort=desc&sfw=true`);
  }

  async getBatchRecommendations(animeIds, limit = 10) {
    try {
      let allRecs = [];
      for (const id of animeIds) {
        await delay(300);
        try {
          const response = await this.getRecommendations(id);
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
  }
}

export const api = new JikanAPI();
export const ANIME_CATEGORIES = {
  POPULAR: 'bypopularity',
  AIRING: 'airing',
  UPCOMING: 'upcoming',
}
