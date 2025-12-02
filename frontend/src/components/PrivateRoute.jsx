// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn, getRole } from '../utils/auth';

// <PrivateRoute role="DOCTOR"> ... </PrivateRoute>
export default function PrivateRoute({ children, role }) {
  // si pas connecté, redirige vers login
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  // si rôle requis et différent du rôle actuel => afficher accès refusé
  if (role) {
    const current = (getRole() || '').toUpperCase();
    if (current !== String(role).toUpperCase()) {
      return (
        <div style={{ padding: 20 }}>
          <h3>Accès refusé</h3>
          <p>Rôle requis : {role}</p>
        </div>
      );
    }
  }

  return children;
}
