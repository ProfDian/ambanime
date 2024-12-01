// src/pages/Genre.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import AnimeCard from '../components/anime/AnimeCard';
import './Genres.css';

const Genre = () => {
  const { isGuest } = useAuth();
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [animeByGenre, setAnimeByGenre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await api.getGenres();
        const filteredGenres = response.data.filter(genre => 
          !genre.name.includes('Explicit') && !genre.name.includes('Hentai')
        );
        setGenres(filteredGenres);
        
        if (filteredGenres.length > 0) {
          setSelectedGenre(filteredGenres[0]);
          await fetchAnimeForGenre(filteredGenres[0].mal_id);
        }
      } catch (err) {
        setError('Failed to load genres. Please try again later.');
        console.error('Error fetching genres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const fetchAnimeForGenre = async (genreId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${api.BASE_URL}/anime?genres=${genreId}&limit=15&order_by=popularity`
      );
      const data = await response.json();
      setAnimeByGenre(data.data);
    } catch (err) {
      console.error('Error fetching anime for genre:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    await fetchAnimeForGenre(genre.mal_id);
  };

  return (
    <div className="genre-page">
      <div className="genre-banner">
        <div className="genre-banner-content">
          <h1>Explore Anime by Genre</h1>
          <p>Discover new series based on your favorite genres</p>
        </div>
      </div>

      <div className="genre-content">
        <div className="genre-sidebar">
          <h2>Genres</h2>
          <div className="genre-list">
            {genres.map(genre => (
              <button
                key={genre.mal_id}
                className={`genre-button ${selectedGenre?.mal_id === genre.mal_id ? 'active' : ''}`}
                onClick={() => handleGenreClick(genre)}
              >
                <span>{genre.name}</span>
                <span className="genre-count">{genre.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="genre-main">
          {selectedGenre && (
            <div className="genre-section">
              <div className="genre-header">
                <h2>{selectedGenre.name}</h2>
                <p className="genre-description">
                  {selectedGenre.description || 
                   `Explore popular ${selectedGenre.name} anime series`}
                </p>
              </div>

              {loading ? (
                <div className="loading">Loading anime...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : (
                <div className="anime-grid">
                  {animeByGenre.map(anime => (
                    <AnimeCard
                      key={anime.mal_id}
                      anime={anime}
                      isGuest={isGuest}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Genre;