import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import './Favorites.css';
import { Trash2 } from 'lucide-react'; 


const Favorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      if (userData?.favorites?.length) {
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
  }, [currentUser]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFromFavorites = async (animeId, e) => {
    if (!currentUser?.uid || !animeId) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        favorites: arrayRemove(String(animeId))
      });
      
      setFavorites(prevFavorites => 
        prevFavorites.filter(anime => anime.mal_id !== animeId)
      );

      await fetchFavorites();
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove from favorites');
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
            <div key={anime.mal_id} className="anime-card-container">
              <Link to={`/anime/${anime.mal_id}`} className="anime-card">
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
                </div>
              </Link>
              <button 
                onClick={(e) => removeFromFavorites(anime.mal_id, e)}
                className="remove-button"
                aria-label="Remove from favorites"
              > <Trash2 size={16} />
                Remove from Favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;