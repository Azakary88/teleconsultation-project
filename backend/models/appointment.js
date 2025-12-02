module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('requested','confirmed','cancelled','completed'), defaultValue: 'requested' }
  }, {
    tableName: 'appointments',
    timestamps: true,
    underscored: true,
  });
  return Appointment;
};
