const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return errorResponse(res, 'No token provided', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token', 401);
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401);
  }
};

module.exports = authenticate;