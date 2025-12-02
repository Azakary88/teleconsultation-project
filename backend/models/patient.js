module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    birthdate: { type: DataTypes.DATEONLY },
    medical_history: { type: DataTypes.TEXT }
  }, {
    tableName: 'patients',
    timestamps: true,
    underscored: true,
  });
  return Patient;
};
