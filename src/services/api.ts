import axios from 'axios';

// Decide dinamicamente entre PROD e LOCAL
const baseURL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

// Intercepta e insere o token do .env
api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_API_TOKEN;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
