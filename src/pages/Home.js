// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AnimeList from '../components/anime/AnimeList';
import Banner from '../components/layout/Banner';
import './Home.css';

const Home = () => {
  const [popularAnime, setPopularAnime] = useState([]);
  const [airingAnime, setAiringAnime] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data sequentially to avoid rate limiting
        console.log('Fetching popular anime...');
        const popularData = await api.getTopAnime('bypopularity', 1);
        if (popularData.data) {
          console.log('Popular anime data received');
          setPopularAnime(popularData.data.slice(0, 12));
        }

        console.log('Fetching airing anime...');
        const airingData = await api.getTopAnime('airing', 1);
        if (airingData.data) {
          console.log('Airing anime data received');
          setAiringAnime(airingData.data.slice(0, 12));
        }

        console.log('Fetching upcoming anime...');
        const upcomingData = await api.getTopAnime('upcoming', 1);
        if (upcomingData.data) {
          console.log('Upcoming anime data received');
          setUpcomingAnime(upcomingData.data.slice(0, 12));
        }

      } catch (err) {
        console.error('Error fetching anime:', err);
        setError('Failed to load anime data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading anime data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      {popularAnime.length > 0 && (
        <Banner animeList={popularAnime.slice(0, 5)} />
      )}
      
      <div className="anime-sections">
        <AnimeList
          title="Popular Anime"
          animeData={popularAnime}
          loading={loading}
          category="popular"
        />
        
        <AnimeList
          title="Currently Airing"
          animeData={airingAnime}
          loading={loading}
          category="airing"
        />
        
        <AnimeList
          title="Upcoming Releases"
          animeData={upcomingAnime}
          loading={loading}
          category="upcoming"
        />
      </div>
    </div>
  );
};

export default Home;