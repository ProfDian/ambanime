// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AnimeProvider } from './contexts/AnimeContext';
import { useAuth } from './contexts/AuthContext';

// Import components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AnimeDetail from './components/anime/AnimeDetail';
import Genres from './pages/Genres';
import Recommendations from './pages/Recommendations';
import Search from './pages/Search';
import Settings from './pages/Settings';
import AdminDashboard from './components/admin/Dashboard';

import './App.css';

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { currentUser, isGuest } = useAuth();
  return currentUser || isGuest ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  return currentUser && isAdmin ? children : <Navigate to="/" />;
};

const GuestRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/home" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimeProvider>
          <div className="app">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              } />
              
              <Route path="/register" element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              } />

              {/* Protected Routes with Layout */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Home />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/about" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <About />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Profile />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/anime/:id" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <AnimeDetail />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/genres" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Genres />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/recommendations" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Recommendations />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/search" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Search />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <div>
                    <Navbar />
                    <Settings />
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <div>
                    <Navbar />
                    <AdminDashboard />
                    <Footer />
                  </div>
                </AdminRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <div>
                  <Navbar />
                  <div className="not-found">
                    <h1>404: Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                  <Footer />
                </div>
              } />
            </Routes>
          </div>
        </AnimeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;