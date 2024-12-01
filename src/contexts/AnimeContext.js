// src/contexts/AnimeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const AnimeContext = createContext();

export const useAnime = () => {
  return useContext(AnimeContext);
};

export const AnimeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnimeData = async () => {
      if (!currentUser) {
        setFavorites([]);
        setWatchlist([]);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFavorites(userData.favorites || []);
          setWatchlist(userData.watchlist || []);
        }
      } catch (error) {
        console.error('Error fetching user anime data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnimeData();
  }, [currentUser]);

  const addToFavorites = async (animeId) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        favorites: arrayUnion(animeId)
      });
      setFavorites(prev => [...prev, animeId]);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (animeId) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        favorites: arrayRemove(animeId)
      });
      setFavorites(prev => prev.filter(id => id !== animeId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const addToWatchlist = async (animeId) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watchlist: arrayUnion(animeId)
      });
      setWatchlist(prev => [...prev, animeId]);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (animeId) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watchlist: arrayRemove(animeId)
      });
      setWatchlist(prev => prev.filter(id => id !== animeId));
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const isInFavorites = (animeId) => {
    return favorites.includes(animeId);
  };

  const isInWatchlist = (animeId) => {
    return watchlist.includes(animeId);
  };

  const value = {
    favorites,
    watchlist,
    loading,
    addToFavorites,
    removeFromFavorites,
    addToWatchlist,
    removeFromWatchlist,
    isInFavorites,
    isInWatchlist
  };

  return (
    <AnimeContext.Provider value={value}>
      {children}
    </AnimeContext.Provider>
  );
};