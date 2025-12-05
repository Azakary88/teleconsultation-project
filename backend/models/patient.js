// backend/models/patient.js
module.exports = (sequelize, DataTypes) => { 
  const Patient = sequelize.define('Patient', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },


    userId: { type: DataTypes.INTEGER, allowNull: false },

    medical_history: { type: DataTypes.JSON, defaultValue: [] }
  }, {
    tableName: 'patients',
    timestamps: true,
    underscored: true, // crée bien "user_id" en SQL
  });

  return Patient;
};
