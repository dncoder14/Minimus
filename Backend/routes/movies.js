const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const OMDB_API_KEY = process.env.OMDB_API_KEY || 'c1c5dd61';

// Search movies
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await axios.get(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&page=${page}&apikey=${OMDB_API_KEY}`);
    
    if (response.data.Response === 'True') {
      // Get detailed info for each result
      const detailedResults = await Promise.all(
        response.data.Search.slice(0, 10).map(async (item) => {
          try {
            const detailResponse = await axios.get(`https://www.omdbapi.com/?i=${item.imdbID}&apikey=${OMDB_API_KEY}`);
            return detailResponse.data.Response === 'True' ? detailResponse.data : null;
          } catch (error) {
            return null;
          }
        })
      );

      const validResults = detailedResults.filter(item => item);
      
      res.json({
        results: validResults,
        totalResults: response.data.totalResults,
        page: parseInt(page)
      });
    } else {
      res.json({ results: [], totalResults: 0, page: parseInt(page) });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get movie by IMDB ID
router.get('/:imdbId', async (req, res) => {
  try {
    const { imdbId } = req.params;

    // Fetch from OMDB API
    const response = await axios.get(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    
    if (response.data.Response === 'True') {
      res.json({ movie: response.data });
    } else {
      return res.status(404).json({ error: 'Movie not found' });
    }
  } catch (error) {
    console.error('Get movie error:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Get popular movies
router.get('/popular/list', async (req, res) => {
  try {
    const popularImdbIds = [
      'tt0111161', 'tt0068646', 'tt0468569', 'tt0050083', 'tt0108052',
      'tt0167260', 'tt0110912', 'tt0060196', 'tt0137523', 'tt0120737'
    ];

    const movies = await Promise.all(
      popularImdbIds.map(async (imdbId) => {
        try {
          const response = await axios.get(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
          return response.data.Response === 'True' ? response.data : null;
        } catch (error) {
          return null;
        }
      })
    );

    const validMovies = movies.filter(movie => movie);
    res.json({ movies: validMovies });
  } catch (error) {
    console.error('Get popular movies error:', error);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

// Get movies by type (movie/series)
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1 } = req.query;

    if (!['movie', 'series'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Use movie or series' });
    }

    // For now, return empty array since we don't have movie storage
    res.json({ movies: [], page: parseInt(page) });
  } catch (error) {
    console.error('Get movies by type error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

module.exports = router;