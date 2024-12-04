import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import './Dashboard.css';
import { 
  collection, 
  getDocs,
  getDoc,
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState({
    email: '',
    username: '',
    bio: '',
    role: ''
  });
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalReviews: 0,
    totalFavorites: 0,
    totalWatchlist: 0,
    userActivityData: [],
    genreDistribution: []
  });

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersData = [];
      let totalFavorites = 0;
      let totalWatchlist = 0;
      const genreStats = {};
      const monthlyStats = {
        reviews: {},
        favorites: {},
        watchlist: {}
      };

      // Fetch reviews first
      const reviewsRef = collection(db, 'reviews');
      const reviewsSnapshot = await getDocs(reviewsRef);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      reviewsData.forEach(review => {
        if (review.createdAt) {
          const date = new Date(review.createdAt);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          monthlyStats.reviews[monthYear] = (monthlyStats.reviews[monthYear] || 0) + 1;
        }
      });

      // Process users
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const favorites = userData.favorites || [];
        const watchlist = userData.watchlist || [];
        const userReviews = reviewsData.filter(review => review.userId === userDoc.id);

        totalFavorites += favorites.length;
        totalWatchlist += watchlist.length;

        // Add to monthly stats
        const currentDate = new Date();
        const monthYear = `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        monthlyStats.favorites[monthYear] = (monthlyStats.favorites[monthYear] || 0) + favorites.length;
        monthlyStats.watchlist[monthYear] = (monthlyStats.watchlist[monthYear] || 0) + watchlist.length;

        usersData.push({
          id: userDoc.id,
          ...userData,
          favoritesCount: favorites.length,
          watchlistCount: watchlist.length,
          reviewsCount: userReviews.length
        });

        // Process genres from favorites
        for (const animeId of favorites) {
          try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
            if (!response.ok) continue;
            const animeData = await response.json();
            if (animeData.data?.genres) {
              animeData.data.genres.forEach(genre => {
                genreStats[genre.name] = (genreStats[genre.name] || 0) + 1;
              });
            }
          } catch (err) {
            console.error('Error fetching anime data:', err);
          }
        }
      }

      // Create activity data
      const userActivityData = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        userActivityData.push({
          month: new Date(date).toLocaleString('default', { month: 'short' }),
          reviews: monthlyStats.reviews[monthYear] || 0,
          favorites: monthlyStats.favorites[monthYear] || 0,
          watchlist: monthlyStats.watchlist[monthYear] || 0
        });
      }

      const genreDistribution = Object.entries(genreStats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setUsers(usersData);
      setStatistics({
        totalUsers: usersData.length,
        totalReviews: reviewsData.length,
        totalFavorites,
        totalWatchlist,
        userActivityData,
        genreDistribution
      });

    } catch (err) {
      setError('Failed to load admin dashboard data');
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        throw new Error('User not found');
      }

      const userData = userSnapshot.data();

      // Fetch favorites details
      const favorites = await Promise.all(
        (userData.favorites || []).map(async id => {
          try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data;
          } catch (err) {
            console.error(`Error fetching anime ${id}:`, err);
            return null;
          }
        })
      );

      // Fetch watchlist details
      const watchlist = await Promise.all(
        (userData.watchlist || []).map(async id => {
          try {
            const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data;
          } catch (err) {
            console.error(`Error fetching anime ${id}:`, err);
            return null;
          }
        })
      );

      // Fetch reviews with anime details
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('userId', '==', userId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = await Promise.all(
        reviewsSnapshot.docs.map(async doc => {
          try {
            const reviewData = doc.data();
            const response = await fetch(`https://api.jikan.moe/v4/anime/${reviewData.animeId}`);
            if (!response.ok) return null;
            const animeData = await response.json();
            return {
              id: doc.id,
              ...reviewData,
              anime: animeData.data
            };
          } catch (err) {
            console.error(`Error fetching review details:`, err);
            return null;
          }
        })
      );

      setUserDetails({
        ...userData,
        favorites: favorites.filter(Boolean).map(response => response.data),
        watchlist: watchlist.filter(Boolean).map(response => response.data),
        reviews: reviews.filter(Boolean)
      });
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  // Your existing handleUpdateUser, handleDeleteUser, and handleDeleteUserItem functions remain the same
  const handleUpdateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to update this user information?')) {
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      
      // Remove empty fields from update
      const updateData = Object.fromEntries(
        Object.entries(editingUser).filter(([_, value]) => value !== '')
      );

      await updateDoc(userRef, updateData);

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updateData } : user
      ));

      // Update selected user details if currently viewing
      if (selectedUser?.id === userId) {
        setUserDetails(prev => ({
          ...prev,
          ...updateData
        }));
        setSelectedUser(prev => ({
          ...prev,
          ...updateData
        }));
      }

      setEditMode(false);
      alert('User information updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user information');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete user's reviews
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, where('userId', '==', userId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      
      const reviewDeletions = reviewsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(reviewDeletions);

      // Delete user document
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setUserDetails(null);
      }

      alert('User account deleted successfully');
    } catch (err) {
      console.error('Error deleting user account:', err);
      setError('Failed to delete user account');
    } finally {
      setLoading(false);
    }
  };

  // Your existing handleDeleteUserItem function with favorites case added
  const handleDeleteUserItem = async (userId, itemType, itemId) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', userId);

      switch (itemType) {
        case 'watchlist':
          const userWatchlistSnapshot = await getDoc(userRef);
          if (!userWatchlistSnapshot.exists()) {
            throw new Error('User not found');
          }
          const currentWatchlist = userWatchlistSnapshot.data().watchlist || [];
          await updateDoc(userRef, {
            watchlist: currentWatchlist.filter(id => id !== itemId.toString())
          });
          setUserDetails(prev => ({
            ...prev,
            watchlist: prev.watchlist.filter(anime => anime.mal_id !== itemId)
          }));
          setUsers(users.map(user => {
            if (user.id === userId) {
              return {
                ...user,
                watchlistCount: user.watchlistCount - 1
              };
            }
            return user;
          }));
          break;

        case 'favorites':
          const userFavSnapshot = await getDoc(userRef);
          if (!userFavSnapshot.exists()) {
            throw new Error('User not found');
          }
          const currentFavorites = userFavSnapshot.data().favorites || [];
          await updateDoc(userRef, {
            favorites: currentFavorites.filter(id => id !== itemId.toString())
          });
          setUserDetails(prev => ({
            ...prev,
            favorites: prev.favorites.filter(anime => anime.mal_id !== itemId)
          }));
          setUsers(users.map(user => {
            if (user.id === userId) {
              return {
                ...user,
                favoritesCount: user.favoritesCount - 1
              };
            }
            return user;
          }));
          break;

        case 'review':
          const reviewRef = doc(db, 'reviews', itemId);
          await deleteDoc(reviewRef);
          setUserDetails(prev => ({
            ...prev,
            reviews: prev.reviews.filter(review => review.id !== itemId)
          }));
          break;

        default:
          throw new Error('Invalid item type');
      }

      alert(`${itemType} deleted successfully`);
    } catch (err) {
      console.error(`Error deleting ${itemType}:`, err);
      setError(`Failed to delete ${itemType}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter(user => 
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
  );   

  if (!isAdmin) {
    return <div className="error">Unauthorized access</div>;
  };
  return (
    <div className="admin-dashboard">
      <Navbar/>
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
          <div className="statistics-cards">
            <div className="stat-card">
              <div className="stat-icon users-icon">👥</div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p>{statistics.totalUsers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon reviews-icon">✍️</div>
              <div className="stat-info">
                <h3>Total Reviews</h3>
                <p>{statistics.totalReviews}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon favorites-icon">❤️</div>
              <div className="stat-info">
                <h3>Total Favorites</h3>
                <p>{statistics.totalFavorites}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon watchlist-icon">📺</div>
              <div className="stat-info">
                <h3>Total Watchlist</h3>
                <p>{statistics.totalWatchlist}</p>
              </div>
            </div>
          </div>
        </div>

      <div className="analytics-section">
      <div className="chart-container">
            <h2>Monthly Activity Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reviews" fill="#8884d8" name="Reviews" />
                <Bar dataKey="favorites" fill="#82ca9d" name="Favorites" />
                <Bar dataKey="watchlist" fill="#ffc658" name="Watchlist" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2>Popular Genres</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.genreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statistics.genreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      <div className="users-section">
        <div className="users-controls">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="users-list">
          <h2>Users Management</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Reviews</th>
                <th>Favorites</th>
                <th>Watchlist</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.reviewsCount || 0}</td>
                  <td>{user.favoritesCount}</td>
                  <td>{user.watchlistCount}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          fetchUserDetails(user.id);
                        }}
                        className="view-details-button"
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'View Details'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="delete-account-button"
                        disabled={loading}
                      >
                        {loading ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && userDetails && (
          <div className="user-details-panel">
            <div className="user-details-header">
              <h2>User Details: {selectedUser.email}</h2>
              {!editMode ? (
                <button
                  onClick={() => {
                    setEditMode(true);
                    setEditingUser({
                      email: selectedUser.email || '',
                      username: selectedUser.username || '',
                      bio: selectedUser.bio || '',
                      role: selectedUser.role || ''
                    });
                  }}
                  className="edit-button"
                >
                  Edit User Information
                </button>
              ) : null}
            </div>

            {editMode ? (
              <div className="edit-user-form">
                <h3>Edit User Information</h3>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="Enter new email"
                  />
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    placeholder="Enter new username"
                  />
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={editingUser.bio}
                    onChange={(e) => setEditingUser(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    placeholder="Enter new bio"
                  />
                </div>
                <div className="edit-actions">
                  <button
                    onClick={() => handleUpdateUser(selectedUser.id)}
                    className="update-button"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditingUser({ email: '', username: '', bio: '', role: '' });
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="user-details-content">
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
                        <button
                          onClick={() => handleDeleteUserItem(selectedUser.id, 'review', review.id)}
                          className="delete-button"
                          disabled={loading}
                        >
                          {loading ? 'Deleting...' : 'Delete Review'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
  <h3>Watchlist ({userDetails.watchlist.length})</h3>
  <div className="anime-grid">
    {userDetails.watchlist.map(anime => (
      <div key={anime.mal_id} className="anime-card">
        <div className="anime-image">
          <img src={anime.images.jpg.image_url} alt={anime.title} />
        </div>
        <div className="anime-info">
          <h4>{anime.title}</h4>
          <div className="button-container">
            <button
              onClick={() => handleDeleteUserItem(selectedUser.id, 'watchlist', anime.mal_id.toString())}
              className="delete-button"
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove from Watchlist'}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


<div className="details-section">
  <h3>Favorites ({userDetails.favorites.length})</h3>
  <div className="anime-grid">
    {userDetails.favorites.map(anime => (
      <div key={anime.mal_id} className="anime-card">
        <div className="anime-image">
          <img src={anime.images.jpg.image_url} alt={anime.title} />
        </div>
        <div className="anime-info">
          <h4>{anime.title}</h4>
          <div className="button-container">
            <button
              onClick={() => handleDeleteUserItem(selectedUser.id, 'favorites', anime.mal_id.toString())}
              className="delete-button"
              disabled={loading}
            >
              {loading ? 'Removing...' : 'Remove from Favorites'}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
              </div>
            )}
            
            <button
              onClick={() => {
                setSelectedUser(null);
                setUserDetails(null);
                setEditMode(false);
              }}
              className="close-button"
            >
              Close Details
            </button>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default Dashboard;