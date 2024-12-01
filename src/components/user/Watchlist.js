// src/user/Watchlist.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { api } from '../../services/api';
import { doc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';


const Watchlist = () => {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        
        if (userData.watchlist?.length) {
          const animeList = await Promise.all(
            userData.watchlist.map(id => api.getAnimeById(id))
          );
          setWatchlist(animeList.map(response => response.data));
        } else {
          setWatchlist([]);
        }
      } catch (err) {
        setError('Failed to load watchlist');
        console.error('Error fetching watchlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [currentUser]);

  const removeFromWatchlist = async (animeId) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watchlist: arrayRemove(animeId)
      });
      setWatchlist(prev => prev.filter(anime => anime.mal_id !== animeId));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
  };

  if (loading) return <div className="loading">Loading watchlist...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-watchlist">
      {watchlist.length === 0 ? (
        <div className="empty-state">
          <p>Your watchlist is empty</p>
          <p>Add anime to your watchlist to keep track of what you want to watch</p>
        </div>
      ) : (
        <div className="anime-grid">
          {watchlist.map(anime => (
            <div key={anime.mal_id} className="anime-card">
              <img 
                src={anime.images.jpg.image_url} 
                alt={anime.title} 
                className="anime-image"
              />
              <div className="anime-info">
                <h3>{anime.title}</h3>
                <div className="anime-meta">
                  <span>{anime.type}</span>
                  <span>{anime.episodes} episodes</span>
                </div>
                <button 
                  onClick={() => removeFromWatchlist(anime.mal_id)}
                  className="remove-button"
                >
                  Remove from Watchlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;