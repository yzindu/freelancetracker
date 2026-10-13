const ApiError = require('../utils/ApiError');

// 404 Not Found Handler
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('ErrorHandler Caught:', err);
  }

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    const message = `Resource not found with ID of ${err.value}`;
    error = new ApiError(400, message);
  }

  // Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = new ApiError(409, message);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    error = new ApiError(400, 'Validation failed', formattedErrors);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = {
  notFound,
  errorHandler
};
