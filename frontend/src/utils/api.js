// frontend/src/utils/api.js
import axios from 'axios';
import { getRole, getUserId } from './auth';


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// helper token storage (localStorage)
function getAccessToken() {
  return localStorage.getItem('accessToken');
}
function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}
function setAccessToken(token) {
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}
function setRefreshToken(token) {
  if (token) localStorage.setItem('refreshToken', token);
  else localStorage.removeItem('refreshToken');
}

// flag & queue to prevent multiple parallel refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request interceptor: attach access token
api.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => Promise.reject(err)
);

// Response interceptor: try refresh on 401
api.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config;
    if (!originalRequest) return Promise.reject(err);

    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        })
        .catch(e => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // no refresh token -> redirect to login
        isRefreshing = false;
        return Promise.reject(err);
      }

      return new Promise(function (resolve, reject) {
        axios.post(API_BASE + '/api/auth/refresh', { refreshToken })
          .then(({ data }) => {
            const newAccess = data.accessToken;
            const newRefresh = data.refreshToken || refreshToken;
            setAccessToken(newAccess);
            setRefreshToken(newRefresh);
            api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccess;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccess;
            processQueue(null, newAccess);
            resolve(axios(originalRequest));
          })
          .catch((error) => {
            processQueue(error, null);
            // optional: clear tokens & force logout
            setAccessToken(null);
            setRefreshToken(null);
            reject(error);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(err);
  }
);

export default api;
