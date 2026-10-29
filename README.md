# Minimus

A full-stack movie and series tracker. Discover titles, keep a watchlist, mark favorites and watched, write reviews, follow other users and get personalised recommendations.

**Stack:** React 19 + Vite + Tailwind (frontend), Express 5 + Prisma + PostgreSQL (backend), optional Redis cache, Docker, GitHub Actions CI.

## Features

- **Discovery:** trending, genre browsing and search across TMDB and OMDb.
- **Personal lists:** watchlist, favorites and watched, all stored per account.
- **Reviews:** 1-5 star ratings, spoiler tags, "helpful" likes and sorting by newest, most helpful or highest rated.
- **Recommendations:** a hybrid engine. Collaborative filtering finds users with overlapping taste (Jaccard similarity over highly rated titles), then genre affinity from your favorites, watched and ratings fills the rest. New users get trending titles.
- **Stats:** hours watched, top genres, rating distribution and titles watched per month.
- **Community:** follow people, search users and see an activity feed.
- **Auth:** email and password (bcrypt + JWT) and Google sign-in with server-side ID token verification.
- **Admin API:** user, role and review moderation, protected by role checks.

## Architecture

```
React SPA  ──►  Express API  ──►  PostgreSQL (Prisma)
                   │
                   ├──►  TMDB / OMDb   (server-side only, API keys never reach the browser)
                   └──►  Cache         (Redis if REDIS_URL is set, otherwise in-process)
```

- **Metadata layer** ([Backend/services/metadata.js](Backend/services/metadata.js)): one place that talks to TMDB and OMDb, with timeouts, one retry, TTL caching and normalisation into a single shape. Movie details are also stored in a `Movie` table, so list pages, recommendations and stats never need a request per item.
- **TMDB proxy** (`/api/tmdb/*`): whitelisted, read-only and cached. This keeps the key on the server and avoids ISPs that block TMDB for browsers.
- **Shared list router** ([Backend/routes/lists.js](Backend/routes/lists.js)): watchlist, favorites and watched share one implementation.
- **Hardening:** Helmet, rate limits (stricter on auth), Zod validation on every input, central error handler, JWT secret required at startup, cascading deletes.

## Running locally

Prerequisites: Node 20+, PostgreSQL.

```bash
# Backend
cd Backend
cp .env.example .env        # fill in the keys
npm install
npx prisma db push
npm run dev                 # http://localhost:3002

# Frontend
cd Frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Or run everything (Postgres, Redis, API, frontend) with Docker:

```bash
cp .env.example .env        # JWT_SECRET, OMDB_API_KEY, TMDB_API_KEY, GOOGLE_CLIENT_ID
docker compose up --build   # app on http://localhost:8080, API on :3002
```

## API

Interactive docs are served at `/api/docs` (OpenAPI spec in [Backend/openapi.yaml](Backend/openapi.yaml)).

## Tests and CI

```bash
cd Backend
npm run test:prepare   # creates the schema in the test database
npm test               # unit tests and API integration tests (upstream providers are mocked)
```

GitHub Actions runs the backend tests against a Postgres service, and lints and builds the frontend on every push and pull request.

## Configuration

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `JWT_SECRET` | backend | Signing key for tokens (required, server refuses to start without it) |
| `OMDB_API_KEY`, `TMDB_API_KEY` | backend | Movie data providers |
| `GOOGLE_CLIENT_ID` | backend | Audience used to verify Google ID tokens |
| `REDIS_URL` | backend | Optional shared cache |
| `CORS_ORIGINS` | backend | Optional extra allowed origins, comma separated |
| `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` | frontend | API base URL and Google client ID |

## Deployment

The backend deploys to Render using [Backend/render.yaml](Backend/render.yaml); the frontend is a static Vite build. Set the variables above in the Render dashboard. Never commit `.env` files.
