module.exports = (sequelize, DataTypes) => {
  const SupportReply = sequelize.define(
    'SupportReply',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      support_message_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null for anonymous user if we allow that, but primarily for logged in
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'support_replies',
      timestamps: true,
      underscored: true,
    }
  );

  return SupportReply;
};
