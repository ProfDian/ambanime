// src/pages/Search.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { AnimeCardSkeleton, AnimeGridSkeleton } from '../components/common/Skeleton';
import AnimeCard from '../components/anime/AnimeCard';
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

  useEffect(() => {
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

  if (!query) {
    return (
      <div className="search-page">
        <div className="search-header">
          <h1>Search Anime</h1>
          <p>Enter a search term to find anime series</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>
          Found {totalResults} results for "{query}"
        </p>
      </div>

      <div className="search-content">
        {error ? (
          <div className="error">{error}</div>
        ) : loading && page === 1 ? (
          <AnimeGridSkeleton />
        ) : (
          <>
            <div className="anime-grid">
              {results.map(anime => (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </div>
            
            {loading && page > 1 && (
              <div className="loading-more">
                <AnimeCardSkeleton />
                <AnimeCardSkeleton />
                <AnimeCardSkeleton />
              </div>
            )}
            
            {hasMore && !loading && (
              <button onClick={loadMore} className="load-more-button">
                Load More Results
              </button>
            )}
            
            {!hasMore && results.length > 0 && (
              <p className="no-more-results">
                No more results available
              </p>
            )}
            
            {!loading && results.length === 0 && (
              <div className="no-results">
                <p>No results found for "{query}"</p>
                <p>Try different keywords or check your spelling</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;