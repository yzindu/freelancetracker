const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Protect routes: verify JWT Bearer token and attach current user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route, token missing'));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_for_dev_freelancer'
    );

    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists'));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Not authorized, token invalid or expired'));
  }
});

module.exports = {
  protect
};
