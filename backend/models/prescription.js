module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Prescription', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    appointmentId: { type: DataTypes.INTEGER, allowNull: true, field: 'appointment_id' },
    patientId:     { type: DataTypes.INTEGER, allowNull: true, field: 'patient_id' },
    doctorId:      { type: DataTypes.INTEGER, allowNull: true, field: 'doctor_id' }, // <-- allowNull true

    content: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'prescriptions',
    underscored: true,
    timestamps: true,
  });
};
