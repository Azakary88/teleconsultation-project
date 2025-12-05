// src/pages/PatientDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { getUserId, logout } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

async function load() {
  setError('');
  setLoading(true);

  try {
    const res = await api.get('/api/appointments');
    console.log('[Frontend] GET /api/appointments response:', res);

    const raw = Array.isArray(res.data) ? res.data : [];

    // Normalisation : accepte patientId ou patient_id etc.
    const normalized = raw.map(o => ({
      id: o.id ?? o._id ?? null,
      patientId: o.patientId ?? o.patient_id ?? o.patient ?? null,
      doctorId: o.doctorId ?? o.doctor_id ?? o.doctor ?? null,
      title: o.title ?? o.name ?? `RDV #${o.id}`,
      start_time: o.start_time ?? o.startTime ?? o.start ?? null,
      end_time: o.end_time ?? o.endTime ?? null,
      status: o.status ?? o.state ?? null,
      notes: o.notes ?? null,
      // preserve original for debug
      _raw: o
    }));

    console.log('[Frontend] normalized appointments:', normalized);

    setAppointments(normalized);
  } catch (err) {
    console.error('Erreur chargement RDV patient', err, err.response?.data);
    setError('Impossible de récupérer les rendez-vous.');
    setAppointments([]);
  } finally {
    setLoading(false);
  }
}

async function cancelAppointment(id) {
    if (!confirm("Voulez-vous annuler ce rendez-vous ?")) return;

    try {
      await api.patch(`/api/appointments/${id}`, { status: 'cancelled' });
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Erreur annulation", err);
      alert("Impossible d'annuler ce rendez-vous.");
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Mon espace — Patient</h1>
        <div className="flex gap-2">
          <Link to="/profile" className="px-3 py-1 border rounded">Mon profil</Link>
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">
            Déconnexion
          </button>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl mb-2">Mes rendez-vous</h2>

        {loading && <div>Chargement…</div>}

        {!loading && error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div>Vous n'avez pas encore de rendez-vous.</div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <ul className="space-y-2">
            {appointments.map(appt => (
              <li key={appt.id} className="p-3 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{appt.title || `RDV #${appt.id}`}</div>
                  <div className="text-sm text-gray-600">{appt.start_time}</div>
                  <div className="text-sm text-gray-700">
                    Médecin: {appt.doctorEmail || appt.doctorName || appt.doctorId}
                  </div>
                  <div className="text-sm text-gray-600">Statut : {appt.status}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Annuler
                  </button>

                  <Link
                    to={`/appointments/${appt.id}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-center"
                  >
                    Détails
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl mb-2">Actions</h2>
        <div className="flex gap-2">
          <Link to="/doctors" className="px-3 py-2 bg-green-600 text-white rounded">
            Trouver un médecin
          </Link>
        </div>
      </section>
    </div>
  );
}
