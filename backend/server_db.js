// backend/server_db.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const db = require('./models');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// helper: jwt utils
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("./utils/jwt");

// auth middleware
const auth = require('./middleware/auth');

// -------------------- ROUTES --------------------

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email_password_required' });
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(password, 10);
  // autour de la route /api/auth/register
  try {
    const user = await db.User.create({ email, password_hash: hash, role: role || 'PATIENT' });
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    // DEBUG: affiche la stack complète dans la console du serveur
    console.error('REGISTER ERROR:', err);
    console.error(err.stack);

    // Réponse utile côté frontend (en dev)
    return res.status(500).json({
      error: 'user_creation_failed',
      message: err.message,
      // details may include validation / SQL error
      details: err.errors ? err.errors.map(e => e.message) : null
    });
  }
});

// REGISTER DOCTOR
app.post('/api/auth/register-doctor', async (req, res) => {
  try {
    const { email, password, speciality, license_number, bio } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email_password_required" });

    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 10);

    // ---- Create user in table users ----
    const user = await db.User.create({
      email,
      password_hash: hash,
      role: 'DOCTOR'
    });

    // ---- Create doctor profile in table doctors ----
    await db.Doctor.create({
      userId: user.id,
      speciality: speciality || null,
      license_number: license_number || null,
      bio: bio || null,
      schedule: JSON.stringify({}) // placeholder
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error("REGISTER DOCTOR ERROR:", err);
    res.status(500).json({ error: "doctor_register_failed", details: err.message });
  }
});

// REGISTER PATIENT
app.post('/api/auth/register-patient', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email_password_required" });

    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(password, 10);

    // ---- Create user ----
    const user = await db.User.create({
      email,
      password_hash: hash,
      role: 'PATIENT'
    });

    // ---- Create patient ----
    await db.Patient.create({
      userId: user.id,
      medical_history: JSON.stringify([]),
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error("REGISTER PATIENT ERROR:", err);
    res.status(500).json({
      error: "patient_register_failed",
      details: err.message
    });
  }
});
// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email_password_required' });

  const user = await db.User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  const bcrypt = require('bcrypt');
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const payload = { id: user.id, email: user.email, role: user.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Persist refresh token in DB (PoC: store token string and expiry)
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(refreshToken);
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;
    await db.RefreshToken.create({ token: refreshToken, userId: user.id, expiresAt });
  } catch (err) {
    console.error('Failed to persist refresh token', err);
    // ne pas bloquer la réponse si la persistence échoue — on renvoie quand même tokens
  }

  res.json({
    user: payload,
    accessToken,
    refreshToken
  });
});

// LIST DOCTORS
app.get('/api/doctors', async (req, res) => {
  try {
    const docs = await db.Doctor.findAll({
      include: [
        { model: db.User, as: 'user', attributes: ['email'] }
      ]
    });

    const formatted = docs.map(d => ({
      id: d.id,
      userId: d.userId,
      email: d.user?.email || null,
      speciality: d.speciality || null,
      license_number: d.license_number || null,
      bio: d.bio || null,
      schedule: d.schedule || null
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erreur /api/doctors :", err);
    res.status(500).json({ error: "server_error" });
  }
});

// GET Appointment Details
app.get('/api/appointments/:id', auth, async (req, res) => {
  try {
    const appt = await db.Appointment.findByPk(req.params.id, {
      include: [
        {
          model: db.Patient,
          as: 'patient',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['email']
            }
          ]
        },
        {
          model: db.Doctor,
          as: 'doctor',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['email']
            }
          ]
        }
      ]
    });

    if (!appt) {
      return res.status(404).json({ error: "appointment_not_found" });
    }

    const output = {
      id: appt.id,
      title: appt.title || null,
      start_time: appt.start_time,
      status: appt.status,
      notes: appt.notes || null,

      patientId: appt.patientId,
      patientEmail: appt.patient?.user?.email || null,

      doctorId: appt.doctorId,
      doctorEmail: appt.doctor?.user?.email || null,

      created_at: appt.created_at,
      updated_at: appt.updated_at,
    };

    res.json(output);

  } catch (err) {
    console.error("Erreur /api/appointments/:id :", err);
    res.status(500).json({ error: "server_error" });
  }
});

