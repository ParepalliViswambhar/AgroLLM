const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        return res.status(403).json({ 
          message: 'Your account has been blocked',
          reason: req.user.blockedReason,
          isBlocked: true
        });
      }

      // Check if user is timed out
      if (req.user.timeoutUntil && new Date() < new Date(req.user.timeoutUntil)) {
        return res.status(403).json({ 
          message: 'Your account is temporarily suspended',
          reason: req.user.timeoutReason,
          timeoutUntil: req.user.timeoutUntil,
          isTimedOut: true
        });
      }

      // Clear timeout if expired
      if (req.user.timeoutUntil && new Date() >= new Date(req.user.timeoutUntil)) {
        req.user.timeoutUntil = null;
        req.user.timeoutReason = '';
        await req.user.save();
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` });
    }
  };
};

module.exports = { protect, adminOnly, checkRole };
