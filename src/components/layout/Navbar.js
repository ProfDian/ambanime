import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/firebase';
import { Search } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, isAdmin, isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo">
          AMBA NIME
        </Link>

        {!isGuest && (
          <div className="search-container">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <Search size={18} />
              </button>
              {isSearching && <div className="search-loading" />}
            </form>
          </div>
        )}

        <div className="nav-links">
          <Link 
            to="/home" 
            className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            Home
          </Link>
          {!isGuest && (
            <>
              <Link 
                to="/recommendations" 
                className={`nav-link ${location.pathname === '/recommendations' ? 'active' : ''}`}
              >
                Recommendations
              </Link>
              <Link 
                to="/genres" 
                className={`nav-link ${location.pathname === '/genres' ? 'active' : ''}`}
              >
                Genre
              </Link>
            </>
          )}
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
        </div>

        <div className="auth-links">
          {currentUser ? (
            <>
              {isAdmin ? (
                <Link to="/admin" className="nav-link admin-link">
                  Admin Dashboard
                </Link>
              ) : (
                <Link 
                  to="/profile" 
                  className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  Profile
                </Link>
              )}
              <button onClick={handleLogout} className="auth-button logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-button login">
                Login
              </Link>
              <Link to="/register" className="auth-button register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;