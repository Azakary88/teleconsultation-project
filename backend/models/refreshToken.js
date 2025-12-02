// backend/models/refreshToken.js
module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    token: { type: DataTypes.TEXT, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
    expiresAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true
  });

  RefreshToken.associate = function(models) {
    RefreshToken.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return RefreshToken;
};
