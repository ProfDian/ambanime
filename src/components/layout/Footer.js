// src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>AmbaNime</h3>
          <p>Ambatukam Suka Menonton Anime saat sedang melakukan workout.</p>
          <div className="social-links">
            <a href="https://github.com/ProfDian/ambanime" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://x.com/jikanstudios?mx=2" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-x"></i>
            </a>
            <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-google"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home </Link></li>
            <li><Link to="/Profile">Profile</Link></li>
            <li><Link to="/genres">Genres</Link></li>
            <li><Link to="/Recommendations">Recommendations</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul className="contact-info">
            <li>
              <i className="fas fa-envelope"></i>
              <a href="mailto:fattah@gmail.com">fattah@gmail.com</a>
            </li>
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>Semarang, Indonesia</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AmbaNime. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;