// CREATE APPOINTMENT
// DEBUG /api/appointments robust
app.post('/api/appointments', auth, async (req, res) => {
  try {
    console.log('[POST /api/appointments] req.user =', req.user);
    console.log('[POST /api/appointments] req.body =', req.body);

    let { patientId, doctorId, startTime, endTime, title, notes } = req.body;
    const requester = req.user;
    if (!requester) return res.status(401).json({ error: 'not_authenticated' });

    // --- MAP USER -> patient.id / doctor.id ---
    const role = (requester.role || '').toUpperCase();

    // If requester is PATIENT: find patient's record and use patients.id
    if (role === 'PATIENT') {
      const patientRow = await db.Patient.findOne({ where: { user_id: requester.id } });
      if (!patientRow) {
        return res.status(400).json({ error: 'patient_profile_not_found', details: 'Créez d\'abord le profil patient.' });
      }
      patientId = patientRow.id;
    } else {
      // If not patient and no patientId provided, it's an error (except ADMIN can provide)
      if (!patientId) {
        return res.status(400).json({ error: 'missing_patientId' });
      }
    }

    // If requester is DOCTOR and frontend did not provide doctorId, resolve it from user->doctor
    if (role === 'DOCTOR' && !doctorId) {
      const doctorRow = await db.Doctor.findOne({ where: { user_id: requester.id } });
      if (!doctorRow) {
        return res.status(400).json({ error: 'doctor_profile_not_found', details: 'Profil médecin introuvable.' });
      }
      doctorId = doctorRow.id;
    }

    if (!doctorId) return res.status(400).json({ error: 'doctor_and_start_required' });
    if (!startTime) return res.status(400).json({ error: 'doctor_and_start_required' });

    const s = new Date(startTime);
    if (isNaN(s.getTime())) return res.status(400).json({ error: 'invalid_start_time' });
    const e = endTime ? new Date(endTime) : new Date(s.getTime() + 30*60*1000);
    if (isNaN(e.getTime())) return res.status(400).json({ error: 'invalid_end_time' });

    // conflict check (utilise les statuts MySQL existants)
    const conflicts = await db.Appointment.findAll({
      where: {
        doctorId,
        status: { [db.Sequelize.Op.in]: ['requested','confirmed'] },
        [db.Sequelize.Op.and]: [
          { start_time: { [db.Sequelize.Op.lt]: e.toISOString() } },
          { end_time:   { [db.Sequelize.Op.gt]: s.toISOString() } }
        ]
      }
    });

    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({ error: 'time_conflict', details: 'Le médecin a déjà un rendez-vous à ce créneau.' });
    }

    // create appointment
    try {
      const created = await db.Appointment.create({
        patientId,
        doctorId,
        title: title || 'Consultation',
        notes: notes || null,
        start_time: s.toISOString(),
        end_time: e.toISOString(),
        status: 'requested'
      });
      return res.status(201).json(created);
    } catch (errCreate) {
      console.error('[POST /api/appointments] create error:', errCreate && errCreate.message);
      if (errCreate.name === 'SequelizeForeignKeyConstraintError' || errCreate.parent?.errno === 1452) {
        return res.status(400).json({ error: 'foreign_key_error', details: 'doctorId ou patientId introuvable en base' });
      }
      throw errCreate;
    }

  } catch (err) {
    console.error('[POST /api/appointments] ERROR', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'appointment_failed', details: err.message || String(err) });
  }
});


