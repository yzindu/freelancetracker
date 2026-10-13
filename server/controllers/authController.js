const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(409, 'User with this email already exists'));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password presence
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide both email and password'));
  }

  // Check for user and include password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  // Check password match
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  const token = user.generateAuthToken();

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = {
  register,
  login,
  getMe
};
