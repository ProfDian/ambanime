// src/components/layout/Banner.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Banner.css';

const Banner = ({ animeList }) => {
  const { isGuest } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % animeList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [animeList.length]);

  return (
    <div className="banner">
      <div className="banner-slider">
        {animeList.map((anime, index) => (
          <div
            key={anime.mal_id}
            className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), 
                               url(${anime.images.jpg.large_image_url})`
            }}
          >
            <div className="banner-content">
              <h1 className="banner-title">{anime.title}</h1>
              <p className="banner-synopsis">
                {anime.synopsis?.slice(0, 200)}...
              </p>
              {!isGuest && (
                <Link to={`/anime/${anime.mal_id}`} className="banner-button">
                  Learn More
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="banner-indicators">
        {animeList.map((_, index) => (
          <button
            key={index}
            className={`banner-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;