const { File } = require('../models');
const { getSignedFileUrl, deleteFileFromS3 } = require('./s3.service');
const { Op } = require('sequelize');

const formatFile = async (file) => {
  const plainFile = typeof file.toJSON === 'function' ? file.toJSON() : file;
  const signedUrl = await getSignedFileUrl(plainFile.s3_key);
  return {
    ...plainFile,
    download_url: signedUrl,
  };
};

const uploadFile = async (userId, file, folderId = null) => {
  const fileData = await File.create({
    user_id: userId,
    filename: file.key,
    original_name: file.originalname,
    file_url: file.location,
    file_size: file.size,
    mime_type: file.mimetype,
    s3_key: file.key,
    folder_id: folderId || null,
  });

  return fileData;
};

const getUserFiles = async (userId, page = 1, limit = 10, folderId = null, isSecret = false) => {
  const offset = (page - 1) * limit;

  const whereCondition = { 
    user_id: userId,
    is_secret: isSecret
  };
  if (folderId) {
    whereCondition.folder_id = folderId === 'null' ? null : folderId;
  } else {
    // If no folder_id provided, we might want to return only those in root, 
    // or all. User's request says "folder ochish kerak u folder ichiga rasm qushisih",
    // so listing root by default is better.
    whereCondition.folder_id = null;
  }

  const { count, rows } = await File.findAndCountAll({
    where: whereCondition,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  // Generate signed URLs for each file
  const filesWithSignedUrls = await Promise.all(
    rows.map((file) => formatFile(file))
  );

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    files: filesWithSignedUrls,
  };
};

const getFileById = async (fileId, userId, isAdmin = false) => {
  const whereCondition = isAdmin ? { id: fileId } : { id: fileId, user_id: userId };

  const file = await File.findOne({ where: whereCondition });

  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  return await formatFile(file);
};

const getFileForSharing = async (fileId) => {
  const file = await File.findOne({ where: { id: fileId } });

  if (!file) {
    const error = new Error('File not found');
    error.statusCode = 404;
    throw error;
  }

  return await formatFile(file);
};

const deleteFile = async (id, userId, isAdmin = false) => {
  const where = isAdmin ? { id } : { id, user_id: userId };
  const file = await File.findOne({ where });

  if (!file) {
    throw new Error('File not found');
  }

  // Delete from S3
  await deleteFileFromS3(file.s3_key);

  // Permanent delete from database
  await file.destroy({ force: true });
  
  return file;
};

const getTrashFiles = async (userId) => {
  const { User } = require('../models');
  const rows = await File.findAll({
    where: { 
      user_id: userId,
      deleted_at: { [Op.ne]: null }
    },
    paranoid: false,
    order: [['deleted_at', 'DESC']],
  });

  const filesWithSignedUrls = await Promise.all(
    rows.map((file) => formatFile(file))
  );

  return filesWithSignedUrls;
};

const restoreFile = async (id, userId) => {
  const file = await File.findOne({
    where: { id, user_id: userId },
    paranoid: false,
  });

  if (!file) {
    throw new Error('File not found in trash');
  }

  await file.restore();
  return file;
};

const permanentlyDeleteFile = async (id, userId) => {
  const file = await File.findOne({
    where: { id, user_id: userId },
    paranoid: false,
  });

  if (!file) {
    throw new Error('File not found');
  }

  await deleteFileFromS3(file.s3_key);
  await file.destroy({ force: true });
  return file;
};

const searchFiles = async (userId, query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await File.findAndCountAll({
    where: {
      user_id: userId,
      [Op.or]: [
        { original_name: { [Op.iLike]: `%${query}%` } },
        { filename: { [Op.iLike]: `%${query}%` } },
      ],
    },
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  const filesWithUrls = await Promise.all(
    rows.map((file) => formatFile(file))
  );

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    files: filesWithUrls,
  };
};

module.exports = {
  uploadFile,
  getUserFiles,
  getFileById,
  deleteFile,
  getTrashFiles,
  restoreFile,
  permanentlyDeleteFile,
  searchFiles,
  formatFile,
  getFileForSharing,
};