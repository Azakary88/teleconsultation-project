module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // explicit mapping: Sequelize property patientId -> DB column patient_id
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'patient_id'
    },

    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'doctor_id'
    },

    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE },

    // Align enum with backend: include both 'done' and 'completed' or prefer one.
    // Here j'ajoute 'done' pour garder compatibilité avec ton code existant.
    status: {
      type: DataTypes.ENUM('requested','confirmed','cancelled','done','completed'),
      defaultValue: 'requested'
    },

    title: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }

  }, {
    tableName: 'appointments',
    timestamps: true,
    underscored: true,
  });

  return Appointment;
};
