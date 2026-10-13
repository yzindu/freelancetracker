const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to check express-validator results and format error messages
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    return next(new ApiError(400, 'Validation failed', formattedErrors));
  }
  next();
};

module.exports = validate;
