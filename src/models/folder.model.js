module.exports = (sequelize, DataTypes) => {
  const Folder = sequelize.define(
    'Folder',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      parent_id: {
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
      tableName: 'folders',
      timestamps: true,
      underscored: true,
      paranoid: true,
    }
  );

  return Folder;
};
