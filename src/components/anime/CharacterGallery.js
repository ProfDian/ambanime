import React, { useState, useEffect } from 'react';
import './CharacterGallery.css';
import { useParams } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';


const CharacterGallery = () => {
  const { id: characterId } = useParams();
  const [characterData, setCharacterData] = useState(null);
  const [characterPictures, setCharacterPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchCharacterDetails = async () => {
      setLoading(true);
      try {
        const characterResponse = await fetch(
          `https://api.jikan.moe/v4/characters/${characterId}`
        );
        if (!characterResponse.ok) throw new Error('Failed to fetch character data');
        const characterData = await characterResponse.json();

        await new Promise(resolve => setTimeout(resolve, 1000));

        const picturesResponse = await fetch(
          `https://api.jikan.moe/v4/characters/${characterId}/pictures`
        );
        if (!picturesResponse.ok) throw new Error('Failed to fetch pictures');
        const picturesData = await picturesResponse.json();

        setCharacterData(characterData.data);
        setCharacterPictures(picturesData.data);
        setMainImage(characterData.data.images.jpg.image_url);
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

  const handleImageSelect = (imageUrl) => {
    setMainImage(imageUrl);
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
      {/* Navbar */}
      <Navbar />

      <div className="gallery-container">
        {/* Left Side - Gallery */}
        <div className="gallery-section">
          <div className="main-image-container">
            <img 
              src={mainImage} 
              alt={characterData.name}
              className="main-image"
            />
          </div>
          <div className="thumbnail-grid">
            {characterPictures.map((picture, index) => (
              <div 
                key={index} 
                className={`thumbnail-card ${mainImage === picture.jpg.image_url ? 'active' : ''}`}
                onClick={() => handleImageSelect(picture.jpg.image_url)}
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

        {/* Right Side - Character Info */}
        <div className="info-section">
          <div className="character-info">
            <h1>{characterData.name}</h1>
            {characterData.name_kanji && (
              <h2 className="character-kanji">{characterData.name_kanji}</h2>
            )}
            {characterData.nicknames?.length > 0 && (
              <div className="nicknames-container">
                <h3>Nicknames:</h3>
                <div className="nicknames-list">
                  {characterData.nicknames.map((nickname, index) => (
                    <span key={index} className="nickname-tag">
                      {nickname}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {characterData.about && (
            <div className="about-section">
              <h3>About</h3>
              <div className="about-content">
                <p>{characterData.about}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CharacterGallery;
