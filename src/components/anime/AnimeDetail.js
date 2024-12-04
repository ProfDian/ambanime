// src/pages/AnimeDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
// Import icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faList, 
  faClock, 
  faPaperPlane 
} from '@fortawesome/free-solid-svg-icons';

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

        const [animeData, charactersData] = await Promise.all([
          api.getAnimeById(id),
          api.getAnimeCharacters(id),
        ]);

        if (animeData.data) {
          setAnime(animeData.data);
        } else {
          throw new Error('No anime data received');
        }

        if (charactersData.data) {
          setCharacters(charactersData.data.slice(0, 6));
        }

        if (currentUser && !isGuest) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();

          setUserInteractions({
            isFavorite: userData?.favorites?.includes(id) || false,
            isInWatchlist: userData?.watchlist?.includes(id) || false,
          });

          const reviewsRef = collection(db, 'reviews');
          const q = query(reviewsRef, where('animeId', '==', id));
          const reviewsSnapshot = await getDocs(q);

          const reviewsList = [];
          reviewsSnapshot.forEach((doc) => {
            reviewsList.push({ id: doc.id, ...doc.data() });
          });
          setReviews(reviewsList);
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
        favorites: userInteractions.isFavorite ? arrayRemove(id) : arrayUnion(id),
      });
      setUserInteractions(prev => ({
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
        watchlist: userInteractions.isInWatchlist ? arrayRemove(id) : arrayUnion(id),
      });
      setUserInteractions(prev => ({
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
      setReviews(prev => [...prev, { id: docRef.id, ...reviewData }]);
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
      {/* Navbar */}
      <Navbar /> 
      <div className="anime-detail-header">
        <div
          className="anime-detail-banner"
          style={{
            backgroundImage: `url(${anime.images?.jpg?.large_image_url})`,
          }}
        />
        <div className="anime-detail-content">
          <div className="anime-poster">
            <img 
              src={anime.images?.jpg?.image_url} 
              alt={anime.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
          <div className="anime-info">
            <h1>{anime.title}</h1>
            <h2>{anime.title_japanese}</h2>
            <div className="anime-stats">
              <div className="stat-item">
                <div className="stat-label">Score</div>
                <div className="stat-value">★ {anime.score || 'N/A'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Rank</div>
                <div className="stat-value">#{anime.rank || 'N/A'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Episodes</div>
                <div className="stat-value">{anime.episodes || 'N/A'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Status</div>
                <div className="stat-value">{anime.status}</div>
              </div>
            </div>
            {!isGuest && (
              <div className="anime-actions">
                <button
                  onClick={handleFavorite}
                  className={`action-button ${userInteractions.isFavorite ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faHeart} />
                  {userInteractions.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                </button>
                <button
                  onClick={handleWatchlist}
                  className={`action-button ${userInteractions.isInWatchlist ? 'active' : ''}`}
                >
                  <FontAwesomeIcon icon={faList} />
                  {userInteractions.isInWatchlist ? 'Remove Watchlist' : 'Add Watchlist'}
                </button>
              </div>
            )}
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
                <Link 
                  key={char.character.mal_id}
                  to={`/character/${char.character.mal_id}`}
                  className="character-card"
                >
                  <img
                    src={char.character.images?.jpg?.image_url}
                    alt={char.character.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="character-info">
                    <h4>{char.character.name}</h4>
                    <p>{char.role}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p>No character information available.</p>
            )}
          </div>
        </section>

        {!isGuest && (
          <section className="review-section">
            <h3>Reviews</h3>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this anime..."
                rows="4"
                maxLength="1000"
                required
              />
              <button 
                type="submit" 
                className="submit-review"
                disabled={!review.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Submit Review</span>
              </button>
            </form>
            <div className="reviews-list">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-author">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userEmail}`} 
                          alt={review.userEmail} 
                        />
                        <span>{review.userEmail}</span>
                      </div>
                      <div className="review-metadata">
                        <FontAwesomeIcon icon={faClock} />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="review-content">{review.content}</div>
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </section>
        )}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AnimeDetail;