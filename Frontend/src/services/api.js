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

// TMDB data is fetched through the backend so the API key never ships to the browser
export const tmdb = {
  get: (path, params = {}) => api.get(`/tmdb${path}`, { params }).then((res) => res.data),
};

// Movies API
export const moviesAPI = {
  getBatch: (ids) => api.post('/movies/batch', { ids }),
  search: (query, page = 1) => api.get(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`),
  getById: (imdbId) => api.get(`/movies/${imdbId}`),
  getPopular: () => api.get('/movies/popular/list'),
};

// Reviews API
export const reviewsAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getByMovie: (movieId, sort = 'recent') => api.get(`/reviews/movie/${movieId}`, { params: { sort } }),
  like: (reviewId) => api.post(`/reviews/${reviewId}/like`),
  unlike: (reviewId) => api.delete(`/reviews/${reviewId}/like`),
  remove: (reviewId) => api.delete(`/reviews/${reviewId}`),
  getUserReviews: () => api.get('/reviews/user'),
};

// Watchlist API
export const watchlistAPI = {
  add: (imdbId) => api.post('/watchlist', { imdbId }),
  remove: (imdbId) => api.delete(`/watchlist/${imdbId}`),
  get: (limit = 100) => api.get('/watchlist', { params: { limit } }),
  check: (imdbId) => api.get(`/watchlist/check/${imdbId}`),
};

// Favorites API
export const favoritesAPI = {
  add: (imdbId) => api.post('/favorites', { imdbId }),
  remove: (imdbId) => api.delete(`/favorites/${imdbId}`),
  get: (limit = 100) => api.get('/favorites', { params: { limit } }),
  check: (imdbId) => api.get(`/favorites/check/${imdbId}`),
};

// Watched API
export const watchedAPI = {
  add: (imdbId) => api.post('/watched', { imdbId }),
  remove: (imdbId) => api.delete(`/watched/${imdbId}`),
  get: (limit = 100) => api.get('/watched', { params: { limit } }),
  check: (imdbId) => api.get(`/watched/check/${imdbId}`),
};

// Discovery API
export const discoverAPI = {
  recommendations: (limit = 12) => api.get('/recommendations', { params: { limit } }),
  stats: () => api.get('/stats/me'),
};

// Social API
export const socialAPI = {
  searchUsers: (q) => api.get('/social/users', { params: { q } }),
  getUser: (id) => api.get(`/social/users/${id}`),
  follow: (id) => api.post(`/social/follow/${id}`),
  unfollow: (id) => api.delete(`/social/follow/${id}`),
  feed: () => api.get('/social/feed'),
  getSettings: () => api.get('/social/settings'),
  updateSettings: (settings) => api.put('/social/settings', settings),
};

export default api;
