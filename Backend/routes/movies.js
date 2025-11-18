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

    const response = await axios.get(`http://www.omdbapi.com/?s=${encodeURIComponent(q)}&page=${page}&apikey=${OMDB_API_KEY}`);
    
    if (response.data.Response === 'True') {
      // Get detailed info for each result
      const detailedResults = await Promise.all(
        response.data.Search.slice(0, 10).map(async (item) => {
          try {
            const detailResponse = await axios.get(`http://www.omdbapi.com/?i=${item.imdbID}&apikey=${OMDB_API_KEY}`);
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

    // Check if movie exists in database
    let movie = await prisma.movie.findUnique({
      where: { imdbId },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: true,
            watchlists: true,
            favorites: true
          }
        }
      }
    });

    if (!movie) {
      // Fetch from OMDB API
      const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
      
      if (response.data.Response === 'True') {
        const omdbData = response.data;
        
        // Save to database
        movie = await prisma.movie.create({
          data: {
            imdbId: omdbData.imdbID,
            title: omdbData.Title,
            year: omdbData.Year,
            rated: omdbData.Rated !== 'N/A' ? omdbData.Rated : null,
            released: omdbData.Released !== 'N/A' ? omdbData.Released : null,
            runtime: omdbData.Runtime !== 'N/A' ? omdbData.Runtime : null,
            genre: omdbData.Genre !== 'N/A' ? omdbData.Genre : '',
            director: omdbData.Director !== 'N/A' ? omdbData.Director : null,
            writer: omdbData.Writer !== 'N/A' ? omdbData.Writer : null,
            actors: omdbData.Actors !== 'N/A' ? omdbData.Actors : null,
            plot: omdbData.Plot !== 'N/A' ? omdbData.Plot : null,
            language: omdbData.Language !== 'N/A' ? omdbData.Language : null,
            country: omdbData.Country !== 'N/A' ? omdbData.Country : null,
            awards: omdbData.Awards !== 'N/A' ? omdbData.Awards : null,
            poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
            imdbRating: omdbData.imdbRating !== 'N/A' ? omdbData.imdbRating : null,
            imdbVotes: omdbData.imdbVotes !== 'N/A' ? omdbData.imdbVotes : null,
            type: omdbData.Type,
            boxOffice: omdbData.BoxOffice !== 'N/A' ? omdbData.BoxOffice : null,
            production: omdbData.Production !== 'N/A' ? omdbData.Production : null,
            website: omdbData.Website !== 'N/A' ? omdbData.Website : null
          },
          include: {
            reviews: {
              include: {
                user: {
                  select: { id: true, name: true }
                }
              }
            },
            _count: {
              select: {
                reviews: true,
                watchlists: true,
                favorites: true
              }
            }
          }
        });

        // Add OMDB ratings data
        movie.omdbRatings = omdbData.Ratings || [];
      } else {
        return res.status(404).json({ error: 'Movie not found' });
      }
    }

    res.json({ movie });
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
          const response = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
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

    const movies = await prisma.movie.findMany({
      where: { type },
      include: {
        _count: {
          select: {
            reviews: true,
            watchlists: true,
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20
    });

    res.json({ movies, page: parseInt(page) });
  } catch (error) {
    console.error('Get movies by type error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

module.exports = router;