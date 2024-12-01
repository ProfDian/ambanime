// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../services/firebase';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, deleteUser } from 'firebase/auth';
import './Settings.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    email: currentUser?.email || '',
    displayName: '',
    bio: '',
    notificationPreferences: {
      emailNotifications: true,
      newRecommendations: true,
      favoriteUpdates: true
    },
    theme: 'light',
    language: 'en',
    privacy: {
      showFavorites: true,
      showWatchlist: true,
      showReviews: true
    }
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        setSettings(prev => ({
          ...prev,
          ...userData
        }));
      } catch (err) {
        setError('Failed to load user settings');
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [currentUser]);

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: settings.displayName,
        bio: settings.bio,
        notificationPreferences: settings.notificationPreferences,
        theme: settings.theme,
        language: settings.language,
        privacy: settings.privacy,
        updatedAt: new Date().toISOString()
      });

      if (settings.email !== currentUser.email) {
        await updateEmail(auth.currentUser, settings.email);
      }

      setSuccess('Settings updated successfully');
    } catch (err) {
      setError('Failed to update settings. Please try again.');
      console.error('Settings update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updatePassword(auth.currentUser, passwords.new);
      setSuccess('Password updated successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Failed to update password. Please try again.');
      console.error('Password update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      
      // Delete user authentication
      await deleteUser(auth.currentUser);

    } catch (err) {
      setError('Failed to delete account. Please try again.');
      console.error('Account deletion error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account Settings</h1>
      </div>

      <div className="settings-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <section className="settings-section">
          <h2>Profile Settings</h2>
          <form onSubmit={handleSettingsUpdate} className="settings-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({...settings, email: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={settings.displayName}
                onChange={e => setSettings({...settings, displayName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={settings.bio}
                onChange={e => setSettings({...settings, bio: e.target.value})}
                rows="4"
              />
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              Save Profile Changes
            </button>
          </form>
        </section>

        <section className="settings-section">
          <h2>Notification Preferences</h2>
          <div className="preferences-grid">
            <label className="preference-item">
              <input
                type="checkbox"
                checked={settings.notificationPreferences.emailNotifications}
                onChange={e => setSettings({
                  ...settings,
                  notificationPreferences: {
                    ...settings.notificationPreferences,
                    emailNotifications: e.target.checked
                  }
                })}
              />
              Email Notifications
            </label>

            <label className="preference-item">
              <input
                type="checkbox"
                checked={settings.notificationPreferences.newRecommendations}
                onChange={e => setSettings({
                  ...settings,
                  notificationPreferences: {
                    ...settings.notificationPreferences,
                    newRecommendations: e.target.checked
                  }
                })}
              />
              New Recommendations
            </label>

            <label className="preference-item">
              <input
                type="checkbox"
                checked={settings.notificationPreferences.favoriteUpdates}
                onChange={e => setSettings({
                  ...settings,
                  notificationPreferences: {
                    ...settings.notificationPreferences,
                    favoriteUpdates: e.target.checked
                  }
                })}
              />
              Favorite Anime Updates
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Privacy Settings</h2>
          <div className="preferences-grid">
            <label className="preference-item">
              <input
                type="checkbox"
                checked={settings.privacy.showFavorites}
                onChange={e => setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    showFavorites: e.target.checked
                  }
                })}
              />
              Show Favorites to Others
            </label>

            <label className="preference-item">
              <input
                type="checkbox"
                checked={settings.privacy.showWatchlist}
                onChange={e => setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    showWatchlist: e.target.checked
                  }
                })}
              />
              Show Watchlist to Others
            </label>

            <label className="preference-item">
              <input
                type="checkbox"
                checked={settings.privacy.showReviews}
                onChange={e => setSettings({
                  ...settings,
                  privacy: {
                    ...settings.privacy,
                    showReviews: e.target.checked
                  }
                })}
              />
              Show Reviews to Others
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordUpdate} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                required
                minLength="6"
              />
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              Update Password
            </button>
          </form>
        </section>

        <section className="settings-section danger-zone">
          <h2>Delete Account</h2>
          <p className="warning-text">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <button
            onClick={handleAccountDeletion}
            className={`delete-button ${deleteConfirm ? 'confirm' : ''}`}
            disabled={loading}
          >
            {deleteConfirm ? 'Click again to confirm deletion' : 'Delete Account'}
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;