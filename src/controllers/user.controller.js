const userService = require('../services/user.service');
const { validateUpdateUser, validateUserId } = require('../validations/user.validation');
const { successResponse, errorResponse } = require('../utils/response');

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userService.getAllUsers(page, limit);
    return successResponse(res, 'Users retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { error } = validateUserId(req.params);
    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const user = await userService.getUserById(req.params.id);
    return successResponse(res, 'User retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { error: paramError } = validateUserId(req.params);
    if (paramError) {
      return errorResponse(res, paramError.details[0].message, 400);
    }

    const { error: bodyError } = validateUpdateUser(req.body);
    if (bodyError) {
      return errorResponse(res, bodyError.details[0].message, 400);
    }

    const updatedUser = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, 'User updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { error } = validateUserId(req.params);
    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const deletedUser = await userService.deleteUser(req.params.id);
    return successResponse(res, 'User deleted successfully', deletedUser);
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return errorResponse(res, 'Search query is required', 400);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userService.searchUsers(query, page, limit);
    return successResponse(res, 'Users found', result);
  } catch (error) {
    next(error);
  }
};

const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { User } = require('../models');
    const user = await User.findByPk(req.user.id);
    
    if (!user) return errorResponse(res, 'User not found', 404);
    
    user.profile_picture_url = req.file.location;
    await user.save();
    
    return successResponse(res, 'Profile picture updated successfully', {
      profile_picture_url: user.profile_picture_url
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  updateProfilePicture,
};