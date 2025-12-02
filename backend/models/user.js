module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('PATIENT','DOCTOR','ADMIN'), allowNull: false, defaultValue: 'PATIENT' },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });
  return User;
};
