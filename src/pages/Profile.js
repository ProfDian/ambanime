import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Watchlist from '../components/user/Watchlist';
import Favorites from '../components/user/Favorites';
import Reviews from '../components/user/Reviews';
import { Heart, Clock, MessageSquare, Edit3 } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('favorites');
  const [editMode, setEditMode] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    favoriteGenres: []
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        
        // Fetch reviews count
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(reviewsRef, where('userId', '==', currentUser.uid));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsCount = reviewsSnapshot.size;
        
        setReviewCount(reviewsCount);
        setUserData({ ...userData, reviewsCount });
        setProfileData({
          displayName: userData?.displayName || '',
          bio: userData?.bio || '',
          favoriteGenres: Array.isArray(userData?.favoriteGenres) ? userData.favoriteGenres : []
        });
      } catch (err) {
        setError('Failed to load profile data. Please try again later.');
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      setEditMode(false);
      setUserData(prev => ({ ...prev, ...profileData }));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleRemoveFromFavorites = async (animeId, e) => {
    e.stopPropagation();
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        favorites: arrayRemove(animeId)
      });
      setUserData(prev => ({
        ...prev,
        favorites: prev.favorites.filter(id => id !== animeId)
      }));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove from favorites');
    }
  };

  const handleRemoveFromWatchlist = async (animeId, e) => {
    e.stopPropagation();
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        watchlist: arrayRemove(animeId)
      });
      setUserData(prev => ({
        ...prev,
        watchlist: prev.watchlist.filter(id => id !== animeId)
      }));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError('Failed to remove from watchlist');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="loading">Loading profile...</div>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="error">{error}</div>
      <Footer />
    </>
  );

  return (
    <div className="main-layout">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-inner">
            {/* Avatar Section */}
            <div className="profile-avatar">
              <div className="avatar-circle">
                <span>{profileData.displayName?.charAt(0) || currentUser.email?.charAt(0)}</span>
              </div>
            </div>
  
            {/* Profile Info Section */}
            <div className="profile-info">
              {editMode ? (
                <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        displayName: e.target.value
                      }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        bio: e.target.value
                      }))}
                      className="form-textarea"
                    />
                  </div>
                  <div className="form-group">
                    <label>Favorite Genres</label>
                    <input
                      type="text"
                      value={profileData.favoriteGenres.join(', ')}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        favoriteGenres: e.target.value.split(',').map(genre => genre.trim()).filter(genre => genre !== '')
                      }))}
                      placeholder="Action, Romance, Comedy..."
                      className="form-input"
                    />
                  </div>
                  <div className="profile-edit-actions">
                    <button type="submit" className="save-button">Save Changes</button>
                    <button 
                      type="button" 
                      onClick={() => setEditMode(false)} 
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="profile-name">
                    <h1>{profileData.displayName || currentUser.email}</h1>
                    <button 
                      onClick={() => setEditMode(true)} 
                      className="edit-profile-button"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>
                  {profileData.bio && <p className="bio">{profileData.bio}</p>}
                  {profileData.favoriteGenres?.length > 0 && (
                    <div className="genre-tags">
                      {profileData.favoriteGenres.map((genre, index) => (
                        <span key={index} className="genre-tag">{genre}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
  
            {/* Stats Section */}
            <div className="profile-stats">
              <div className="stat-item">
                <Heart size={20} />
                <span>{userData?.favorites?.length || 0}</span>
                <label>Favorites</label>
              </div>
              <div className="stat-item">
                <Clock size={20} />
                <span>{userData?.watchlist?.length || 0}</span>
                <label>Watchlist</label>
              </div>
              <div className="stat-item">
                <MessageSquare size={20} />
                <span>{reviewCount}</span>
                <label>Reviews</label>
              </div>
            </div>
          </div>
        </div>
  
        {/* Content Section */}
        <div className="profile-content">
          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <Heart size={16} />
              Favorites
            </button>
            <button
              className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('watchlist')}
            >
              <Clock size={16} />
              Watchlist
            </button>
            <button
              className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageSquare size={16} />
              Reviews
            </button>
          </div>
  
          <div className="tab-content">
            {activeTab === 'favorites' && (
              <Favorites 
                favorites={userData?.favorites || []}
                onRemove={handleRemoveFromFavorites} 
              />
            )}
            {activeTab === 'watchlist' && (
              <Watchlist 
                watchlist={userData?.watchlist || []}
                onRemove={handleRemoveFromWatchlist} 
              />
            )}
            {activeTab === 'reviews' && <Reviews userId={currentUser.uid} />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;