// --- REFRESH (avec rotation) ---
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "missing_refresh_token" });

  try {
    // verify signature & decode (throws if invalid)
    const decoded = verifyRefreshToken(refreshToken);

    // Find the token row (must exist and not be revoked)
    const tokenRow = await db.RefreshToken.findOne({ where: { token: refreshToken, revoked: false } });
    if (!tokenRow) return res.status(403).json({ error: "invalid_refresh_token" });

    // Optionally check expiry (we persisted expiresAt)
    if (tokenRow.expiresAt && new Date() > new Date(tokenRow.expiresAt)) {
      // mark revoked for safety
      tokenRow.revoked = true;
      await tokenRow.save();
      return res.status(403).json({ error: "invalid_refresh_token", details: "expired" });
    }

    // Rotate: revoke the old token
    tokenRow.revoked = true;
    await tokenRow.save();

    // Create new refresh token and persist it
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const newRefreshToken = generateRefreshToken(payload);
    const jwt = require('jsonwebtoken');
    const decodedNew = jwt.decode(newRefreshToken);
    const expiresAt = decodedNew && decodedNew.exp ? new Date(decodedNew.exp * 1000) : null;
    await db.RefreshToken.create({ token: newRefreshToken, userId: payload.id, expiresAt });

    // Generate new access token and return both
    const accessToken = generateAccessToken(payload);
    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(403).json({ error: "invalid_refresh_token", details: err.message });
  }
});

// LOGOUT - revoke refresh token
app.post('/api/auth/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "missing_refresh_token" });

  try {
    const tokenRow = await db.RefreshToken.findOne({ where: { token: refreshToken } });
    if (!tokenRow) return res.status(200).json({ ok: true, message: 'token_not_found' });

    tokenRow.revoked = true;
    await tokenRow.save();
    return res.json({ ok: true });
  } catch (err) {
    console.error('Logout failed', err);
    return res.status(500).json({ error: 'logout_failed', details: err.message });
  }
});

// GET /api/profile - renvoie profil utilisateur connecté
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'created_at', 'updated_at'],
      include: [
        {
          model: db.Doctor,
          as: 'doctor',
          attributes: ['speciality', 'license_number', 'bio']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "user_not_found" });
    }

  const output = {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    patientId: user.patient?.id || null,
    doctorId: user.doctor?.id || null,
    doctor: user.doctor || null,
    patient: user.patient || null
  };


    res.json(output);
  } catch (err) {
    console.error("Erreur profile:", err);
    res.status(500).json({ error: "profile_fetch_failed" });
  }
});

// DEBUG: liste des refresh tokens
app.get('/debug/refresh-tokens', async (req, res) => {
  const tokens = await db.RefreshToken.findAll({ limit: 100, order: [['created_at','DESC']] });
  res.json({ refreshTokens: tokens.map(t => ({ id: t.id, userId: t.userId, revoked: t.revoked, expiresAt: t.expiresAt })) });
});

// GET /api/appointments protégé : renvoie RDV selon rôle
  app.get('/api/appointments', auth, async (req, res) => {
    try {
      console.log("[GET /api/appointments] user:", req.user);

      const { id: userId, role } = req.user;

      let effectiveId = userId;      
      let field = null;              
      if ((role || '').toUpperCase() === 'PATIENT') {
        // Récupérer l'ID dans la table patients
        const p = await db.Patient.findOne({ where: { userId: userId } });
        if (!p) return res.json([]);  // pas de profil patient
        console.log(">>> patient.id =", p.id);

        effectiveId = p.id;          // on utilise patients.id
        field = 'patient_id';
      }
      else if ((role || '').toUpperCase() === 'DOCTOR') {
        // Récupérer l'ID dans la table doctors
        const d = await db.Doctor.findOne({ where: { userId: userId } });
        if (!d) return res.json([]);
        console.log(">>> doctor.id =", d.id);

        effectiveId = d.id;
        field = 'doctor_id';
      } else {
        return res.status(403).json({ error: "role_not_supported" });
      }

      // Chercher les RDV correspondant
      const appts = await db.Appointment.findAll({
        where: { [field]: effectiveId },
        order: [['start_time', 'DESC']]
      });

      console.log(">>> RDV trouvés :", appts.length);

      return res.json(appts);
    } catch (err) {
      console.error("GET /api/appointments ERROR", err);
      return res.status(500).json({ error: "failed_fetch_appointments" });
    }
  });



