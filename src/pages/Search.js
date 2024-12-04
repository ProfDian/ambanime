// src/pages/Search.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { AnimeCardSkeleton, AnimeGridSkeleton } from '../components/common/Skeleton';
import AnimeCard from '../components/anime/AnimeCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
    const searchAnime = async () => {
      if (!query) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.searchAnime(query, page);
        const newResults = response.data;
        
        setResults(prev => page === 1 ? newResults : [...prev, ...newResults]);
        setTotalResults(response.pagination?.items?.total || 0);
        setHasMore(response.pagination?.has_next_page || false);
      } catch (err) {
        setError('Failed to load search results. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    searchAnime();
  }, [query, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="search-page">
        <div className="search-header">
          <div className="search-header-content">
            <FaSearch className="search-icon" />
            {!query ? (
              <>
                <h1 className="fade-in">Search Anime</h1>
                <p className="fade-in-delay">Enter a search term to find anime series</p>
              </>
            ) : (
              <>
                <h1 className="fade-in">Search Results</h1>
                <p className="fade-in-delay">
                  Found {totalResults} results for "{query}"
                </p>
              </>
            )}
          </div>
        </div>

        <div className={`search-content ${animated ? 'fade-in-up' : ''}`}>
          {error ? (
            <div className="error-container">
              <div className="error">{error}</div>
            </div>
          ) : loading && page === 1 ? (
            <AnimeGridSkeleton />
          ) : (
            <>
              <div className="anime-grid">
                {results.map((anime, index) => (
                  <div 
                    className="anime-card-wrapper" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                    key={anime.mal_id}
                  >
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
              
              {loading && page > 1 && (
                <div className="loading-more">
                  <FaSpinner className="spinner" />
                  <p>Loading more results...</p>
                </div>
              )}
              
              {hasMore && !loading && (
                <button 
                  onClick={loadMore} 
                  className="load-more-button"
                  aria-label="Load more results"
                >
                  Load More Results
                </button>
              )}
              
              {!hasMore && results.length > 0 && (
                <p className="no-more-results">
                  That's all the results we have!
                </p>
              )}
              
              {!loading && results.length === 0 && (
                <div className="no-results">
                  <FaSearch className="no-results-icon" />
                  <p>No results found for "{query}"</p>
                  <p>Try different keywords or check your spelling</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;