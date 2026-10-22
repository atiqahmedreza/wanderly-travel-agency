const User = require('../models/User');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please log in to access this resource', 401));
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new AppError('User no longer exists', 401));
    req.user = user;
    next();
  } catch {
    return next(new AppError('Session expired. Please log in again.', 401));
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission for this action', 403));
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const decoded = verifyToken(header.split(' ')[1]);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch {
    /* ignore invalid token for public routes */
  }
  next();
};

module.exports = { protect, restrictTo, optionalAuth };
