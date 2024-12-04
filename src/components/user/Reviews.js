import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { api } from '../../services/api';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import styled from '@emotion/styled';

// Styled Components
const ReviewsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

const ReviewCard = styled.div`
    display: grid;
    grid-template-columns: 200px 1fr;
    background: linear-gradient(145deg, rgba(26, 29, 35, 0.95), rgba(45, 47, 54, 0.95));
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const AnimeInfo = styled.div`
    padding: 20px;
    background: rgba(19, 21, 26, 0.5);
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);

    img {
        width: 100%;
        height: 260px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    h3 {
        color: #ffffff;
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.4;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    @media (max-width: 768px) {
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 16px;

        img {
            height: 200px;
        }
    }
`;

const ReviewContent = styled.div`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    p {
        color: #ffffff;
        line-height: 1.8;
        font-size: 1rem;
        margin: 0;
    }

    @media (max-width: 768px) {
        padding: 16px;
    }
`;

const ReviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
`;

const ReviewDate = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const DeleteButton = styled.button`
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        color: var(--primary-color);
        background: rgba(var(--primary-rgb), 0.1);
    }

    @media (max-width: 480px) {
        align-self: flex-end;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 48px 24px;
    background: linear-gradient(145deg, rgba(26, 29, 35, 0.95), rgba(45, 47, 54, 0.95));
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    p {
        color: #94a3b8;
        font-size: 1.1rem;
        margin: 0;
    }
`;

const LoadingError = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: ${props => props.isError ? 'var(--primary-color)' : '#ffffff'};
    font-size: 1.1rem;
`;

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

    if (loading) return <LoadingError>Loading reviews...</LoadingError>;
    if (error) return <LoadingError isError>{error}</LoadingError>;

    return (
        <ReviewsList>
            {reviews.length === 0 ? (
                <EmptyState>
                    <p>You haven't written any reviews yet</p>
                </EmptyState>
            ) : (
                reviews.map(review => (
                    <ReviewCard key={review.id}>
                        <AnimeInfo>
                            <img 
                                src={review.anime.images?.jpg?.image_url} 
                                alt={review.anime.title}
                            />
                            <h3>{review.anime.title}</h3>
                        </AnimeInfo>
                        <ReviewContent>
                            <ReviewHeader>
                                <ReviewDate>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </ReviewDate>
                                <DeleteButton 
                                    onClick={() => handleDeleteReview(review.id)}
                                    aria-label="Delete review"
                                >
                                    <Trash2 size={18} />
                                </DeleteButton>
                            </ReviewHeader>
                            <p>{review.content}</p>
                        </ReviewContent>
                    </ReviewCard>
                ))
            )}
        </ReviewsList>
    );
};

export default Reviews;