// ---------- PATCH /api/appointments/:id  (modifier status, notes, etc.) ----------
app.patch('/api/appointments/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { status, notes, startTime, endTime } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: 'not_authenticated' });

    if (!db || !db.Appointment) {
      return res.status(500).json({ error: 'no_db' });
    }

    const appt = await db.Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: 'not_found' });

    const role = (user.role || '').toUpperCase();

    // Only allowed updates:
    // - Patient can cancel (set status = 'cancelled') or update notes if allowed
    // - Doctor can set status to 'confirmed' or 'done' or 'cancelled'
    if (status) {
      const sUpper = String(status).toLowerCase();
      if (role === 'PATIENT') {
        if (!['cancelled'].includes(sUpper)) return res.status(403).json({ error: 'forbidden_status_change' });
        if (String(appt.patientId) !== String(user.id)) return res.status(403).json({ error: 'forbidden' });
      } else if (role === 'DOCTOR') {
        if (!['confirmed','done','cancelled'].includes(sUpper)) return res.status(403).json({ error: 'forbidden_status_change' });
        if (String(appt.doctorId) !== String(user.id)) return res.status(403).json({ error: 'forbidden' });
      } else {
        return res.status(403).json({ error: 'forbidden' });
      }
      appt.status = sUpper;
    }

    if (notes !== undefined) {
      // Allow doctor or patient to add notes if owner
      if (role === 'PATIENT' && String(appt.patientId) !== String(user.id)) return res.status(403).json({ error: 'forbidden' });
      if (role === 'DOCTOR' && String(appt.doctorId) !== String(user.id)) return res.status(403).json({ error: 'forbidden' });
      appt.notes = notes;
    }

    if (startTime || endTime) {
      // Optional: only doctor can change schedule
      if (role !== 'DOCTOR') return res.status(403).json({ error: 'only_doctor_can_reschedule' });
      // Simple check: no overlapping with other appts
      const s = startTime ? new Date(startTime) : new Date(appt.start_time);
      const e = endTime ? new Date(endTime) : new Date(appt.end_time || s.getTime() + 30*60*1000);

      const conflicts = await db.Appointment.findAll({
        where: {
          id: { [db.Sequelize.Op.ne]: appt.id },
          doctorId: appt.doctorId,
          status: { [db.Sequelize.Op.in]: ['requested','confirmed'] },
          [db.Sequelize.Op.and]: [
            { start_time: { [db.Sequelize.Op.lt]: e.toISOString() } },
            { end_time:   { [db.Sequelize.Op.gt]: s.toISOString() } }
          ]
        }
      });
      if (conflicts && conflicts.length > 0) return res.status(409).json({ error: 'time_conflict' });

      appt.start_time = s.toISOString();
      appt.end_time = e.toISOString();
    }

    await appt.save();
    return res.json(appt);
  } catch (err) {
    console.error('PATCH /api/appointments/:id', err);
    return res.status(500).json({ error: 'failed', details: err.message || err });
  }
});
// ---------- DELETE /api/appointments/:id  -> mark cancelled ----------
app.delete('/api/appointments/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'not_authenticated' });

    if (!db || !db.Appointment) return res.status(500).json({ error: 'no_db' });

    const appt = await db.Appointment.findByPk(id);
    if (!appt) return res.status(404).json({ error: 'not_found' });

    // Only owner patient or assigned doctor can cancel
    if (String(appt.patientId) !== String(user.id) && String(appt.doctorId) !== String(user.id)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    appt.status = 'cancelled';
    await appt.save();
    return res.json({ ok: true, id: appt.id, status: appt.status });
  } catch (err) {
    console.error('DELETE /api/appointments/:id', err);
    return res.status(500).json({ error: 'failed', details: err.message || err });
  }
});

// Sync DB and start server
const port = process.env.PORT || 3000;
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('DB connection OK');
    await db.sequelize.sync({ alter: true }); // for PoC; in prod use migrations
    app.listen(port, () => console.log('Server started on port', port));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
