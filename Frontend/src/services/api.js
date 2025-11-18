import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  getProfile: () => api.get('/auth/me'),
  getStats: () => api.get('/auth/stats'),
};

// Movies API
export const moviesAPI = {
  search: (query, page = 1) => api.get(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`),
  getById: (imdbId) => api.get(`/movies/${imdbId}`),
  getPopular: () => api.get('/movies/popular/list'),
};

// Reviews API
export const reviewsAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getByMovie: (movieId) => api.get(`/reviews/movie/${movieId}`),
  getUserReviews: () => api.get('/reviews/user'),
};

// Watchlist API
export const watchlistAPI = {
  add: (imdbId) => api.post('/watchlist', { imdbId }),
  remove: (imdbId) => api.delete(`/watchlist/${imdbId}`),
  get: () => api.get('/watchlist'),
  check: (imdbId) => api.get(`/watchlist/check/${imdbId}`),
};

// Favorites API
export const favoritesAPI = {
  add: (imdbId) => api.post('/favorites', { imdbId }),
  remove: (imdbId) => api.delete(`/favorites/${imdbId}`),
  get: () => api.get('/favorites'),
  check: (imdbId) => api.get(`/favorites/check/${imdbId}`),
};

// Watched API
export const watchedAPI = {
  add: (imdbId) => api.post('/watched', { imdbId }),
  remove: (imdbId) => api.delete(`/watched/${imdbId}`),
  get: () => api.get('/watched'),
  check: (imdbId) => api.get(`/watched/check/${imdbId}`),
};

export default api;