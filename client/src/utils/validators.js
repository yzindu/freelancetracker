/**
 * Field validation utilities
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim());
};

export const isRequired = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
};

export const minLength = (val, length) => {
  if (!val) return false;
  return String(val).length >= length;
};

export const isPositiveNumber = (val) => {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && num > 0;
};

export const isNonNegativeNumber = (val) => {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && num >= 0;
};

/**
 * Validates Login Form
 */
export const validateLoginForm = (values) => {
  const errors = {};
  if (!isRequired(values.email)) {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isRequired(values.password)) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Validates Registration Form
 */
export const validateRegisterForm = (values) => {
  const errors = {};

  if (!isRequired(values.name)) {
    errors.name = 'Full name is required';
  } else if (!minLength(values.name, 2)) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!isRequired(values.email)) {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isRequired(values.password)) {
    errors.password = 'Password is required';
  } else if (!minLength(values.password, 6)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (!isRequired(values.confirmPassword)) {
    errors.confirmPassword = 'Confirming your password is required';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
