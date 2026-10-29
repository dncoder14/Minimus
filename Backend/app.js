const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { ZodError } = require('zod');
const prisma = require('./lib/prisma');
const { HttpError } = require('./lib/errors');

const app = express();
const isTest = process.env.NODE_ENV === 'test';

// Render (and most hosts) sit behind one proxy; needed for correct client IPs in rate limiting
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://minimus-frontend.onrender.com',
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) : [])
];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);
app.use(express.json({ limit: '100kb' }));

const limiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => isTest,
    message: { error: message }
  });

app.use('/api', limiter(15 * 60 * 1000, 600, 'Too many requests, please try again later'));
app.use('/api/auth/login', limiter(15 * 60 * 1000, 20, 'Too many login attempts, please try again later'));
app.use('/api/auth/register', limiter(60 * 60 * 1000, 20, 'Too many sign-ups from this IP, please try again later'));
app.use('/api/auth/google', limiter(15 * 60 * 1000, 40, 'Too many login attempts, please try again later'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/tmdb', require('./routes/tmdb'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/watched', require('./routes/watched'));
app.use('/api/social', require('./routes/social'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/recommendations'));

// API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(YAML.load(path.join(__dirname, 'openapi.yaml'))));

// Health check, including a database round trip
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'up', uptime: Math.round(process.uptime()) });
  } catch {
    res.status(503).json({ status: 'DEGRADED', database: 'down' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Central error handler: turns known failures into consistent JSON responses
app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues.map((i) => i.message).join('; ') });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Record not found' });
  if (err.code === 'P2002') return res.status(409).json({ error: 'Record already exists' });

  console.error(err.stack || err);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
