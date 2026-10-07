import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_BASE_URL || 'https://tech-crate.onrender.com/api';

const normalizeApiUrl = (url) => {
  if (!url) return 'https://tech-crate.onrender.com/api';
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiUrl(rawUrl);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach Admin Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 / 403 / Network Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear admin session on unauthorized / token expiration
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
