const userService = require('../services/user.service');
const fileService = require('../services/file.service');
const { validateUserId } = require('../validations/user.validation');
const { validateFileId } = require('../validations/file.validation');
const { successResponse, errorResponse } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
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

const getAllFiles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.user_id;

    // For admin, we need a different service method
    const { File, User } = require('../models');
    const offset = (page - 1) * limit;

    const whereCondition = userId ? { user_id: userId } : {};

    const { count, rows } = await File.findAndCountAll({
      where: whereCondition,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const filesWithUrls = await Promise.all(
      rows.map((file) => fileService.formatFile(file))
    );

    const result = {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      files: filesWithUrls,
    };

    return successResponse(res, 'Files retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { error } = validateFileId(req.params);
    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const deletedFile = await fileService.deleteFile(req.params.id, null, true);
    return successResponse(res, 'File deleted successfully', deletedFile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllFiles,
  deleteFile,
};