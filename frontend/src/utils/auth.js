// src/utils/auth.js

//
// Enregistre les tokens dans localStorage
//
export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

//
// Supprime les tokens (déconnexion)
//
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

//
// Vérifie si l'utilisateur est connecté
//
export function isLoggedIn() {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // converti seconds → ms
    return Date.now() < exp;
  } catch (e) {
    return false;
  }
}

//
// Retourne le rôle depuis le token (PATIENT / DOCTOR)
//
export function getRole() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (e) {
    return null;
  }
}

//
// Retourne l'ID utilisateur depuis le token
//
export function getUserId() {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || null;
  } catch (e) {
    return null;
  }
}
