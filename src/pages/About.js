// src/pages/About.js
import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import { Compass, BookOpen, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-banner">
        <div className="about-banner-content">
          <h1>About AMBA NIME</h1>
          <p>Your gateway to the world of anime</p>
        </div>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            AMBA NIME is dedicated to providing anime enthusiasts with a comprehensive
            platform to discover, track, and engage with their favorite anime series.
            We strive to create a community where fans can share their passion and
            discover new series that match their interests.
          </p>
        </section>

        <section className="about-section features">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Compass size={32} />
              </div>
              <h3>Discover</h3>
              <p>
                Explore a vast collection of anime series across different genres,
                from action and adventure to slice of life and romance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={32} />
              </div>
              <h3>Track</h3>
              <p>
                Keep track of your favorite series and maintain a personal watchlist
                to organize your anime viewing experience.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Engage</h3>
              <p>
                Share your thoughts through reviews and discover recommendations
                based on your preferences and favorite series.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section membership">
          <h2>Membership Levels</h2>
          <div className="membership-grid">
            <div className="membership-card">
              <h3>Guest</h3>
              <p>
                Browse our extensive anime collection and get a taste of what
                AMBA NIME has to offer.
              </p>
            </div>

            <div className="membership-card">
              <h3>Registered User</h3>
              <p>
                Full access to all features including personalized lists,
                reviews, and recommendations.
              </p>
              <Link to="/register" className="cta-button">
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>

        <section className="about-section data-source">
          <h2>Data Source</h2>
          <p>
            AMBA NIME utilizes the Jikan API to provide up-to-date and accurate
            information about anime series. We are committed to maintaining data
            quality and reliability in our service.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;