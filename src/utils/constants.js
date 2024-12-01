// src/utils/constants.js

// API Constants
export const API_BASE_URL = 'https://api.jikan.moe/v4';
export const API_DELAY = 1000; // Delay between API calls in milliseconds

// Route Constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ANIME_DETAIL: '/anime/:id',
  GENRES: '/genres',
  RECOMMENDATIONS: '/recommendations',
  SEARCH: '/search',
  SETTINGS: '/settings',
  ADMIN: '/admin'
};

// User Role Constants
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  IS_GUEST: 'is_guest',
  THEME: 'theme_preference'
};

// Anime Categories
export const ANIME_CATEGORIES = {
  POPULAR: 'bypopularity',
  AIRING: 'airing',
  UPCOMING: 'upcoming',
  TOP_RATED: 'top_rated'
};

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Password must be at least 6 characters',
    USER_NOT_FOUND: 'User not found',
    WRONG_PASSWORD: 'Invalid password',
    EMAIL_IN_USE: 'Email already in use',
    DEFAULT: 'An error occurred. Please try again'
  },
  API: {
    FETCH_ERROR: 'Failed to fetch data. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    RATE_LIMIT: 'Too many requests. Please wait a moment.'
  }
};

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 24,
  MAX_DESCRIPTION_LENGTH: 200,
  BANNER_COUNT: 5
};

// Admin Credentials
export const ADMIN_CREDENTIALS = {
  EMAIL: 'admin@gmail.com',
  PASSWORD: 'hafiisadminnega'
};