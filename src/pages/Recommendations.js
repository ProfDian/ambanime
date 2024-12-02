import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AnimeCard from '../components/anime/AnimeCard';
import './Recommendations.css';

const Recommendations = () => {
  const { currentUser, isGuest } = useAuth();
  const [topAnime, setTopAnime] = useState([]);
  const [personalizedRecs, setPersonalizedRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk menangani rate limiting dan retry
  const fetchWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (response.status === 429) {
          // Rate limit hit - tunggu sebentar sebelum mencoba lagi
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch top anime
        const topResponse = await fetchWithRetry(
          'https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=10'
        );
        setTopAnime(topResponse.data || []);

        // Fetch personalized recommendations jika user login
        if (currentUser && !isGuest) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();

          if (userData?.favorites?.length) {
            // Ambil hanya 2 favorit teratas untuk rekomendasi
            const topFavorites = userData.favorites.slice(0, 2);
            
            // Fetch recommendations secara sequential untuk menghindari rate limiting
            let allRecs = [];
            for (const animeId of topFavorites) {
              try {
                const recsResponse = await fetchWithRetry(
                  `https://api.jikan.moe/v4/anime/${animeId}/recommendations`
                );
                
                if (recsResponse.data) {
                  allRecs = [...allRecs, ...recsResponse.data];
                }
                
                // Tunggu sebentar sebelum request berikutnya
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (err) {
                console.error(`Error fetching recommendations for anime ${animeId}:`, err);
                continue;
              }
            }

            // Proses dan filter rekomendasi
            const processedRecs = allRecs
              .filter((rec, index, self) => 
                index === self.findIndex(r => r.entry.mal_id === rec.entry.mal_id)
              )
              .sort((a, b) => b.votes - a.votes) // Sort by votes
              .slice(0, 10); // Take top 10

            // Fetch minimal details yang dibutuhkan
            const detailedRecs = await Promise.all(
              processedRecs.map(rec => 
                fetchWithRetry(`https://api.jikan.moe/v4/anime/${rec.entry.mal_id}`)
              )
            );

            setPersonalizedRecs(detailedRecs.map(response => response.data));
          }
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, isGuest]);

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
            <button onClick={() => window.location.reload()} className="retry-button">
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