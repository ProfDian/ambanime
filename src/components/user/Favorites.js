// src/user/Favorites.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { api } from '../../services/api';

const Favorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        
        if (userData.favorites?.length) {
          const animeList = await Promise.all(
            userData.favorites.map(id => api.getAnimeById(id))
          );
          setFavorites(animeList.map(response => response.data));
        } else {
          setFavorites([]);
        }
      } catch (err) {
        setError('Failed to load favorites');
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  const removeFromFavorites = async (animeId) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        favorites: arrayRemove(animeId)
      });
      setFavorites(prev => prev.filter(anime => anime.mal_id !== animeId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  if (loading) return <div className="loading">Loading favorites...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-favorites">
      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>Your favorites list is empty</p>
          <p>Add anime to your favorites to keep track of your most loved series</p>
        </div>
      ) : (
        <div className="anime-grid">
          {favorites.map(anime => (
            <div key={anime.mal_id} className="anime-card">
              <img 
                src={anime.images.jpg.image_url} 
                alt={anime.title} 
                className="anime-image"
              />
              <div className="anime-info">
                <h3>{anime.title}</h3>
                <div className="anime-meta">
                  <span>★ {anime.score}</span>
                  <span>{anime.type}</span>
                </div>
                <button 
                  onClick={() => removeFromFavorites(anime.mal_id)}
                  className="remove-button"
                >
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;