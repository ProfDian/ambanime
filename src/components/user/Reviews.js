// src/user/Reviews.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { api } from '../../services/api';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

const Reviews = () => {
    const { currentUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const reviewsRef = collection(db, 'reviews');
                const reviewsQuery = query(reviewsRef, where('userId', '==', currentUser.uid));
                const reviewsSnapshot = await getDocs(reviewsQuery);
                const reviewsList = [];

                for (const doc of reviewsSnapshot.docs) {
                    const reviewData = doc.data();
                    const animeDetails = await api.getAnimeById(reviewData.animeId);
                    reviewsList.push({
                        id: doc.id,
                        ...reviewData,
                        anime: animeDetails.data
                    });
                }

                setReviews(reviewsList);
            } catch (err) {
                setError('Failed to load reviews');
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [currentUser]);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review. Please try again.');
        }
    };

    if (loading) return <div className="loading">Loading reviews...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="reviews-list">
            {reviews.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't written any reviews yet</p>
                </div>
            ) : (
                reviews.map(review => (
                    <div key={review.id} className="review-card">
                        <div className="review-anime-info">
                            <img 
                                src={review.anime.images?.jpg?.image_url} 
                                alt={review.anime.title}
                            />
                            <h3>{review.anime.title}</h3>
                        </div>
                        <div className="review-content">
                            <div className="review-header">
                                <span className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                                <button 
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="delete-review-btn"
                                    aria-label="Delete review"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p>{review.content}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Reviews;