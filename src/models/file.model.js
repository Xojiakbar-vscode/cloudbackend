module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define(
    'File',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      original_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mime_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      s3_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      folder_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'folders',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      is_secret: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'files',
      timestamps: true,
      underscored: true,
      paranoid: true,
    }
  );

  return File;
};