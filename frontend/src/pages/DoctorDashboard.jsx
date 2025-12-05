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
    load();
  }, []);

  async function load() {
    setError('');
    setLoading(true);

    try {
      const res = await api.get('/api/appointments');
      const list = Array.isArray(res.data) ? res.data : [];

      const doctorId = getUserId();
      if (!doctorId) {
        setAppointments([]);
        setError('Utilisateur non identifié — reconnectez-vous.');
      } else {
        const filtered = list.filter(a => String(a.doctorId) === String(doctorId));
        setAppointments(filtered);
      }
    } catch (err) {
      console.error('Erreur chargement RDV médecin', err);
      setError("Impossible de récupérer les rendez-vous.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/api/appointments/${id}`, { status: newStatus });
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error('Erreur mise à jour statut', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  }

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
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">
            Déconnexion
          </button>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl mb-2">Rendez-vous</h2>

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
              <li
                key={appt.id}
                className="p-3 bg-white rounded shadow flex justify-between items-start"
              >
                <div>
                  <div className="font-semibold">{appt.title || `RDV #${appt.id}`}</div>
                  <div className="text-sm text-gray-600">{appt.start_time}</div>
                  <div className="text-sm text-gray-700">
                    Patient: {appt.patientEmail || appt.patientName || appt.patientId}
                  </div>
                  <div className="text-sm text-gray-500">Statut : {appt.status}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => updateStatus(appt.id, 'confirmed')}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Accepter
                  </button>

                  <button
                    onClick={() => updateStatus(appt.id, 'done')}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Terminer
                  </button>

                  <button
                    onClick={() =>
                      confirm('Confirmer annulation ?') &&
                      updateStatus(appt.id, 'cancelled')
                    }
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Annuler
                  </button>

                  <Link
                    to={`/appointments/${appt.id}`}
                    className="px-3 py-1 border rounded text-center"
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
          <Link to="/doctors" className="px-3 py-2 border rounded">
            Voir médecins
          </Link>
        </div>
      </section>
    </div>
  );
}
