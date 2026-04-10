const { Folder, File } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const createFolder = async (req, res, next) => {
  try {
    const { name, parent_id } = req.body;
    const userId = req.user.id;

    const folder = await Folder.create({
      name,
      user_id: userId,
      parent_id: parent_id || null,
    });

    return successResponse(res, 'Folder created successfully', folder, 201);
  } catch (error) {
    next(error);
  }
};

const getFolders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const parentId = req.query.parent_id || null;
    const isSecret = req.query.is_secret === 'true';

    const folders = await Folder.findAll({
      where: { 
        user_id: userId,
        parent_id: parentId === 'null' ? null : parentId,
        is_secret: isSecret
      },
      order: [['name', 'ASC']],
    });

    return successResponse(res, 'Folders retrieved successfully', folders);
  } catch (error) {
    next(error);
  }
};

const deleteFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const folder = await Folder.findOne({ where: { id, user_id: userId } });

    if (!folder) {
      return errorResponse(res, 'Folder not found', 404);
    }

    // Find all files in this folder (and subfolders recursively if needed, but for now just this folder)
    const files = await File.findAll({ where: { folder_id: id } });
    
    // Delete files from S3 and DB
    const { deleteFileFromS3 } = require('../services/s3.service');
    for (const file of files) {
      await deleteFileFromS3(file.s3_key).catch(err => console.error(`S3 delete failed for ${file.s3_key}:`, err));
      await file.destroy({ force: true });
    }

    // Also delete subfolders recursively
    const subfolders = await Folder.findAll({ where: { parent_id: id } });
    for (const sub of subfolders) {
      // In a real app, this should be recursive. For now, we handle one level or simple recursion.
      const subFiles = await File.findAll({ where: { folder_id: sub.id } });
      for (const sf of subFiles) {
        await deleteFileFromS3(sf.s3_key).catch(err => console.error(`S3 delete failed for ${sf.s3_key}:`, err));
        await sf.destroy({ force: true });
      }
      await sub.destroy({ force: true });
    }

    // Permanent delete the folder
    await folder.destroy({ force: true });

    return successResponse(res, 'Folder and its contents permanently deleted');
  } catch (error) {
    next(error);
  }
};

const getTrashFolders = async (req, res, next) => {
  try {
    const folders = await Folder.findAll({
      where: { 
        user_id: req.user.id,
        deleted_at: { [require('sequelize').Op.ne]: null }
      },
      paranoid: false,
    });
    return successResponse(res, 'Trash folders retrieved successfully', folders);
  } catch (error) {
    next(error);
  }
};

const restoreFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      paranoid: false,
    });
    
    if (!folder) return errorResponse(res, 'Folder not found', 404);
    
    await folder.restore();
    return successResponse(res, 'Folder restored successfully');
  } catch (error) {
    next(error);
  }
};

const moveToSecret = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    
    if (!folder) return errorResponse(res, 'Folder not found', 404);
    
    folder.is_secret = true;
    await folder.save();
    
    return successResponse(res, 'Folder moved to secret vault');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFolder,
  getFolders,
  deleteFolder,
  getTrashFolders,
  restoreFolder,
  moveToSecret,
};
