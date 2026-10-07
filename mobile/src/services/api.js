import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '../constants';

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh queue to handle concurrent 401s without race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach JWT token
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error reading auth token:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor - handle 401s and token refresh automatically
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Do not attempt token refresh for login, register, or refresh-token endpoints
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/firebase-login');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await AsyncStorage.getItem(
          STORAGE_KEYS.REFRESH_TOKEN
        );

        if (!storedRefreshToken) {
          throw new Error('No refresh token available');
        }

        // Call backend token refresh endpoint directly via raw axios to avoid interceptor loop
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { timeout: 15000 }
        );

        const newAccessToken =
          refreshResponse.data?.token || refreshResponse.data?.accessToken;
        const newRefreshToken =
          refreshResponse.data?.refreshToken || storedRefreshToken;

        if (!newAccessToken) {
          throw new Error('Invalid refresh response from server');
        }

        // Persist rotated tokens
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, String(newAccessToken));
        if (newRefreshToken) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            String(newRefreshToken)
          );
        }

        // Update default header and replay original request
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Wipe local auth on permanent session invalidation
        try {
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
        } catch {}
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Generic request handler with comprehensive error normalization
const handleRequest = async requestPromise => {
  try {
    const response = await requestPromise;
    return { success: true, data: response.data };
  } catch (error) {
    let message = 'Something went wrong. Please try again.';
    const status = error.response?.status;

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Request timed out. Please check your connection and try again.';
    } else if (
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK' ||
      !error.response
    ) {
      message = 'Network connection error. Please verify your internet connection.';
    } else if (status === 401) {
      message =
        error.response?.data?.message ||
        'Session expired. Please sign in to your account.';
    } else if (status === 403) {
      message =
        error.response?.data?.message ||
        'Access denied. You do not have permission for this action.';
    } else if (status === 404) {
      message = error.response?.data?.message || 'Requested item not found.';
    } else if (status === 429) {
      message =
        error.response?.data?.message ||
        'Too many requests. Please wait a moment before trying again.';
    } else if (status >= 500) {
      message =
        error.response?.data?.message ||
        'Server encountered an issue. Please try again later.';
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return { success: false, message, status, rawError: error };
  }
};

// API methods
export const apiGet = (url, params = {}) =>
  handleRequest(api.get(url, { params }));

export const apiPost = (url, data = {}) =>
  handleRequest(api.post(url, data));

export const apiPut = (url, data = {}) =>
  handleRequest(api.put(url, data));

export const apiPatch = (url, data = {}) =>
  handleRequest(api.patch(url, data));

export const apiDelete = (url, data = {}) =>
  handleRequest(api.delete(url, { data }));

export const apiUpload = (url, formData, onProgress) => {
  return handleRequest(
    api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    }),
  );
};

export default api;
