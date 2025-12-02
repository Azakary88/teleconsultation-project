module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    appointmentId: { type: DataTypes.INTEGER },
    doctorId: { type: DataTypes.INTEGER },
    patientId: { type: DataTypes.INTEGER },
    content: { type: DataTypes.TEXT }
  }, {
    tableName: 'prescriptions',
    timestamps: true,
    underscored: true,
  });
  return Prescription;
};
