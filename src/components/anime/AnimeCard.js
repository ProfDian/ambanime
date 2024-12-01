// src/components/anime/AnimeCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Calendar, Play } from 'lucide-react';
import './AnimeCard.css';

const AnimeCard = ({ anime, view = 'grid', style }) => {
  const { isGuest } = useAuth();
  const {
    mal_id,
    title,
    images,
    score,
    episodes,
    status,
    aired,
    type
  } = anime;

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'currently airing':
        return 'status-airing';
      case 'finished airing':
        return 'status-completed';
      case 'not yet aired':
        return 'status-upcoming';
      default:
        return '';
    }
  };

  const formatAiredDate = (date) => {
    if (!date) return 'TBA';
    return new Date(date).getFullYear();
  };

  return (
    <div className="anime-card" style={style}>
      <Link to={isGuest ? '#' : `/anime/${mal_id}`} className="anime-card-link">
        <div className="anime-card-image">
          <img
            src={images?.jpg?.image_url || '/placeholder-image.jpg'}
            alt={title}
            loading="lazy"
          />
          <div className={`anime-card-status ${getStatusClass(status)}`}>
            {status}
          </div>
          <div className="anime-card-score">
            <Star size={14} />
            <span>{score ? score.toFixed(1) : 'N/A'}</span>
          </div>
        </div>
        <div className="anime-card-content">
          <h3 className="anime-card-title">{title}</h3>
          <div className="anime-card-info">
            <div className="info-item">
              <Play size={14} />
              <span>{episodes ? `${episodes} eps` : 'Unknown'}</span>
            </div>
            <div className="info-item">
              <Calendar size={14} />
              <span>{formatAiredDate(aired?.from)}</span>
            </div>
          </div>
          <div className="anime-card-type">
            {type}
          </div>
        </div>
        {view === 'list' && (
          <div className="anime-card-description">
            {anime.synopsis?.slice(0, 150)}...
          </div>
        )}
      </Link>
    </div>
  );
};

export default AnimeCard;