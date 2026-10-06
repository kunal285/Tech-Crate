import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiPost, apiGet, apiPut} from './api';
import {STORAGE_KEYS} from '../constants';

const authService = {
  // Register new user
  register: async userData => {
    const result = await apiPost('/auth/register', userData);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(result.data.token, userObj);
    }
    return result;
  },

  // Login user
  login: async credentials => {
    const result = await apiPost('/auth/login', credentials);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(result.data.token, userObj);
    }
    return result;
  },

  // Google Sign-In
  googleSignIn: async idToken => {
    const result = await apiPost('/auth/google', {idToken});
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(result.data.token, userObj);
    }
    return result;
  },

  // Logout
  logout: async () => {
    try {
      await apiPost('/auth/logout');
    } catch {
      // Silently fail on API error
    }
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  },

  // Forgot password
  forgotPassword: async email => {
    return await apiPost('/auth/forgot-password', {email});
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await apiPost('/auth/reset-password', {token, password});
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await apiPost('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Get current user profile
  getProfile: async () => {
    return await apiGet('/auth/me');
  },

  // Update profile
  updateProfile: async profileData => {
    return await apiPut('/auth/profile', profileData);
  },

  // Register as seller
  registerSeller: async sellerData => {
    return await apiPost('/auth/register-seller', sellerData);
  },

  // Persist auth session safely
  persistSession: async (token, user) => {
    if (!token) return;
    const safeUser = user || {};
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, String(token));
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(safeUser));
  },

  // Get stored session
  getStoredSession: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (token && userData) {
        return {token, user: JSON.parse(userData)};
      }
      return null;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const session = await authService.getStoredSession();
    return !!session;
  },
};

export { authService };
export default authService;
