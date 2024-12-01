// src/components/anime/AnimeList.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Grid, List, BarChart2, Clock, Type, TrendingUp } from 'lucide-react';
import AnimeCard from './AnimeCard';
import './AnimeList.css';

const AnimeList = ({ 
  animeData = [], 
  title = '', 
  onLoadMore, 
  hasMore = false, 
  loading = false,
  category = ''
}) => {
  const { isGuest } = useAuth();
  const [sortBy, setSortBy] = useState('popularity');
  const [view, setView] = useState('grid');

  const sortAnime = (anime) => {
    if (!Array.isArray(anime)) return [];
    
    switch (sortBy) {
      case 'score':
        return [...anime].sort((a, b) => (b.score || 0) - (a.score || 0));
      case 'title':
        return [...anime].sort((a, b) => a.title.localeCompare(b.title));
      case 'recent':
        return [...anime].sort((a, b) => 
          new Date(b.aired?.from || 0) - new Date(a.aired?.from || 0)
        );
      default:
        return anime;
    }
  };

  const renderSortIcon = () => {
    switch (sortBy) {
      case 'score':
        return <BarChart2 size={16} />;
      case 'title':
        return <Type size={16} />;
      case 'recent':
        return <Clock size={16} />;
      default:
        return <TrendingUp size={16} />;
    }
  };

  const sortedAnime = sortAnime(animeData);

  if (loading) {
    return (
      <div className="anime-list-container">
        <h2>{title}</h2>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading anime...</span>
        </div>
      </div>
    );
  }

  if (!sortedAnime || sortedAnime.length === 0) {
    return (
      <div className="anime-list-container">
        <h2>{title}</h2>
        <div className="empty-state">
          <p>No anime found in this category</p>
          <p>Try adjusting your filters or check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="anime-list-container">
      <div className="list-header">
        <h2>{title}</h2>
        {!isGuest && (
          <div className="list-controls">
            <div className="sort-container">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="popularity">Popular</option>
                <option value="score">Top Rated</option>
                <option value="title">Title</option>
                <option value="recent">Recent</option>
              </select>
              <span className="sort-icon">{renderSortIcon()}</span>
            </div>
            <div className="view-controls">
              <button 
                onClick={() => setView('grid')}
                className={`view-button ${view === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`view-button ${view === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`anime-collection ${view}`}>
  {sortedAnime.map((anime, index) => (
    <AnimeCard 
      key={`${category}-${anime.mal_id}-${index}`}
      anime={anime}
      view={view}
      category={category}
      style={{ '--order': index }}
    />
  ))}
</div>

      {hasMore && !loading && (
        <button onClick={onLoadMore} className="load-more">
          Load More Anime
        </button>
      )}
    </div>
  );
};

export default AnimeList;