import Constants from 'expo-constants';
import axios from 'axios';
import { getStoredTokens } from './auth';

const API_BASE = Constants.manifest?.extra?.apiBase || 'http://10.0.2.2:3000';

const instance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

instance.interceptors.request.use(async (config) => {
  const tokens = await getStoredTokens();
  if (tokens && tokens.accessToken) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = 'Bearer ' + tokens.accessToken;
  }
  return config;
}, (err) => Promise.reject(err));

export default instance;
