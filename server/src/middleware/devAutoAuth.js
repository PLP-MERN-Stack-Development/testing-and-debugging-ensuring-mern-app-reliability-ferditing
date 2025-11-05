// server/src/middleware/devAutoAuth.js
const User = require('../models/User');
const { generateToken } = require('../utils/auth');

module.exports = async function devAutoAuth(req, res, next) {
  if (process.env.NODE_ENV === 'production') return next();

  // If the request already has an Authorization header, skip auto-auth injection
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // console.log('[devAutoAuth] Authorization header present, skipping');
    return next();
  }

  try {
    const email = process.env.DEV_USER_EMAIL || 'dev@example.com';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: process.env.DEV_USER_NAME || 'devuser',
        email,
        password: process.env.DEV_USER_PASSWORD || 'password123'
      });
      // console.log('[devAutoAuth] Created dev user', email);
    } else {
      // console.log('[devAutoAuth] Found dev user', email);
    }

    // Attach the user object so controllers that expect req.user work
    req.user = user;

    // Inject a Bearer token for downstream verifyToken to parse
    try {
      const token = generateToken(user);
      req.headers.authorization = `Bearer ${token}`;
      // console.log('[devAutoAuth] Injected Authorization header for dev user');
    } catch (e) {
      // If token generation fails, continue with req.user attached
      // console.error('[devAutoAuth] token generation failed', e);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};
