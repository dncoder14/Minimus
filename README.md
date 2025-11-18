# 🎬 Minimus - Your Ultimate Entertainment Universe

A modern, full-stack movie and TV series tracking application built with React, Node.js, and MySQL.

![Minimus Banner](https://via.placeholder.com/1200x400/0A1B2F/FFFFFF?text=Minimus+-+Entertainment+Tracker)

## ✨ Features

### 🎯 Core Features
- **Discover Movies & Series**: Browse millions of movies and TV shows from OMDB and TMDB APIs
- **Smart Search**: Real-time search with advanced filters (genre, year, rating)
- **Personal Collections**: Create watchlists, mark favorites, and track watched content
- **Review System**: Rate and review movies with 1-5 star ratings
- **User Profiles**: Personalized dashboard with viewing statistics
- **Admin Panel**: Comprehensive admin dashboard for user and content management

### 🔐 Authentication
- Email/Password authentication with JWT
- Google OAuth 2.0 integration
- Secure password hashing with bcrypt
- Role-based access control (User/Admin)

### 🎨 UI/UX
- Fully responsive design (mobile, tablet, desktop)
- Modern dark theme with gradient effects
- Smooth animations with Framer Motion
- Toast notifications for user feedback
- Loading states and skeleton screens

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT + Passport.js (Google OAuth)
- **APIs**: OMDB API, TMDB API

### Frontend
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM v7.5.0
- **Styling**: Tailwind CSS v3.4.18
- **Animations**: Framer Motion v12.9.2
- **HTTP Client**: Axios v1.8.4

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
DATABASE_URL="mysql://user:password@localhost:3306/minimus"
JWT_SECRET="your-super-secret-jwt-key-change-this"
OMDB_API_KEY="your-omdb-api-key"
PORT=3001
```

4. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

5. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit: `http://localhost:5173`

## 🗄️ Database Schema

### Models
- **User**: User accounts with authentication
- **Review**: Movie/series reviews with ratings
- **Watchlist**: User's watchlist items
- **Favorite**: User's favorite movies/series
- **Watched**: Tracking of watched content

See [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) for detailed schema information.

## 📚 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
POST   /api/auth/google        - Google OAuth login
GET    /api/auth/me            - Get current user
GET    /api/auth/stats         - Get user statistics
```

### Movie Endpoints
```
GET    /api/movies/search      - Search movies
GET    /api/movies/:imdbId     - Get movie details
GET    /api/movies/popular/list - Get popular movies
GET    /api/movies/type/:type  - Get movies by type
```

### Review Endpoints
```
POST   /api/reviews            - Create/update review
GET    /api/reviews/movie/:id  - Get movie reviews
GET    /api/reviews/user       - Get user's reviews
DELETE /api/reviews/:id        - Delete review
GET    /api/reviews/recent     - Get recent reviews
```

### Watchlist Endpoints
```
POST   /api/watchlist          - Add to watchlist
DELETE /api/watchlist/:imdbId  - Remove from watchlist
GET    /api/watchlist          - Get user's watchlist
GET    /api/watchlist/check/:id - Check watchlist status
```

### Favorites Endpoints
```
POST   /api/favorites          - Add to favorites
DELETE /api/favorites/:imdbId  - Remove from favorites
GET    /api/favorites          - Get user's favorites
GET    /api/favorites/check/:id - Check favorite status
```

### Watched Endpoints
```
POST   /api/watched            - Mark as watched
DELETE /api/watched/:imdbId    - Remove from watched
GET    /api/watched            - Get watched list
GET    /api/watched/check/:id  - Check watched status
```

### Admin Endpoints (Requires Admin Role)
```
GET    /api/admin/dashboard    - Get dashboard stats
GET    /api/admin/users        - Get all users
PUT    /api/admin/users/:id/role - Update user role
DELETE /api/admin/users/:id    - Delete user
GET    /api/admin/movies       - Get all movies
DELETE /api/admin/movies/:id   - Delete movie
GET    /api/admin/reviews      - Get all reviews
DELETE /api/admin/reviews/:id  - Delete review
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Push to Git repository
3. Deploy using platform CLI or dashboard

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test
```

## 📝 Project Structure

```
Minimus/
├── Backend/
│   ├── config/
│   ├── middleware/
│   │   └── auth.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── favorites.js
│   │   ├── movies.js
│   │   ├── reviews.js
│   │   ├── watched.js
│   │   └── watchlist.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── Series.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── MovieDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── PROJECT_ANALYSIS.md
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Dhiraj Pandit**

## 🙏 Acknowledgments

- [OMDB API](http://www.omdbapi.com/) for movie data
- [TMDB API](https://www.themoviedb.org/) for additional movie information
- [Font Awesome](https://fontawesome.com/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support, email dhirajpandit5050@example.com or open an issue in the repository.

## 🗺️ Roadmap

See [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) for detailed feature roadmap and recommendations.

### Upcoming Features
- [ ] Social features (follow users, activity feed)
- [ ] Advanced recommendations with AI
- [ ] TV series episode tracking
- [ ] Watch provider integration
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Dark/Light theme toggle

---

**Made with ❤️ by Dhiraj Pandit**
