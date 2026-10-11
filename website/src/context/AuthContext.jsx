'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('techcrate_token');
        const storedUser = localStorage.getItem('techcrate_user');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          // Verify token validity with backend
          try {
            const res = await api.get('/auth/me');
            if (res.data) {
              const freshUser = res.data.user || res.data;
              setUser(freshUser);
              localStorage.setItem('techcrate_user', JSON.stringify(freshUser));
            }
          } catch (err) {
            if (err.response?.status === 401) {
              logout();
            }
          }
        }
      } catch (err) {
        console.error('[Auth Init Error]', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', {
        username: identifier,
        password,
      });

      if (res.data?.token) {
        const authToken = res.data.token;
        const authUser = res.data.user || res.data;

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('techcrate_token', authToken);
        localStorage.setItem('techcrate_user', JSON.stringify(authUser));

        return { success: true, user: authUser };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);

      if (res.data?.token) {
        const authToken = res.data.token;
        const authUser = res.data.user || res.data;

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('techcrate_token', authToken);
        localStorage.setItem('techcrate_user', JSON.stringify(authUser));

        return { success: true, user: authUser };
      }
      return { success: true, message: res.data?.message || 'Registration successful!' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const sendOtp = async (phoneNumber) => {
    try {
      const res = await api.post('/auth/send-otp', { phoneNumber });
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send OTP.',
      };
    }
  };

  const verifyOtp = async (phoneNumber, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { phoneNumber, otp });
      if (res.data?.token) {
        const authToken = res.data.token;
        const authUser = res.data.user || res.data;

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('techcrate_token', authToken);
        localStorage.setItem('techcrate_user', JSON.stringify(authUser));

        return { success: true, user: authUser };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'OTP verification failed.',
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data) {
        const updatedUser = res.data.user || res.data;
        setUser(updatedUser);
        localStorage.setItem('techcrate_user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'Unable to update profile' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Profile update failed.',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('techcrate_token');
    localStorage.removeItem('techcrate_user');
  };

  const loginWithGoogle = async (googlePayload) => {
    try {
      const res = await api.post('/auth/social-auth', {
        provider: 'google',
        ...googlePayload,
      });

      if (res.data?.token) {
        const authToken = res.data.token;
        const authUser = res.data.user || res.data;

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem('techcrate_token', authToken);
        localStorage.setItem('techcrate_user', JSON.stringify(authUser));

        return { success: true, user: authUser };
      }
      return { success: false, message: 'Invalid response from Google authentication server' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Google authentication failed. Please try again.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        loginWithPassword: login,
        loginWithGoogle,
        socialLogin: loginWithGoogle,
        register,
        sendOtp,
        verifyOtp,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
