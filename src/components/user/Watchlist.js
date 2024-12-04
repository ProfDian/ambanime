import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { api } from '../../services/api';
import { doc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // Assuming you're using lucide-react for icons

const Watchlist = () => {
  const { currentUser } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWatchlist = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      if (userData?.watchlist?.length) {
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
  }, [currentUser]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const removeFromWatchlist = async (animeId, e) => {
    if (!currentUser?.uid || !animeId) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watchlist: arrayRemove(String(animeId))
      });

      setWatchlist(prevWatchlist => 
        prevWatchlist.filter(anime => anime.mal_id !== animeId)
      );

      await fetchWatchlist();
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError('Failed to remove from watchlist');
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      Loading your watchlist...
    </div>
  );

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-watchlist">
      {watchlist.length === 0 ? (
        <div className="empty-state">
          <p>Your watchlist is empty</p>
          <p>Discover and add anime you want to watch</p>
          <Link to="/browse" className="cta-button">Browse Anime</Link>
        </div>
      ) : (
        <div className="anime-grid">
          {watchlist.map(anime => (
            <div key={anime.mal_id} className="anime-card-container">
              <Link to={`/anime/${anime.mal_id}`} className="anime-card">
                <img 
                  src={anime.images.jpg.image_url} 
                  alt={anime.title} 
                  className="anime-image"
                  loading="lazy"
                />
                <div className="anime-info">
                  <h3>{anime.title}</h3>
                  <div className="anime-meta">
                    <span>{anime.type}</span>
                    <span>{anime.episodes || 'Unknown'} episodes</span>
                  </div>
                </div>
              </Link>
              <button 
                onClick={(e) => removeFromWatchlist(anime.mal_id, e)}
                className="remove-button"
                aria-label="Remove from watchlist"
              >
                <Trash2 size={16} /> Remove From Watchlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;