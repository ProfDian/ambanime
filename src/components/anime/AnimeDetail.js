// src/pages/AnimeDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { db } from '../../services/firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';

import './AnimeDetail.css';

const AnimeDetail = () => {
  const { id } = useParams();
  const { currentUser, isGuest } = useAuth();

  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userInteractions, setUserInteractions] = useState({
    isFavorite: false,
    isInWatchlist: false,
  });

  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch anime details and characters in parallel
        const [animeData, charactersData] = await Promise.all([
          api.getAnimeById(id),
          api.getAnimeCharacters(id),
        ]);

        // Check if we have valid data before setting state
        if (animeData.data) {
          setAnime(animeData.data);
        } else {
          throw new Error('No anime data received');
        }

        if (charactersData.data) {
          setCharacters(charactersData.data.slice(0, 6));
        }

        // Only fetch user-specific data if user is logged in and not a guest
        if (currentUser && !isGuest) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data();

            setUserInteractions({
              isFavorite: userData?.favorites?.includes(id) || false,
              isInWatchlist: userData?.watchlist?.includes(id) || false,
            });

            // Fetch reviews
            const reviewsRef = collection(db, 'reviews');
            const q = query(reviewsRef, where('animeId', '==', id));
            const reviewsSnapshot = await getDocs(q);

            const reviewsList = [];
            reviewsSnapshot.forEach((doc) => {
              reviewsList.push({ id: doc.id, ...doc.data() });
            });
            setReviews(reviewsList);
          } catch (err) {
            console.error('Error fetching user data:', err);
            // Don't set error state here as the main anime data is still valid
          }
        }
      } catch (err) {
        setError('Failed to load anime details. Please try again later.');
        console.error('Error fetching anime details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeData();
  }, [id, currentUser, isGuest]);

  const handleFavorite = async () => {
    if (isGuest) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        favorites: userInteractions.isFavorite
          ? arrayRemove(id)
          : arrayUnion(id),
      });

      setUserInteractions((prev) => ({
        ...prev,
        isFavorite: !prev.isFavorite,
      }));
    } catch (err) {
      console.error('Error updating favorites:', err);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleWatchlist = async () => {
    if (isGuest) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watchlist: userInteractions.isInWatchlist
          ? arrayRemove(id)
          : arrayUnion(id),
      });

      setUserInteractions((prev) => ({
        ...prev,
        isInWatchlist: !prev.isInWatchlist,
      }));
    } catch (err) {
      console.error('Error updating watchlist:', err);
      alert('Failed to update watchlist. Please try again.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (isGuest || !review.trim()) return;

    try {
      const reviewData = {
        animeId: id,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        content: review.trim(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      setReviews((prev) => [...prev, { id: docRef.id, ...reviewData }]);
      setReview('');
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!anime) return <div className="error">Anime not found</div>;

  return (
    <div className="anime-detail">
      <div className="anime-detail-header">
        <div
          className="anime-detail-banner"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${anime.images?.jpg?.large_image_url})`,
          }}
        >
          <div className="anime-detail-content">
            <div className="anime-poster">
              <img 
                src={anime.images?.jpg?.image_url} 
                alt={anime.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                }}
              />
            </div>
            <div className="anime-info">
              <h1>{anime.title}</h1>
              <h2>{anime.title_japanese}</h2>
              <div className="anime-stats">
                <span>Score: ★ {anime.score || 'N/A'}</span>
                <span>Rank: #{anime.rank || 'N/A'}</span>
                <span>Episodes: {anime.episodes || 'N/A'}</span>
                <span>Status: {anime.status}</span>
              </div>
              {!isGuest && (
                <div className="anime-actions">
                  <button
                    onClick={handleFavorite}
                    className={`action-button ${
                      userInteractions.isFavorite ? 'active' : ''
                    }`}
                  >
                    {userInteractions.isFavorite
                      ? 'Remove from Favorites'
                      : 'Add to Favorites'}
                  </button>
                  <button
                    onClick={handleWatchlist}
                    className={`action-button ${
                      userInteractions.isInWatchlist ? 'active' : ''
                    }`}
                  >
                    {userInteractions.isInWatchlist
                      ? 'Remove from Watchlist'
                      : 'Add to Watchlist'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="anime-detail-body">
        <section className="synopsis">
          <h3>Synopsis</h3>
          <p>{anime.synopsis || 'No synopsis available.'}</p>
        </section>

        <section className="characters">
          <h3>Characters</h3>
          <div className="characters-grid">
            {characters.length > 0 ? (
              characters.map((char) => (
                <div key={char.character.mal_id} className="character-card">
                  <img
                    src={char.character.images?.jpg?.image_url}
                    alt={char.character.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg'; // Add a placeholder image
                    }}
                  />
                  <div className="character-info">
                    <h4>{char.character.name}</h4>
                    <p>{char.role}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No character information available.</p>
            )}
          </div>
        </section>

        {!isGuest && (
          <section className="reviews">
            <h3>Reviews</h3>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review..."
                rows="4"
                maxLength="1000"
                required
              />
              <button 
                type="submit" 
                className="submit-review"
                disabled={!review.trim()}
              >
                Submit Review
              </button>
            </form>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="review-author">{review.userEmail}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-content">{review.content}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet. Be the first to review!</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnimeDetail;