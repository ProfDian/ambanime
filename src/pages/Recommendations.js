// src/pages/Recommendations.js
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
      try {
        setLoading(true);

        // Fetch top anime for general recommendations
        const topAnimeResponse = await api.getTopAnime('bypopularity', 1);
        setTopAnime(topAnimeResponse.data.slice(0, 10));

        // Fetch personalized recommendations if user is logged in
        if (currentUser && !isGuest) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          if (userData.favorites?.length) {
            // Get recommendations based on user's favorite anime
            const recsPromises = userData.favorites.map(async (animeId) => {
              const response = await fetch(
                `${api.BASE_URL}/anime/${animeId}/recommendations`
              );
              return response.json();
            });

            const recsResponses = await Promise.all(recsPromises);
            const recommendations = recsResponses
              .flatMap(response => response.data)
              .filter((rec, index, self) => 
                index === self.findIndex(r => r.entry.mal_id === rec.entry.mal_id)
              )
              .slice(0, 10);

            const detailedRecs = await Promise.all(
              recommendations.map(rec => api.getAnimeById(rec.entry.mal_id))
            );

            setPersonalizedRecs(detailedRecs.map(response => response.data));
          }
        }
      } catch (err) {
        setError('Failed to load recommendations. Please try again later.');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser, isGuest]);

  if (loading) return <div className="loading">Loading recommendations...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="recommendations-page">
      <div className="recommendations-banner">
        <div className="recommendations-banner-content">
          <h1>Anime Recommendations</h1>
          <p>Discover your next favorite anime series</p>
        </div>
      </div>

      <div className="recommendations-content">
        {!isGuest && personalizedRecs.length > 0 && (
          <section className="recommendations-section">
            <h2>Personalized Recommendations</h2>
            <p className="section-description">
              Based on your favorite anime
            </p>
            <div className="anime-grid">
              {personalizedRecs.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
          </section>
        )}

        <section className="recommendations-section">
          <h2>Top Rated Anime</h2>
          <p className="section-description">
            Highly rated series loved by anime fans worldwide
          </p>
          <div className="anime-grid">
            {topAnime.map(anime => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Recommendations;