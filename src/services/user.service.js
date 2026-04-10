const { User, File } = require('../models');
const { Op } = require('sequelize');
const { deleteFileFromS3 } = require('./s3.service');

const getAllUsers = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ['password'] },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    users: rows,
  };
};

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: File,
        as: 'files',
        attributes: ['id', 'original_name', 'file_size', 'mime_type', 'created_at'],
      },
    ],
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateUser = async (userId, updateData) => {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await user.update(updateData);

  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });

  return updatedUser;
};

const deleteUser = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: File, as: 'files' }],
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Delete all user files from S3
  for (const file of user.files) {
    await deleteFileFromS3(file.s3_key);
  }

  // Delete user (cascade will delete files from DB)
  await user.destroy();

  return user;
};

const searchUsers = async (query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await User.findAndCountAll({
    where: {
      [Op.or]: [{ name: { [Op.iLike]: `%${query}%` } }, { email: { [Op.iLike]: `%${query}%` } }],
    },
    attributes: { exclude: ['password'] },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    users: rows,
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
};