const jwt = require('jsonwebtoken');
const User = require('../models/users');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }

    // Check if ACCESS_TOKEN_SECRET is set
    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.error('ACCESS_TOKEN_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      // Verify token using ACCESS_TOKEN_SECRET
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { protect }; 