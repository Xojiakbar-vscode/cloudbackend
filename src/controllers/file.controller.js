const fileService = require('../services/file.service');
const { validateFileId } = require('../validations/file.validation');
const { successResponse, errorResponse } = require('../utils/response');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const { folder_id, size } = req.body;
    req.file.size = req.file.size || parseInt(size, 10) || 0;
    
    const file = await fileService.uploadFile(req.user.id, req.file, folder_id);
    return successResponse(res, 'File uploaded successfully', file, 201);
  } catch (error) {
    next(error);
  }
};

const getUserFiles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const folderId = req.query.folder_id || null;
    const isSecret = req.query.is_secret === 'true';

    const result = await fileService.getUserFiles(req.user.id, page, limit, folderId, isSecret);
    return successResponse(res, 'Files retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

const getFileById = async (req, res, next) => {
  try {
    const { error } = validateFileId(req.params);
    if (error) {
      return errorResponse(res, error.details[0].message, 400);
    }

    const file = await fileService.getFileById(req.params.id, req.user.id, req.user.role === 'admin');
    return successResponse(res, 'File retrieved successfully', file);
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

    const deletedFile = await fileService.deleteFile(req.params.id, req.user.id, req.user.role === 'admin');
    return successResponse(res, 'File moved to trash', deletedFile);
  } catch (error) {
    next(error);
  }
};

const getTrashFiles = async (req, res, next) => {
  try {
    const files = await fileService.getTrashFiles(req.user.id);
    return successResponse(res, 'Trash files retrieved successfully', files);
  } catch (error) {
    next(error);
  }
};

const restoreFile = async (req, res, next) => {
  try {
    const restoredFile = await fileService.restoreFile(req.params.id, req.user.id);
    return successResponse(res, 'File restored successfully', restoredFile);
  } catch (error) {
    next(error);
  }
};

const permanentlyDeleteFile = async (req, res, next) => {
  try {
    const deletedFile = await fileService.permanentlyDeleteFile(req.params.id, req.user.id);
    return successResponse(res, 'File permanently deleted', deletedFile);
  } catch (error) {
    next(error);
  }
};

const moveToSecret = async (req, res, next) => {
  try {
    const { File } = require('../models');
    const file = await File.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    
    if (!file) return errorResponse(res, 'File not found', 404);
    
    file.is_secret = true;
    await file.save();
    
    return successResponse(res, 'File moved to secret vault');
  } catch (error) {
    next(error);
  }
};

const shareFile = async (req, res, next) => {
  try {
    const file = await fileService.getFileForSharing(req.params.id);
    // Redirect to the signed S3 URL
    return res.redirect(file.download_url);
  } catch (error) {
    next(error);
  }
};

const viewFile = async (req, res, next) => {
  try {
    const file = await fileService.getFileById(req.params.id, req.user.id, req.user.role === 'admin');
    const { getFileStream } = require('../services/s3.service');
    
    const s3Response = await getFileStream(file.s3_key);
    
    res.setHeader('Content-Type', s3Response.ContentType || file.mime_type || 'application/octet-stream');
    if (s3Response.ContentLength) {
      res.setHeader('Content-Length', s3Response.ContentLength);
    }
    res.setHeader('Cache-Control', 'private, max-age=86400');
    
    // Pipe the stream to response
    const stream = s3Response.Body;
    if (stream) {
      stream.pipe(res);
    } else {
      throw new Error('S3 response body is empty');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getUserFiles,
  getFileById,
  deleteFile,
  getTrashFiles,
  restoreFile,
  permanentlyDeleteFile,
  moveToSecret,
  shareFile,
  viewFile,
};