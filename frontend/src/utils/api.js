import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if(token){
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
})

export default api
