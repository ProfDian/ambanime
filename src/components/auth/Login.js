// src/components/auth/Login.js
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getUserRole } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import AuthForm from './LoginForm';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { setIsGuest } = useAuth();

  const handleLogin = async (email, password) => {
    // Special case for admin login
    if (email === "admin@gmail.com" && password === "hafiisadminnega") {
      const user = await loginUser(email, password);
      const role = await getUserRole(user.uid);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        throw new Error('Unauthorized access');
      }
      return;
    }

    await loginUser(email, password);
    navigate('/home');
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
        <AuthForm onSubmit={handleLogin} />

        <div className="auth-options">
          <div className="auth-separator">
            <span>or</span>
          </div>

          <button 
            onClick={handleGuestAccess} 
            className="guest-button"
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