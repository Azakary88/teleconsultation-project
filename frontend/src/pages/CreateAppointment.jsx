import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRole } from '../utils/auth';

export default function CreateAppointment() {
  const loc = useLocation();
  const doctor = loc.state?.doctor || null;
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!doctor) {
      // si on vient sans doctor, rediriger vers la liste
      // navigate('/doctors'); // facultatif
    }
  }, [doctor]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Récupération profil (optionnelle — utile pour afficher infos)
      let profileRes = null;
      try { profileRes = await api.get('/api/profile'); } catch(e){ profileRes = null; }

      // Si tu veux explicitement utiliser patientId (optionnel) :
      const patientIdFromProfile = profileRes?.data?.patientId || null;

      // Si l'utilisateur est un PATIENT connecté, NE PAS ENVOYER patientId — laisse le backend déterminer
      const role = getRole();
      const payload = {
        doctorId: doctor?.id,
        startTime: new Date(startTime).toISOString()
      };

      // Only include patientId if role is not PATIENT and profile provides it
      if (role && role.toUpperCase() !== 'PATIENT' && patientIdFromProfile) {
        payload.patientId = patientIdFromProfile;
      }

      console.log('[CreateAppointment] payload:', payload);

      const res = await api.post('/api/appointments', payload);
      console.log('[CreateAppointment] response:', res.data);
      alert('RDV créé avec succès');
      navigate('/appointments');

    } catch (err) {
      console.error('CreateAppointment error', err);
      const srv = err?.response?.data;
      if (srv) {
        const msg = srv.error || srv.message || JSON.stringify(srv);
        alert('Erreur création RDV : ' + msg);
      } else {
        alert('Erreur création RDV : ' + (err.message || String(err)));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='max-w-md mx-auto bg-white p-4 rounded shadow'>
      <h2 className='text-lg mb-2'>Prendre RDV</h2>
      <p>Avec: {doctor?.firstname || doctor?.name || doctor?.email || '—'}</p>

      <form onSubmit={submit} className='flex flex-col gap-2'>
        <input
          placeholder='Start time (ex: 2025-12-20T10:00:00Z)'
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          className='border p-2 rounded'
          required
        />
        <button type='submit' className='bg-blue-600 text-white px-4 py-2 rounded' disabled={loading}>
          {loading ? 'Envoi…' : 'Valider'}
        </button>
      </form>
    </div>
  );
}
