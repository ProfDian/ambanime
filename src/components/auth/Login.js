// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getUserRole } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsGuest } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Special case for admin login
      if (email === "admin@gmail.com" && password === "hafiisadminnega") {
        const user = await loginUser(email, password);
        const role = await getUserRole(user.uid);
        if (role === 'admin') {
          navigate('/admin');
        } else {
          setError('Unauthorized access');
        }
        return;
      }

      await loginUser(email, password);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.code === 'auth/user-not-found' ? 'User not found' :
        err.code === 'auth/wrong-password' ? 'Invalid password' :
        err.code === 'auth/invalid-email' ? 'Invalid email format' :
        'Failed to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    navigate('/home');
  };

  return (
    <div className="auth-container">
      <div className="welcome-text">
        <h1>Welcome to AMBANIME</h1>
        <p>
          Discover the best collection of anime series, connect with fellow fans, 
          and keep track of your favorite shows. Join our community of anime 
          enthusiasts now!
        </p>
        <div className="welcome-features">
          <div className="feature">
            <span>✦</span>
            <p>Discover new anime series</p>
          </div>
          <div className="feature">
            <span>✦</span>
            <p>Create your watchlist</p>
          </div>
          <div className="feature">
            <span>✦</span>
            <p>Track your favorites</p>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Sign In</h2>
        
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
              className={error && !email ? 'invalid' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
              className={error && !password ? 'invalid' : ''}
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit" 
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-options">
          <div className="auth-separator">
            <span>or</span>
          </div>

          <button 
            onClick={handleGuestAccess} 
            className="guest-button"
            disabled={loading}
            type="button"
          >
            Continue as Guest
          </button>
        </div>

        <div className="auth-links">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-decoration">
        <div className="floating-images">
          <div className="floating-image img1"></div>
          <div className="floating-image img2"></div>
          <div className="floating-image img3"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;