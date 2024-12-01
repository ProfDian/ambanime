// src/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where,
  deleteDoc 
} from 'firebase/firestore';
import { api } from '../services/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = [];

      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        usersData.push({
          id: doc.id,
          ...userData,
          favoritesCount: userData.favorites?.length || 0,
          watchlistCount: userData.watchlist?.length || 0,
          lastActive: userData.lastActive || 'Never',
        });
      }

      setUsers(usersData);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const userDoc = await getDocs(doc(db, 'users', userId));
      const userData = userDoc.data();

      // Fetch anime details for favorites
      const favorites = await Promise.all(
        (userData.favorites || []).map(id => api.getAnimeById(id))
      );

      // Fetch anime details for watchlist
      const watchlist = await Promise.all(
        (userData.watchlist || []).map(id => api.getAnimeById(id))
      );

      // Fetch user's reviews
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('userId', '==', userId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = await Promise.all(
        reviewsSnapshot.docs.map(async (doc) => {
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

  const handleRoleUpdate = async (userId, newRole) => {
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

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { status: newStatus });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Delete user's reviews
        const reviewsRef = collection(db, 'reviews');
        const reviewsQuery = query(reviewsRef, where('userId', '==', userId));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        const deletePromises = reviewsSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);

        // Delete user document
        await deleteDoc(doc(db, 'users', userId));
        
        setUsers(users.filter(user => user.id !== userId));
        setSelectedUser(null);
        setUserDetails(null);
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>User Management</h2>
        <div className="management-controls">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Display Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Favorites</th>
              <th>Watchlist</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.displayName || '-'}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </td>
                <td>{user.favoritesCount}</td>
                <td>{user.watchlistCount}</td>
                <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      fetchUserDetails(user.id);
                    }}
                    className="view-button"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && userDetails && (
        <div className="user-details-modal">
          <div className="modal-content">
            <h3>User Details: {selectedUser.email}</h3>
            <div className="details-sections">
              <section className="favorites-section">
                <h4>Favorites ({userDetails.favorites.length})</h4>
                <div className="anime-list">
                  {userDetails.favorites.map(anime => (
                    <div key={anime.mal_id} className="anime-item">
                      <img src={anime.images.jpg.image_url} alt={anime.title} />
                      <span>{anime.title}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="reviews-section">
                <h4>Reviews ({userDetails.reviews.length})</h4>
                <div className="reviews-list">
                  {userDetails.reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <h5>{review.anime.title}</h5>
                      <p>{review.content}</p>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;