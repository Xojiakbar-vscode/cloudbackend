const { errorResponse } = require('../utils/response');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = authorize;