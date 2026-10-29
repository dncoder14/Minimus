const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const bearerToken = (req) => {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.split(' ')[1];
};

const loadUser = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, role: true }
  });
};

const authenticateToken = async (req, res, next) => {
  const token = bearerToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = await loadUser(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Like authenticateToken, but anonymous requests are allowed through with req.user unset
const optionalAuth = async (req, res, next) => {
  const token = bearerToken(req);
  if (!token) return next();

  try {
    req.user = (await loadUser(token)) || undefined;
  } catch {
    // an invalid token on a public route is treated as anonymous
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, optionalAuth, requireAdmin };
