// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'change_this_in_prod';

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header) return res.status(401).json({ error: 'missing_authorization_header' });
    const parts = header.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'malformed_authorization' });
    const token = parts[1];
    try {
      const payload = verifyAccessToken(token);
      // payload should contain { id, email, role, iat, exp }
      req.user = payload;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'invalid_or_expired_token', details: err.message });
    }
  } catch (err) {
    console.error('auth middleware error', err);
    return res.status(500).json({ error: 'auth_middleware_error' });
  }
};
