const { errorResponse } = require('../utils/response');

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File too large. Max size 10MB', 400);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => e.message);
    return errorResponse(res, 'Validation error', 400, errors);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return errorResponse(res, 'Duplicate entry', 400, err.errors);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorMiddleware;