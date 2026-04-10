const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const User = require('./user.model')(sequelize, Sequelize);
const Folder = require('./folder.model')(sequelize, Sequelize);
const File = require('./file.model')(sequelize, Sequelize);
const SupportMessage = require('./support.model')(sequelize, Sequelize);
const SupportReply = require('./support_reply.model')(sequelize, Sequelize);

// Associations
User.hasMany(Folder, { foreignKey: 'user_id', as: 'folders' });
Folder.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Folder.hasMany(File, { foreignKey: 'folder_id', as: 'files' });
File.belongsTo(Folder, { foreignKey: 'folder_id', as: 'folder' });

User.hasMany(File, { foreignKey: 'user_id', as: 'all_files' });
File.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Self-association for subfolders (optional but good for future)
Folder.hasMany(Folder, { foreignKey: 'parent_id', as: 'subfolders' });
Folder.belongsTo(Folder, { foreignKey: 'parent_id', as: 'parent' });

User.hasMany(SupportMessage, { foreignKey: 'user_id', as: 'support_messages' });
SupportMessage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

SupportMessage.hasMany(SupportReply, { foreignKey: 'support_message_id', as: 'replies' });
SupportReply.belongsTo(SupportMessage, { foreignKey: 'support_message_id', as: 'thread' });
SupportReply.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

module.exports = {
  sequelize,
  User,
  Folder,
  File,
  SupportMessage,
  SupportReply,
};