// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { getUserId, logout } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setError('');
      setLoading(true);
      try {
        const res = await api.get('/api/appointments');
        const list = Array.isArray(res.data) ? res.data : [];

        const userId = getUserId();
        if (!userId) {
          setAppointments([]);
          setError('Utilisateur non identifié — reconnectez-vous.');
        } else {
          const filtered = list.filter(a => String(a.doctorId) === String(userId));
          setAppointments(filtered);
        }
      } catch (err) {
        console.error('Erreur chargement RDV médecin', err);
        setError("Impossible de récupérer les rendez-vous. Réessayez plus tard.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    // Option : rafraîchir périodiquement
    // const iv = setInterval(load, 30_000);
    // return () => clearInterval(iv);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Tableau de bord — Médecin</h1>
        <div className="flex gap-2">
          <Link to="/profile" className="px-3 py-1 border rounded">Mon profil</Link>
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">Déconnexion</button>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl mb-2">Rendez-vous à traiter</h2>

        {loading && <div>Chargement…</div>}

        {!loading && error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div>Aucun rendez-vous pour le moment.</div>
        )}

        {!loading && !error && appointments.length > 0 && (
          <ul className="space-y-3">
            {appointments.map(appt => (
              <li key={appt.id} className="p-3 bg-white rounded shadow flex justify-between items-start">
                <div>
                  <div className="font-semibold">{appt.title || `RDV #${appt.id}`}</div>
                  <div className="text-sm text-gray-600">{appt.start_time || appt.date || ''}</div>
                  <div className="text-sm text-gray-700">Patient: {appt.patientName || appt.patientEmail || appt.patientId}</div>
                  {appt.notes && <div className="mt-1 text-sm text-gray-600">Notes: {appt.notes}</div>}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { /* TODO: action d'acceptation */ }}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => { /* TODO: marquer comme fait */ }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Marquer fait
                  </button>
                  <Link to={`/appointments/${appt.id}`} className="px-3 py-1 border rounded text-center">Détails</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl mb-2">Actions</h2>
        <div className="flex gap-2">
          <Link to="/create-appointment" className="px-3 py-2 bg-blue-600 text-white rounded">Créer un RDV</Link>
          <Link to="/doctors" className="px-3 py-2 border rounded">Voir médecin·s</Link>
        </div>
      </section>
    </div>
  );
}
