// src/components/common/Skeletons.js
import React from 'react';
import './Skeleton.css';

export const AnimeCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-image pulse"></div>
    <div className="skeleton-content">
      <div className="skeleton-title pulse"></div>
      <div className="skeleton-text pulse"></div>
      <div className="skeleton-text pulse"></div>
    </div>
  </div>
);

export const AnimeGridSkeleton = ({ count = 12 }) => (
  <div className="anime-grid">
    {Array(count).fill(0).map((_, index) => (
      <AnimeCardSkeleton key={index} />
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="skeleton-profile">
    <div className="skeleton-header">
      <div className="skeleton-avatar pulse"></div>
      <div className="skeleton-info">
        <div className="skeleton-title pulse"></div>
        <div className="skeleton-text pulse"></div>
      </div>
    </div>
    <div className="skeleton-stats">
      {Array(3).fill(0).map((_, index) => (
        <div key={index} className="skeleton-stat pulse"></div>
      ))}
    </div>
  </div>
);

export const DetailPageSkeleton = () => (
  <div className="skeleton-detail">
    <div className="skeleton-banner pulse"></div>
    <div className="skeleton-detail-content">
      <div className="skeleton-main">
        <div className="skeleton-title pulse"></div>
        <div className="skeleton-description">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="skeleton-text pulse"></div>
          ))}
        </div>
      </div>
      <div className="skeleton-sidebar">
        <div className="skeleton-image pulse"></div>
        <div className="skeleton-stats">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="skeleton-stat pulse"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);