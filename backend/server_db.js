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

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email_password_required' });
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await db.User.create({ email, password_hash: hash, role: role || 'PATIENT' });
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    return res.status(400).json({ error: 'user_creation_failed', details: err.message });
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
  const docs = await db.Doctor.findAll({ include: [{ model: db.User, as: 'user', attributes: ['email'] }] });
  res.json(docs);
});

// CREATE APPOINTMENT
app.post('/api/appointments', async (req, res) => {
  const { patientId, doctorId, startTime } = req.body;
  try {
    const appt = await db.Appointment.create({ patientId, doctorId, start_time: startTime, status: 'confirmed' });
    res.status(201).json({ id: appt.id });
  } catch (err) {
    res.status(400).json({ error: 'appointment_failed', details: err.message });
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

// Protected profile route - middleware 'auth' must set req.user
const auth = require('./middleware/auth');
app.get('/api/profile', auth, async (req, res) => {
  const user = await db.User.findByPk(req.user.id);
  res.json({ id: user.id, email: user.email, role: user.role });
});

// Debug endpoint to view refresh tokens (DEV ONLY)
app.get('/debug/refresh-tokens', async (req, res) => {
  const tokens = await db.RefreshToken.findAll({ limit: 100, order: [['createdAt','DESC']] });
  res.json({ refreshTokens: tokens.map(t => ({ id: t.id, userId: t.userId, revoked: t.revoked, expiresAt: t.expiresAt })) });
});

app.get('/api/appointments', async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    let appts = [];

    // Si tu utilises Sequelize / ORM et que db.Appointment existe, récupère depuis la DB.
    try {
      if (typeof db !== 'undefined' && db.Appointment) {
        const where = {};
        if (patientId) where.patientId = patientId;
        if (doctorId) where.doctorId = doctorId;
        appts = await db.Appointment.findAll({
          where,
          order: [['start_time', 'DESC']]
        });
      }
    } catch (dbErr) {
      console.warn('DB fetch appointments failed, using fallback sample:', dbErr.message || dbErr);
    }

    // Fallback: données d'exemple si DB absent ou vide
    if (!Array.isArray(appts) || appts.length === 0) {
      appts = [
        { id: 1, title: 'Consultation généraliste', start_time: '2025-12-05T10:00:00Z', patientId: '10', patientName: 'Ali', doctorId: '2', doctorName: 'Dr Bob' },
        { id: 2, title: 'Suivi cardiologie',     start_time: '2025-12-06T14:00:00Z', patientId: '11', patientName: 'Awa', doctorId: '2', doctorName: 'Dr Bob' }
      ];

      // Appliquer filtre si demandé même sur fallback
      if (patientId) appts = appts.filter(a => String(a.patientId) === String(patientId));
      if (doctorId) appts = appts.filter(a => String(a.doctorId) === String(doctorId));
    }

    return res.json(appts);
  } catch (err) {
    console.error('GET /api/appointments error:', err);
    return res.status(500).json({ error: 'failed_fetch_appointments', details: err.message || err });
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
