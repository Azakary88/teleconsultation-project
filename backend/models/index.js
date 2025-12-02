const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false,
});

const db = { sequelize, Sequelize };

db.User = require('./user')(sequelize, Sequelize);
db.Doctor = require('./doctor')(sequelize, Sequelize);
db.Patient = require('./patient')(sequelize, Sequelize);
db.Appointment = require('./appointment')(sequelize, Sequelize);
db.Prescription = require('./prescription')(sequelize, Sequelize);
db.RefreshToken = require('./refreshToken')(sequelize, Sequelize);

// Associations
db.Patient.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Doctor.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Appointment.belongsTo(db.Patient, { foreignKey: 'patientId' });
db.Appointment.belongsTo(db.Doctor, { foreignKey: 'doctorId' });
db.Prescription.belongsTo(db.Appointment, { foreignKey: 'appointmentId' });
db.Prescription.belongsTo(db.Doctor, { foreignKey: 'doctorId' });
db.Prescription.belongsTo(db.Patient, { foreignKey: 'patientId' });
if (db.RefreshToken.associate) {
  db.RefreshToken.associate(db);
}

module.exports = db;
