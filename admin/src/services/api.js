import axios from 'axios';

// When running in browser, route via Next.js proxy (/api/proxy)
// which injects the httpOnly admin_token cookie automatically.
const isClient = typeof window !== 'undefined';

const defaultBackend = process.env.NODE_ENV === 'production'
  ? 'https://tech-crate.onrender.com/api'
  : 'http://localhost:5000/api';

const API_BASE_URL = isClient
  ? '/api/proxy'
  : (process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || defaultBackend);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

if (isClient) {
  // Response Interceptor: Handle 401 / 403 Session Expiration
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=1';
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
