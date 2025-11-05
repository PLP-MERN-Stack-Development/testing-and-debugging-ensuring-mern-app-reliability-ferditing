const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
const TOKEN_EXPIRY = '2h';

function generateToken(user) {
  const id = user._id ? user._id.toString() : user.id || user._id;
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

async function verifyToken(req, res, next) {
  try {
    // allow devAutoAuth to attach req.user in dev
    if (req.user) return next();

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) return res.status(401).json({ error: 'Not authenticated' });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
}

module.exports = { generateToken, verifyToken };
