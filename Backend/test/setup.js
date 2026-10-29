// Runs before each test file: points the app at an isolated database and sets required env vars
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://dhirajpandit@localhost:5432/minimus_test';
