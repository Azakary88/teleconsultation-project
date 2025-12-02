module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    speciality: { type: DataTypes.STRING },
    license_number: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    schedule: { type: DataTypes.JSON }
  }, {
    tableName: 'doctors',
    timestamps: true,
    underscored: true,
  });
  return Doctor;
};
