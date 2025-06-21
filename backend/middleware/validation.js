// Validation middleware for various entities

// Validate user input
const validateUser = (req, res, next) => {
  const { username, email, password, role } = req.body;
  const errors = [];

  if (!username || username.trim() === '') {
    errors.push('Username is required');
  }

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Email is invalid');
  }

  // Only validate password for new users or if password is provided for updates
  if (req.method === 'POST' || (req.method === 'PUT' && password)) {
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
  }

  if (role && !['admin', 'super-admin', 'user'].includes(role)) {
    errors.push('Invalid role');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Validate news input
const validateNews = (req, res, next) => {
  const { title, body } = req.body;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!body || body.trim() === '') {
    errors.push('Content is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Validate gallery album input
const validateAlbum = (req, res, next) => {
  const { title, description } = req.body;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

// Import debug utility
const debug = require('../utils/debug').createNamespace('validation');

// Validate FAQ input
const validateFaq = (req, res, next) => {
  debug.log('Validating FAQ data', {
    method: req.method,
    path: req.path,
    bodyFields: Object.keys(req.body)
  });

  const { question, answer, category, order, isActive } = req.body;
  const errors = [];

  // Check if this is a partial update (only updating isActive)
  const isPartialUpdate = req.method === 'PUT' &&
                         Object.keys(req.body).length === 1 &&
                         isActive !== undefined;

  debug.log('Is partial update (isActive only)', isPartialUpdate);

  // Only validate required fields for full updates or creation
  if (!isPartialUpdate) {
    // Check required fields
    if (!question || question.trim() === '') {
      errors.push('Question is required');
    }

    if (!answer || answer.trim() === '') {
      errors.push('Answer is required');
    }
  }

  // Sanitize and set defaults for optional fields
  if (category !== undefined) {
    req.body.category = category || 'General';
  }

  // Ensure order is a number
  if (order !== undefined && order !== null) {
    const parsedOrder = parseInt(order, 10);
    if (isNaN(parsedOrder)) {
      req.body.order = 0;
    } else {
      req.body.order = parsedOrder;
    }
  }

  // Ensure isActive is a boolean
  if (isActive !== undefined && isActive !== null) {
    req.body.isActive = isActive === true || isActive === 'true' || isActive === 1 || isActive === '1';
  }

  if (errors.length > 0) {
    debug.log('FAQ validation errors', errors);
    return res.status(400).json({ errors });
  }

  debug.log('FAQ validation passed with sanitized data', req.body);
  next();
};

module.exports = {
  validateUser,
  validateNews,
  validateAlbum,
  validateFaq
};
