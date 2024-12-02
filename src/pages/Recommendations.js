import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { api } from '../services/api';
import AnimeCard from '../components/anime/AnimeCard';
import './Recommendations.css';

const Recommendations = () => {
  const { currentUser, isGuest } = useAuth();
  const [topAnime, setTopAnime] = useState([]);
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const topResponse = await api.getTopAnime('bypopularity', 1);
        setTopAnime(topResponse.data?.slice(0, 10) || []);

        if (currentUser && !isGuest) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();

          if (userData?.favorites?.length) {
            const topFavorites = userData.favorites.slice(0, 2);
            
            const recommendations = await api.getBatchRecommendations(topFavorites);
            
            const detailedRecs = await Promise.all(
              recommendations.map(async (rec) => {
                try {
                  const animeDetails = await api.getAnimeById(rec.entry.mal_id);
                  return animeDetails;
                } catch (err) {
                  console.error(`Error fetching details for ${rec.entry.mal_id}:`, err);
                  return null;
                }
              })
            );

            setPersonalizedRecs(
              detailedRecs
                .filter(Boolean)
                .map(response => response.data)
            );
          }
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser, isGuest]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="recommendations-page">
      <div className="recommendations-banner">
        <div className="recommendations-banner-content">
          <h1>Anime Recommendations</h1>
          <p>Discover your next favorite anime series</p>
        </div>
      </div>

      <div className="recommendations-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Finding the perfect anime for you...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        ) : (
          <>
            {!isGuest && personalizedRecs.length > 0 && (
              <section className="recommendations-section">
                <h2>Personalized For You</h2>
                <p className="section-description">
                  Based on your favorite anime
                </p>
                <div className="anime-grid">
                  {personalizedRecs.map(anime => (
                    <AnimeCard 
                      key={anime.mal_id} 
                      anime={anime}
                      isGuest={isGuest}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="recommendations-section">
              <h2>Popular Right Now</h2>
              <p className="section-description">
                Trending series loved by anime fans worldwide
              </p>
              <div className="anime-grid">
                {topAnime.map(anime => (
                  <AnimeCard 
                    key={anime.mal_id} 
                    anime={anime}
                    isGuest={isGuest}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendations;