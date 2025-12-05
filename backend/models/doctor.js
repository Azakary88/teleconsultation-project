// backend/models/doctor.js
module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    userId: { type: DataTypes.INTEGER, allowNull: false },

    license_number: { type: DataTypes.STRING },
    bio: { type: DataTypes.TEXT },
    speciality: { type: DataTypes.STRING },
    schedule: { type: DataTypes.JSON },
  }, {
    tableName: 'doctors',
    timestamps: true,
    underscored: true,
  });

  return Doctor;
};
