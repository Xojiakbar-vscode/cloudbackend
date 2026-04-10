const { User } = require('../models');
const authService = require('../services/auth.service');
const { validateRegister, validateLogin } = require('../validations/auth.validation');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const result = await authService.register(req.body);
    return successResponse(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 'User profile', req.user);
  } catch (error) {
    next(error);
  }
};

const setupSecretPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) return errorResponse(res, 'User not found', 404);
    
    const hashedPassword = await require('bcryptjs').hash(password, 10);
    user.secret_password = hashedPassword;
    await user.save();
    
    return successResponse(res, 'Secret password setup successful');
  } catch (error) {
    next(error);
  }
};

const verifySecretPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user || !user.secret_password) {
      return errorResponse(res, 'Secret password not set', 400);
    }
    
    const isMatch = await require('bcryptjs').compare(password, user.secret_password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid secret password', 401);
    }
    
    return successResponse(res, 'Secret vault unlocked');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  setupSecretPassword,
  verifySecretPassword,
};