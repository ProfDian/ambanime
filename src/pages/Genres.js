import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnimeCard from '../components/anime/AnimeCard';
import './Genres.css';
import { api } from '../services/api';


const POPULAR_GENRES = [
  { id: 1, name: 'Action', color: '#FF6B6B' },
  { id: 2, name: 'Romance', color: '#FF9999' },
  { id: 4, name: 'Comedy', color: '#FFB84C' },
  { id: 8, name: 'Drama', color: '#7B66FF' },
  { id: 10, name: 'Fantasy', color: '#5C469C' },
  { id: 7, name: 'Mystery', color: '#1B9C85' },
  { id: 24, name: 'Sci-Fi', color: '#4942E4' },
  { id: 36, name: 'Slice of Life', color: '#C4B0FF' }
];

const Genre = () => {
  const { isGuest } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState(POPULAR_GENRES[0]);
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnimeByGenre = useCallback(async (genreId) => {
    if (!genreId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await api.getAnimeByGenre(genreId);
      setAnimeList(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load anime. Please try again.');
      console.error('Error fetching anime:', err);
      setAnimeList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGenre?.id) {
      fetchAnimeByGenre(selectedGenre.id);
    }
  }, [selectedGenre, fetchAnimeByGenre]);

  const handleGenreClick = (genre) => {
    if (selectedGenre?.id === genre.id) return;
    setSelectedGenre(genre);
  };

  return (
    <div className="genre-page">
      <div className="genre-banner">
        <h1>Discover Anime by Genre</h1>
        <p>Explore the best anime series in your favorite genre</p>
      </div>

      <div className="genres-container">
        <div className="genre-buttons">
          {POPULAR_GENRES.map((genre) => (
            <button
              key={genre.id}
              className={`genre-pill ${selectedGenre?.id === genre.id ? 'active' : ''}`}
              onClick={() => handleGenreClick(genre)}
              disabled={loading}
              style={{
                '--genre-color': genre.color,
                '--genre-hover-color': `${genre.color}80`
              }}
            >
              {genre.name}
            </button>
          ))}
        </div>

        <div className="genre-content">
          {loading && animeList.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading awesome anime...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                onClick={() => selectedGenre && fetchAnimeByGenre(selectedGenre.id)}
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {selectedGenre && (
                <h2 className="genre-title">
                  Top {selectedGenre.name} Anime
                </h2>
              )}
              <div className="anime-grid">
                {animeList.map((anime) => (
                  <AnimeCard
                    key={anime.mal_id}
                    anime={anime}
                    isGuest={isGuest}
                  />
                ))}
                {animeList.length === 0 && !loading && !error && (
                  <div className="no-results">
                    No anime found for this genre.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Genre;