import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import {STORAGE_KEYS, USER_ROLES} from '../constants';

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Initialize - restore session
  initialize: async () => {
    set({isLoading: true});
    try {
      const session = await authService.getStoredSession();
      if (session) {
        set({
          user: session.user,
          token: session.token,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({isInitialized: true, isLoading: false});
      }
    } catch (error) {
      set({isInitialized: true, isLoading: false});
    }
  },

  // Send OTP
  sendOtp: async phoneNumber => {
    set({isLoading: true, error: null});
    const result = await authService.sendOtp(phoneNumber);
    set({isLoading: false, error: result.success ? null : result.message});
    return result;
  },

  // Verify OTP
  verifyOtp: async otpData => {
    set({isLoading: true, error: null});
    const result = await authService.verifyOtp(otpData);
    if (result.success && result.data?.token) {
      const userObj = result.data.user || result.data;
      set({
        user: userObj,
        token: result.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  // Register
  register: async userData => {
    set({isLoading: true, error: null});
    const result = await authService.register(userData);
    if (result.success) {
      set({
        user: result.data.user,
        token: result.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  // Login (Password legacy fallback)
  login: async credentials => {
    set({isLoading: true, error: null});
    const result = await authService.login(credentials);
    if (result.success) {
      set({
        user: result.data.user,
        token: result.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({error: result.message, isLoading: false});
    }
    return result;
  },

  // Logout
  logout: async () => {
    set({isLoading: true});
    await authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  // Update user
  updateUser: updatedUser => {
    set({user: updatedUser});
    if (updatedUser) {
      AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    }
  },

  // Clear error
  clearError: () => set({error: null}),

  // Getters
  isCustomer: () => get().user?.role === USER_ROLES.CUSTOMER,
  isStudent: () => get().user?.role === 'student',
  isSeller: () => get().user?.role === USER_ROLES.SELLER,
  isAdmin: () => get().user?.role === USER_ROLES.ADMIN,
}));

export { useAuthStore };
export default useAuthStore;
