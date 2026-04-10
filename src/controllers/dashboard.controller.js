const { User, File } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

const getStats = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'req.user is missing', 401);
    }
    const isAdmin = req.user.role === 'admin';
    const userId = req.user.id;

    // Statistics depend on the role
    const userWhere = isAdmin ? {} : { id: userId };
    const fileWhere = isAdmin ? {} : { user_id: userId };

    const totalUsers = await User.count({ where: userWhere });
    const totalFiles = await File.count({ where: fileWhere });
    
    // Sum storage
    const files = await File.findAll({
      where: fileWhere,
      attributes: ['file_size'],
    });

    const totalStorage = files.reduce((acc, file) => acc + (parseInt(file.file_size) || 0), 0);
    
    // Last 7 days history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentFiles = await File.findAll({
      where: {
        ...fileWhere,
        created_at: { [Op.gte]: sevenDaysAgo }
      },
      attributes: ['created_at'],
      order: [['created_at', 'ASC']]
    });

    const history = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const count = recentFiles.filter(f => {
        if (!f.created_at) return false;
        try {
          return new Date(f.created_at).toISOString().split('T')[0] === dateStr;
        } catch (e) {
          return false;
        }
      }).length;
      
      history.push({ date: dateStr, count });
    }

    return successResponse(res, 'Dashboard statistics retrieved successfully', {
      totalUsers,
      totalFiles,
      totalStorage,
      history,
    });
  } catch (error) {
    console.error('getStats implementation error:', error);
    if (typeof errorResponse === 'function') {
      return errorResponse(res, `getStats error: ${error.message}`, 500);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
};
