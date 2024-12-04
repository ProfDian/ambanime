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
import CharacterGallery from './components/anime/CharacterGallery';
import Genres from './pages/Genres';
import Recommendations from './pages/Recommendations';
import Search from './pages/Search';
import Dashboard from './components/admin/Dashboard';
import './App.css';

const GuestRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/home" />;
};

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { currentUser, isGuest } = useAuth();
  return currentUser || isGuest ? children : <Navigate to="/login" />;
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
                    <Home />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/about" element={
                <ProtectedRoute>
                  <div>
                    <About />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <div>
                    <Profile />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/anime/:id" element={
                <ProtectedRoute>
                  <div>
                    <AnimeDetail />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/character/:id" element={
                <ProtectedRoute>
                  <div>
                    <CharacterGallery />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/genres" element={
                <ProtectedRoute>
                  <div>
                    <Genres />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/recommendations" element={
                <ProtectedRoute>
                  <div>
                    <Recommendations />
                  </div>
                </ProtectedRoute>
              } />

              <Route path="/search" element={
                <ProtectedRoute>
                  <div>
                    <Search />
                  </div>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <div>
                    <Dashboard/>
                  </div>
                </ProtectedRoute>
              } />

              {/* 404 Route */}
              <Route path="*" element={
                <div>
                  <Navbar />
                  <div className="not-found">
                    <h1>404: Page Not Found</h1>
                    <p>The page you're looking for doesn't exist just yet.</p>
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