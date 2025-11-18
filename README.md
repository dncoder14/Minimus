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

## 🔧 Google OAuth Setup

### Steps to Enable Google OAuth

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API

2. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Select **Web application**
   - Add authorized JavaScript origins: `http://localhost:5173`
   - Copy the **Client ID**

3. **Update Frontend Configuration**
   - Update the Client ID in `/Frontend/src/App.jsx`
   - Restart both backend and frontend servers

## 🚀 Quick Start Commands

### Backend
```bash
cd Backend
npm install                 # Install dependencies
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm start                 # Start production server
npm run dev              # Start development server
```

### Frontend
```bash
cd Frontend
npm install              # Install dependencies
npm run dev             # Start development server
npm run build          # Build for production
npm run preview       # Preview production build
```

## 🎯 Current Features Status

### ✅ Implemented Features
- **Authentication**: Email/Password + Google OAuth with JWT
- **Movie Management**: Search, browse, details via OMDB API
- **User Collections**: Watchlist, favorites, watched tracking
- **Review System**: 1-5 star ratings with comments
- **User Profiles**: Personal dashboard with statistics
- **Admin Panel**: User and content management
- **Responsive Design**: Mobile, tablet, desktop support
- **Modern UI**: Dark theme with smooth animations

### 🚧 Recommended Features to Add

#### High Priority
- [ ] Profile picture upload
- [ ] Email verification and password reset
- [ ] Social features (follow users, activity feed)
- [ ] Advanced search filters (actors, directors, year range)
- [ ] AI-powered recommendations
- [ ] Custom movie lists

#### Medium Priority
- [ ] TV series episode tracking
- [ ] Notifications system
- [ ] Statistics and analytics dashboard
- [ ] Export/import watchlist data
- [ ] Watch provider integration

#### Low Priority
- [ ] Community features (forums, groups)
- [ ] Gamification (achievements, badges)
- [ ] Mobile app (React Native)
- [ ] Offline mode support

## 🗄️ Database Schema Details

### Models Overview
- **User**: Authentication and profile data
- **Review**: Movie ratings and comments
- **Watchlist**: Movies to watch later
- **Favorite**: Liked movies collection
- **Watched**: Completed movies tracking

### Key Relationships
- One user can have many reviews, watchlist items, favorites, and watched movies
- Each review/watchlist/favorite/watched item is linked to a user and movie (IMDB ID)
- Unique constraints prevent duplicate entries per user per movie

## 🔐 Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: 7-day expiry with secure secrets
- **CORS Configuration**: Restricted to allowed origins
- **Input Validation**: Server-side validation for all inputs
- **Role-based Access**: User and Admin role separation
- **Protected Routes**: Authentication required for sensitive operations

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Dark Theme**: Modern dark UI with gradient effects
- **Smooth Animations**: Framer Motion for transitions
- **Toast Notifications**: User feedback for actions
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Graceful error messages
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Testing & Quality

### Recommended Testing Setup
```bash
# Backend tests
npm install --save-dev jest supertest
npm test

# Frontend tests
npm install --save-dev @testing-library/react vitest
npm run test

# E2E tests
npm install --save-dev cypress
npm run test:e2e
```

### Code Quality Tools
- **ESLint**: Code linting and error detection
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **TypeScript**: Type safety (recommended upgrade)

## 🚀 Performance Optimization

### Current Optimizations
- **Code Splitting**: Route-based lazy loading ready
- **Image Optimization**: Placeholder images and lazy loading
- **Bundle Optimization**: Vite for fast builds
- **API Caching**: Ready for Redis implementation

### Recommended Improvements
- **React Query**: Better data fetching and caching
- **Service Worker**: PWA capabilities
- **CDN Integration**: Static asset delivery
- **Database Indexing**: Optimized queries

## 🔄 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/feature-name
git add .
git commit -m "feat: Add new feature"
git push origin feature/feature-name

# Bug fixes
git checkout -b bugfix/bug-description
git commit -m "fix: Fix bug description"
```

### Commit Message Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 🐛 Troubleshooting

### Common Issues

**Backend port already in use:**
```bash
lsof -ti:3001 | xargs kill -9
```

**Database connection error:**
- Check MySQL is running
- Verify DATABASE_URL in .env file
- Run `npm run db:push` to sync schema

**Frontend build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API connection issues:**
- Ensure backend is running on port 3001
- Check CORS settings in server.js
- Verify API_BASE_URL in frontend services

## 📊 Project Statistics

### Backend
- **API Endpoints**: ~40 endpoints across 7 route files
- **Database Models**: 5 Prisma models
- **Middleware**: Authentication and CORS
- **External APIs**: OMDB for movie data

### Frontend
- **Pages**: 8 main pages
- **Components**: 5 reusable components
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React hooks and context

## 🔮 Future Roadmap

### Phase 1 (Month 1-2)
- User profile enhancements
- Email verification system
- Advanced search functionality
- Social features foundation

### Phase 2 (Month 3-4)
- Recommendation engine
- TV series episode tracking
- Notifications system
- Mobile responsiveness improvements

### Phase 3 (Month 5-6)
- Community features
- Analytics dashboard
- Performance optimizations
- Mobile app development

### Phase 4 (Month 7-8)
- Advanced admin features
- API rate limiting
- Comprehensive testing
- Production deployment optimization

## 📞 Support & Maintenance

### Regular Tasks
- Weekly database backups
- Monthly security updates
- Quarterly dependency updates
- Monitor API rate limits and usage
- Review error logs and user feedback

### Monitoring Setup
- **Uptime Monitoring**: Track application availability
- **Error Tracking**: Log and alert on errors
- **Performance Monitoring**: Track response times
- **User Analytics**: Understand user behavior

---

**Made with ❤️ by Dhiraj Pandit**
