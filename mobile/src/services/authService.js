import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiPost, apiGet, apiPut} from './api';
import {STORAGE_KEYS} from '../constants';

const authService = {
  // Firebase Phone Auth - Exchange Verified ID Token for Backend Session
  firebaseLogin: async authPayload => {
    const result = await apiPost('/auth/firebase-login', authPayload);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(
        result.data.token,
        userObj,
        result.data.refreshToken
      );
    }
    return result;
  },

  // Firebase Phone Auth - Register with Verified ID Token
  firebaseRegister: async registerPayload => {
    const result = await apiPost('/auth/firebase-register', registerPayload);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(
        result.data.token,
        userObj,
        result.data.refreshToken
      );
    }
    return result;
  },

  // Send 6-Digit SMS OTP to Mobile Number (Direct SMS fallback)
  sendOtp: async phoneNumber => {
    return await apiPost('/auth/send-otp', {phoneNumber});
  },

  // Verify 6-Digit OTP & Initialize Session (Direct SMS fallback)
  verifyOtp: async otpData => {
    const result = await apiPost('/auth/verify-otp', otpData);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(
        result.data.token,
        userObj,
        result.data.refreshToken
      );
    }
    return result;
  },

  // Resend 6-Digit OTP
  resendOtp: async phoneNumber => {
    return await apiPost('/auth/resend-otp', {phoneNumber});
  },

  // Register user
  register: async userData => {
    const result = await apiPost('/auth/register', userData);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(
        result.data.token,
        userObj,
        result.data.refreshToken
      );
    }
    return result;
  },

  // Login user (password fallback)
  login: async credentials => {
    const result = await apiPost('/auth/login', credentials);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      await authService.persistSession(
        result.data.token,
        userObj,
        result.data.refreshToken
      );
    }
    return result;
  },

  // Logout & Invalidate Session
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      await apiPost('/auth/logout', {refreshToken});
    } catch {
      // Silently proceed with local cleanup
    }
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
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

  // Get current user profile
  getProfile: async () => {
    return await apiGet('/auth/me');
  },

  // Update profile
  updateProfile: async profileData => {
    return await apiPut('/auth/profile', profileData);
  },

  // Persist auth session safely in AsyncStorage
  persistSession: async (token, user, refreshToken) => {
    if (!token) return;
    const safeUser = user || {};
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, String(token));
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(safeUser));
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, String(refreshToken));
    }
  },

  // Get stored session
  getStoredSession: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (token && userData) {
        return {token, user: JSON.parse(userData), refreshToken};
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
