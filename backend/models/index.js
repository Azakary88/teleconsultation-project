const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const db = { sequelize, Sequelize };

// ----------------- MODELS -----------------
db.User = require('./user')(sequelize, Sequelize);
db.Doctor = require('./doctor')(sequelize, Sequelize);
db.Patient = require('./patient')(sequelize, Sequelize);
db.Appointment = require('./appointment')(sequelize, Sequelize);
db.Prescription = require('./prescription')(sequelize, Sequelize);
db.RefreshToken = require('./refreshToken')(sequelize, Sequelize);


// ====================================================
//          ASSOCIATIONS **100% COMPATIBLES**
// ====================================================

// ---------- USER <-> DOCTOR  ----------
// users.id = doctors.user_id
db.User.hasOne(db.Doctor, {
  foreignKey: 'user_id',
  as: 'doctor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.Doctor.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});


// ---------- USER <-> PATIENT ----------
db.User.hasOne(db.Patient, {
  foreignKey: 'user_id',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

db.Patient.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});


// ---------- APPOINTMENTS ----------
db.Appointment.belongsTo(db.Patient, {
  foreignKey: 'patient_id',
  as: 'patient'
});

db.Appointment.belongsTo(db.Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor'
});


// ---------- PRESCRIPTIONS ----------
db.Prescription.belongsTo(db.Appointment, {
  foreignKey: 'appointment_id',
  as: 'appointment'
});

db.Prescription.belongsTo(db.Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor'
});

db.Prescription.belongsTo(db.Patient, {
  foreignKey: 'patient_id',
  as: 'patient'
});


// ---------- REFRESH TOKEN ----------
if (db.RefreshToken.associate) db.RefreshToken.associate(db);


module.exports = db;
