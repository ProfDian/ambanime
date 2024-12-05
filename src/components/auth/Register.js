import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/firebase';
import RegisterForm from './RegisterForm';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (email, password) => {
    await registerUser(email, password);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="welcome-text">
        <h1>Welcome to AMBANIME</h1>
        <p>
          Join our community of anime enthusiasts. Create an account to track your favorite
          shows, write reviews, and discover new series that match your interests.
        </p>
        <div className="welcome-features">
          <div className="feature">
            <span>✦</span>
            <p>Create your personalized watchlist</p>
          </div>
          <div className="feature">
            <span>✦</span>
            <p>Rate and review your favorite anime</p>
          </div>
          <div className="feature">
            <span>✦</span>
            <p>Get curated recommendations</p>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Join AMBA NIME</h2>
        <RegisterForm onSubmit={handleRegister} />

        <div className="auth-links">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;