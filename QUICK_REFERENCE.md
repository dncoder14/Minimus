# 🚀 Minimus - Quick Reference Guide

## 📋 Quick Start Commands

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

---

## 🔑 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/minimus"
JWT_SECRET="your-super-secret-jwt-key"
OMDB_API_KEY="your-omdb-api-key"
PORT=3001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📁 Project Structure

```
Minimus/
├── Backend/              # Node.js + Express API
│   ├── middleware/      # Auth middleware
│   ├── prisma/         # Database schema
│   ├── routes/         # API routes
│   └── server.js       # Entry point
│
├── Frontend/            # React + Vite app
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/     # Page components
│   │   └── services/  # API service
│   └── public/        # Static assets
│
└── Documentation/       # Project docs
    ├── README.md
    ├── PROJECT_ANALYSIS.md
    └── CLEANUP_SUMMARY.md
```

---

## 🎯 Current Features

### ✅ Implemented
- User authentication (Email + Google OAuth)
- Movie search and browsing
- Watchlist management
- Favorites system
- Watched tracking
- Review system (1-5 stars)
- User profiles
- Admin panel

### 🚧 To Be Implemented
- Profile pictures
- Email verification
- Social features (follow, activity feed)
- Advanced recommendations
- TV series episode tracking
- Notifications
- Mobile app

---

## 🔗 Important URLs

### Development
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health

### API Endpoints
- Auth: `/api/auth/*`
- Movies: `/api/movies/*`
- Reviews: `/api/reviews/*`
- Watchlist: `/api/watchlist/*`
- Favorites: `/api/favorites/*`
- Watched: `/api/watched/*`
- Admin: `/api/admin/*`

---

## 🛠️ Common Tasks

### Add New API Route
1. Create route file in `Backend/routes/`
2. Add route to `server.js`
3. Test with Postman/Thunder Client

### Add New Page
1. Create page in `Frontend/src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Navbar.jsx`

### Update Database Schema
1. Edit `Backend/prisma/schema.prisma`
2. Run `npm run db:push`
3. Run `npm run db:generate`

### Add New Component
1. Create component in `Frontend/src/components/`
2. Import and use in pages
3. Add to component library

---

## 🐛 Troubleshooting

### Backend Issues

**Port already in use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database connection error**
```bash
# Check MySQL is running
mysql -u root -p
# Verify DATABASE_URL in .env
```

**Prisma errors**
```bash
# Regenerate Prisma client
npm run db:generate
# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

### Frontend Issues

**Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build errors**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**API connection issues**
- Check backend is running
- Verify CORS settings in `server.js`
- Check API_BASE_URL in `services/api.js`

---

## 📊 Database Quick Reference

### User Table
```sql
SELECT * FROM User;
SELECT * FROM User WHERE email = 'user@example.com';
UPDATE User SET role = 'ADMIN' WHERE id = 1;
```

### Reviews Table
```sql
SELECT * FROM Review WHERE userId = 1;
SELECT AVG(rating) FROM Review WHERE imdbId = 'tt1234567';
```

### Watchlist Table
```sql
SELECT * FROM Watchlist WHERE userId = 1;
DELETE FROM Watchlist WHERE userId = 1 AND imdbId = 'tt1234567';
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] API keys are in .env (not committed)
- [ ] CORS is properly configured
- [ ] Input validation is implemented
- [ ] Rate limiting is enabled
- [ ] HTTPS is used in production

---

## 🧪 Testing Commands

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📦 Deployment Checklist

### Backend (Railway/Heroku)
- [ ] Set environment variables
- [ ] Configure database
- [ ] Set up domain
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain

### Frontend (Vercel/Netlify)
- [ ] Build project: `npm run build`
- [ ] Set environment variables
- [ ] Configure redirects
- [ ] Set up custom domain
- [ ] Enable HTTPS

---

## 🎨 Design System

### Colors
```css
Primary: #0EA5E9 (Cyan)
Secondary: #A855F7 (Purple)
Accent: #EC4899 (Pink)
Background: #0A1B2F (Navy)
Text: #F3F4F6 (Light Gray)
```

### Spacing
```css
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
```

### Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## 🔄 Git Workflow

### Branch Naming
```
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
```

### Commit Messages
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Common Commands
```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature
```

---

## 📞 Quick Links

- [Full Documentation](./PROJECT_ANALYSIS.md)
- [Cleanup Summary](./CLEANUP_SUMMARY.md)
- [README](./README.md)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 💡 Pro Tips

1. **Use React DevTools** - Debug React components easily
2. **Use Prisma Studio** - Visual database editor (`npx prisma studio`)
3. **Use Thunder Client** - Test APIs in VS Code
4. **Use React Query** - Better data fetching and caching
5. **Use ESLint** - Catch errors early
6. **Use Prettier** - Consistent code formatting

---

## 🆘 Need Help?

### Common Questions

**Q: How do I add a new feature?**
A: See PROJECT_ANALYSIS.md for recommended features and implementation guide.

**Q: How do I deploy to production?**
A: Follow the deployment checklist above and see README.md for detailed instructions.

**Q: How do I add a new API endpoint?**
A: Create a route file in Backend/routes/ and add it to server.js.

**Q: How do I update the database schema?**
A: Edit prisma/schema.prisma and run `npm run db:push`.

**Q: How do I add authentication to a route?**
A: Use the `authenticateToken` middleware from `middleware/auth.js`.

---

## 📈 Performance Tips

1. **Use React.memo** for expensive components
2. **Use useMemo** for expensive calculations
3. **Use useCallback** for event handlers
4. **Lazy load routes** with React.lazy
5. **Optimize images** (WebP format, lazy loading)
6. **Use CDN** for static assets
7. **Enable caching** for API responses
8. **Minimize bundle size** (code splitting)

---

## 🎯 Next Steps

1. ✅ Review this quick reference
2. ✅ Read PROJECT_ANALYSIS.md for detailed info
3. ✅ Set up development environment
4. ✅ Start implementing new features
5. ✅ Write tests
6. ✅ Deploy to production

---

**Last Updated**: January 2025
**Version**: 1.0.0
