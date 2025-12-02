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
    async function load() {
      setError('');
      setLoading(true);
      try {
        // Appel à l'API
        const res = await api.get('/api/appointments');
        const list = Array.isArray(res.data) ? res.data : [];

        // Filtrage : ne conserver que les RDV du patient connecté
        const userId = getUserId();
        if (!userId) {
          // si pas d'id dans token, afficher message
          setAppointments([]);
          setError("Utilisateur non identifié — reconnectez-vous.");
        } else {
          const filtered = list.filter(a => String(a.patientId) === String(userId));
          setAppointments(filtered);
        }
      } catch (err) {
        console.error('Erreur chargement RDV patient', err);
        setError('Impossible de récupérer les rendez-vous. Réessayez plus tard.');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    // option : rafraîchir toutes les X secondes -> setInterval
  }, []);

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
          <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">Déconnexion</button>
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
                  <div className="text-sm text-gray-600">{appt.start_time || appt.date || ''}</div>
                  <div className="text-sm text-gray-700">Médecin: {appt.doctorName || appt.doctorEmail || appt.doctorId}</div>
                </div>
                <div>
                  <Link to="/appointments" className="px-3 py-1 bg-blue-600 text-white rounded">Détails</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl mb-2">Actions</h2>
        <div className="flex gap-2">
          <Link to="/doctors" className="px-3 py-2 bg-green-600 text-white rounded">Trouver un médecin</Link>
          <Link to="/create-appointment" className="px-3 py-2 border rounded">Prendre RDV</Link>
        </div>
      </section>
    </div>
  );
}
