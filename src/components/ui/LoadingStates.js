// src/components/ui/LoadingStates.js
import React from 'react';
import './LoadingStates.css';

export const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

export const CardSkeleton = () => (
  <div className="card-skeleton">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 12 }) => (
  <div className="skeleton-grid">
    {Array(count).fill(0).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);

export const BannerSkeleton = () => (
  <div className="banner-skeleton">
    <div className="skeleton-header"></div>
    <div className="skeleton-subtext"></div>
  </div>
);