import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, API_TIMEOUT, STORAGE_KEYS} from '../constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle 401 unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Clear stored auth data and redirect to login
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
      } catch (storageError) {
        console.error('Error clearing auth data:', storageError);
      }
    }

    return Promise.reject(error);
  },
);

// Generic request handler with error normalization
const handleRequest = async requestPromise => {
  try {
    const response = await requestPromise;
    return {success: true, data: response.data};
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    const status = error.response?.status;
    return {success: false, message, status};
  }
};

// API methods
export const apiGet = (url, params = {}) =>
  handleRequest(api.get(url, {params}));

export const apiPost = (url, data = {}) =>
  handleRequest(api.post(url, data));

export const apiPut = (url, data = {}) =>
  handleRequest(api.put(url, data));

export const apiPatch = (url, data = {}) =>
  handleRequest(api.patch(url, data));

export const apiDelete = url => handleRequest(api.delete(url));

export const apiUpload = (url, formData, onProgress) => {
  return handleRequest(
    api.post(url, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
      onUploadProgress: progressEvent => {
        if (onProgress) {
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
