// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Watchlist from '../components/user/Watchlist';
import Favorites from '../components/user/Favorites';
import Reviews from '../components/user/Reviews';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('favorites');
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    favoriteGenres: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        setUserData(userData);
        setProfileData({
          displayName: userData.displayName || '',
          bio: userData.bio || '',
          favoriteGenres: userData.favoriteGenres || ''
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

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
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
                />
              </div>
              <div className="form-group">
                <label>Favorite Genres</label>
                <input
                  type="text"
                  value={profileData.favoriteGenres}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    favoriteGenres: e.target.value
                  }))}
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
              <h1>{profileData.displayName || currentUser.email}</h1>
              {profileData.bio && <p className="bio">{profileData.bio}</p>}
              {profileData.favoriteGenres && (
                <p className="favorite-genres">
                  Favorite Genres: {profileData.favoriteGenres}
                </p>
              )}
              <button 
                onClick={() => setEditMode(true)} 
                className="edit-profile-button"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
          </button>
          <button
            className={`tab-button ${activeTab === 'watchlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            Watchlist
          </button>
          <button
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'favorites' && <Favorites />}
          {activeTab === 'watchlist' && <Watchlist />}
          {activeTab === 'reviews' && <Reviews />}
        </div>
      </div>
    </div>
  );
};

export default Profile;