import AsyncStorage from '@react-native-async-storage/async-storage';
import {apiPost, apiGet, apiPut} from './api';
import {STORAGE_KEYS} from '../constants';
import firebaseAuthService from './firebaseAuthService';

const authService = {
  // Firebase Auth - Exchange Verified ID Token for Backend Session
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

  // Firebase Auth - Register with Verified ID Token
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

  // Register user with Email/Password + Profile
  register: async userData => {
    let fbUid = null;
    let fbIdToken = null;

    if (userData.email && userData.password && firebaseAuthService.isFirebaseConfigured()) {
      try {
        const fbResult = await firebaseAuthService.createUserWithEmailAndPassword(
          userData.email,
          userData.password,
          userData.name
        );

        if (fbResult.success) {
          fbUid = fbResult.uid;
          fbIdToken = fbResult.idToken;
        } else if (fbResult.rawError?.includes('EMAIL_EXISTS')) {
          return fbResult;
        } else {
          console.warn('[Firebase Auth Register Bypass]', fbResult.message);
        }
      } catch (fbErr) {
        console.warn('[Firebase Auth Register Error]', fbErr.message);
      }
    }

    const payload = {
      ...userData,
      firebaseUid: fbUid,
      firebaseIdToken: fbIdToken,
    };

    const result = await apiPost('/auth/register', payload);
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

  // Login user with Email/Password
  login: async credentials => {
    const rawUsername = String(credentials.username || credentials.email || '').trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawUsername);

    let fbUid = null;
    let fbIdToken = null;

    if (isEmail && credentials.password && firebaseAuthService.isFirebaseConfigured()) {
      try {
        const fbResult = await firebaseAuthService.signInWithEmailAndPassword(
          rawUsername,
          credentials.password
        );

        if (fbResult.success) {
          fbUid = fbResult.uid;
          fbIdToken = fbResult.idToken;
        } else {
          console.warn('[Firebase Auth Login Bypass]', fbResult.message);
        }
      } catch (fbErr) {
        console.warn('[Firebase Auth Login Error]', fbErr.message);
      }
    }

    const payload = {
      ...credentials,
      firebaseUid: fbUid,
      firebaseIdToken: fbIdToken,
    };

    const result = await apiPost('/auth/login', payload);
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

  // Social Auth (Google / Facebook)
  socialAuth: async socialPayload => {
    const result = await apiPost('/auth/social-auth', socialPayload);
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
      if (refreshToken) {
        await apiPost('/auth/logout', {refreshToken});
      }
    } catch {
      // Silently proceed with local cleanup
    }
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.DEVICE_TOKEN,
    ]);
  },

  // Refresh Session Token explicitly
  refreshToken: async () => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!storedRefreshToken) return { success: false, message: 'No refresh token' };
      const result = await apiPost('/auth/refresh-token', { refreshToken: storedRefreshToken });
      if (result.success && result.data?.token) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, String(result.data.token));
        if (result.data.refreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, String(result.data.refreshToken));
        }
      }
      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
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
