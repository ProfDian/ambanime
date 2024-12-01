// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { api } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalReviews: 0,
    totalFavorites: 0,
    totalWatchlist: 0
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAdmin) {
        setError('Unauthorized access');
        return;
      }

      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = [];
        let totalReviews = 0;
        let totalFavorites = 0;
        let totalWatchlist = 0;

        for (const doc of usersSnapshot.docs) {
          const userData = doc.data();
          usersData.push({
            id: doc.id,
            ...userData,
            favoritesCount: userData.favorites?.length || 0,
            watchlistCount: userData.watchlist?.length || 0
          });

          totalFavorites += userData.favorites?.length || 0;
          totalWatchlist += userData.watchlist?.length || 0;
        }

        // Get total reviews
        const reviewsRef = collection(db, 'reviews');
        const reviewsSnapshot = await getDocs(reviewsRef);
        totalReviews = reviewsSnapshot.size;

        setUsers(usersData);
        setStatistics({
          totalUsers: usersData.length,
          totalReviews,
          totalFavorites,
          totalWatchlist
        });
      } catch (err) {
        setError('Failed to load admin dashboard data');
        console.error('Admin dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin]);

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const userDoc = await getDocs(doc(db, 'users', userId));
      const userData = userDoc.data();

      // Fetch details for favorite anime
      const favorites = await Promise.all(
        (userData.favorites || []).map(id => api.getAnimeById(id))
      );

      // Fetch details for watchlist anime
      const watchlist = await Promise.all(
        (userData.watchlist || []).map(id => api.getAnimeById(id))
      );

      // Fetch user's reviews with anime details
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('userId', '==', userId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = await Promise.all(
        reviewsSnapshot.docs.map(async doc => {
          const reviewData = doc.data();
          const animeDetails = await api.getAnimeById(reviewData.animeId);
          return {
            id: doc.id,
            ...reviewData,
            anime: animeDetails.data
          };
        })
      );

      setUserDetails({
        ...userData,
        favorites: favorites.map(response => response.data),
        watchlist: watchlist.map(response => response.data),
        reviews
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  if (!isAdmin) {
    return <div className="error">Unauthorized access</div>;
  }

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="statistics-cards">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{statistics.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Reviews</h3>
            <p>{statistics.totalReviews}</p>
          </div>
          <div className="stat-card">
            <h3>Total Favorites</h3>
            <p>{statistics.totalFavorites}</p>
          </div>
          <div className="stat-card">
            <h3>Total Watchlist</h3>
            <p>{statistics.totalWatchlist}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="users-list">
          <h2>Users Management</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Favorites</th>
                <th>Watchlist</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleUpdate(user.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{user.favoritesCount}</td>
                  <td>{user.watchlistCount}</td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        fetchUserDetails(user.id);
                      }}
                      className="view-details-button"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && userDetails && (
          <div className="user-details-panel">
            <h2>User Details: {selectedUser.email}</h2>
            <div className="user-details-content">
              <div className="details-section">
                <h3>Favorites ({userDetails.favorites.length})</h3>
                <div className="anime-grid">
                  {userDetails.favorites.map(anime => (
                    <div key={anime.mal_id} className="anime-card">
                      <img src={anime.images.jpg.image_url} alt={anime.title} />
                      <div className="anime-info">
                        <h4>{anime.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-section">
                <h3>Watchlist ({userDetails.watchlist.length})</h3>
                <div className="anime-grid">
                  {userDetails.watchlist.map(anime => (
                    <div key={anime.mal_id} className="anime-card">
                      <img src={anime.images.jpg.image_url} alt={anime.title} />
                      <div className="anime-info">
                        <h4>{anime.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="details-section">
                <h3>Reviews ({userDetails.reviews.length})</h3>
                <div className="reviews-list">
                  {userDetails.reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <h4>{review.anime.title}</h4>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;