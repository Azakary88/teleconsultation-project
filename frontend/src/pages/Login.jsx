// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { setTokens, getRole } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken } = res.data;

      if (!accessToken) {
        throw new Error('Réponse invalide du serveur (pas de accessToken).');
      }

      // Stocke les tokens (fonction venant de src/utils/auth.js)
      setTokens({ accessToken, refreshToken });

      // Récupère le rôle depuis le token (getRole lit/parse localStorage)
      const role = (getRole() || '').toUpperCase();

      // Redirections selon rôle (modifie les routes si tu en as d'autres)
      if (role === 'DOCTOR' || role === 'MEDECIN') {
        navigate('/doctor-dashboard', { replace: true });
      } else if (role === 'PATIENT') {
        navigate('/patient-dashboard', { replace: true });
      } else {
        // fallback : renvoyer vers l'accueil
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Login error', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Erreur inconnue';
      setErrorMsg(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Connexion</h2>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{errorMsg}</div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </div>
      </form>

      <div className="mt-4 text-sm">
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-blue-600 underline"
        >
          Pas de compte ? Inscription
        </button>
      </div>
    </div>
  );
}
