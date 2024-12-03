import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CharacterGallery.css';

const CharacterGallery = () => {
  const { id: characterId } = useParams();
  const [characterData, setCharacterData] = useState(null);
  const [characterPictures, setCharacterPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchCharacterDetails = async () => {
      setLoading(true);
      try {
        // Fetch character details
        const characterResponse = await fetch(
          `https://api.jikan.moe/v4/characters/${characterId}`
        );
        if (!characterResponse.ok) throw new Error('Failed to fetch character data');
        const characterData = await characterResponse.json();

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch character pictures
        const picturesResponse = await fetch(
          `https://api.jikan.moe/v4/characters/${characterId}/pictures`
        );
        if (!picturesResponse.ok) throw new Error('Failed to fetch pictures');
        const picturesData = await picturesResponse.json();

        setCharacterData(characterData.data);
        setCharacterPictures(picturesData.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching character data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (characterId) {
      fetchCharacterDetails();
    }
  }, [characterId]);

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  if (loading) {
    return (
      <div className="character-loading">
        <div className="loading-spinner"></div>
        <p>Loading character details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!characterData) return null;

  return (
    <div className="character-gallery-page">
      {/* Character Header */}
      <div className="character-header">
        <div className="character-profile">
          <img 
            src={characterData.images.jpg.image_url} 
            alt={characterData.name}
            className="character-main-image"
          />
          <div className="character-info">
            <h1>{characterData.name}</h1>
            {characterData.name_kanji && (
              <h2 className="character-kanji">{characterData.name_kanji}</h2>
            )}
            {characterData.nicknames?.length > 0 && (
              <p className="character-nicknames">
                Also known as: {characterData.nicknames.join(', ')}
              </p>
            )}
          </div>
        </div>
        
        {characterData.about && (
          <div className="character-about">
            <h3>About</h3>
            <p>{characterData.about}</p>
          </div>
        )}
      </div>

      {/* Pictures Gallery */}
      <div className="character-pictures">
        <h3>Gallery</h3>
        <div className="pictures-grid">
          {characterPictures.map((picture, index) => (
            <div 
              key={index} 
              className="picture-card"
              onClick={() => openImageModal(picture)}
            >
              <img 
                src={picture.jpg.image_url} 
                alt={`${characterData.name} ${index + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedImage.jpg.image_url} 
              alt={characterData.name} 
            />
            <button 
              className="close-modal"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterGallery;