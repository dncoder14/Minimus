const dotenv = require('dotenv');

// Load environment variables before anything reads them
dotenv.config();

const JWT_PLACEHOLDER = 'your-super-secret-jwt-key-change-this-in-production';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === JWT_PLACEHOLDER) {
  console.error('JWT_SECRET is missing or still the placeholder value. Set a strong secret.');
  process.exit(1);
}

const app = require('./app');
const prisma = require('./lib/prisma');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
