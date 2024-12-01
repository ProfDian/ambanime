// src/components/anime/CharacterGallery.js
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './CharacterGallery.css';

const CharacterGallery = ({ animeId }) => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, [animeId]);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${api.BASE_URL}/anime/${animeId}/characters`
      );
      const data = await response.json();
      
      if (data.data) {
        setCharacters(data.data);
        setHasMore(data.pagination?.has_next_page || false);
      }
    } catch (err) {
      setError('Failed to load characters');
      console.error('Error fetching characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharacterDetails = async (characterId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${api.BASE_URL}/characters/${characterId}/full`
      );
      const data = await response.json();
      
      if (data.data) {
        setSelectedCharacter(data.data);
      }
    } catch (err) {
      console.error('Error fetching character details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCharacters = async () => {
    setPage(prev => prev + 1);
    try {
      const response = await fetch(
        `${api.BASE_URL}/anime/${animeId}/characters?page=${page + 1}`
      );
      const data = await response.json();
      
      if (data.data) {
        setCharacters(prev => [...prev, ...data.data]);
        setHasMore(data.pagination?.has_next_page || false);
      }
    } catch (err) {
      console.error('Error loading more characters:', err);
    }
  };

  if (loading && characters.length === 0) {
    return <div className="loading">Loading characters...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="character-gallery">
      <h2>Characters</h2>
      
      <div className="characters-grid">
        {characters.map(({ character, role, voice_actors }) => (
          <div 
            key={character.mal_id} 
            className="character-card"
            onClick={() => fetchCharacterDetails(character.mal_id)}
          >
            <div className="character-image">
              <img 
                src={character.images.jpg.image_url} 
                alt={character.name}
                loading="lazy"
              />
              <div className="character-role">{role}</div>
            </div>
            <div className="character-info">
              <h3>{character.name}</h3>
              {voice_actors && voice_actors[0] && (
                <div className="voice-actor">
                  <small>VA: {voice_actors[0].person.name}</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMoreCharacters} className="load-more">
          Load More Characters
        </button>
      )}

      {selectedCharacter && (
        <div className="character-modal">
          <div className="modal-content">
            <button 
              className="close-modal"
              onClick={() => setSelectedCharacter(null)}
            >
              ×
            </button>
            
            <div className="character-details">
              <div className="character-header">
                <img 
                  src={selectedCharacter.images.jpg.image_url}
                  alt={selectedCharacter.name}
                  className="character-portrait"
                />
                <div className="character-meta">
                  <h2>{selectedCharacter.name}</h2>
                  <h3>{selectedCharacter.name_kanji}</h3>
                  {selectedCharacter.nicknames.length > 0 && (
                    <p>Also known as: {selectedCharacter.nicknames.join(', ')}</p>
                  )}
                </div>
              </div>

              {selectedCharacter.about && (
                <div className="character-description">
                  <h4>About</h4>
                  <p>{selectedCharacter.about}</p>
                </div>
              )}

              {selectedCharacter.voice_actors && (
                <div className="voice-actors">
                  <h4>Voice Actors</h4>
                  <div className="voice-actors-grid">
                    {selectedCharacter.voice_actors.map(va => (
                      <div key={va.person.mal_id} className="va-card">
                        <img 
                          src={va.person.images.jpg.image_url}
                          alt={va.person.name}
                        />
                        <div className="va-info">
                          <p>{va.person.name}</p>
                          <small>{va.language}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterGallery;