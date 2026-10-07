import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, StyleSheet} from 'react-native';

import useAuthStore from '../store/authStore';
import {USER_ROLES} from '../constants';
import {Colors} from '../theme';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import SellerNavigator from './SellerNavigator';
import AdminNavigator from './AdminNavigator';
import SplashScreen from '../screens/auth/SplashScreen';

const AppNavigator = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isInitialized = useAuthStore(state => state.isInitialized);
  const user = useAuthStore(state => state.user);
  const initialize = useAuthStore(state => state.initialize);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      // Prompt user for notification permissions on Android 13+ / iOS
      import('../services/notificationService')
        .then(module => module.default.requestPermissions())
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Initial cold-boot animated splash screen
  if (!isInitialized || !splashFinished) {
    return <SplashScreen onFinish={() => setSplashFinished(true)} />;
  }

  const getNavigator = () => {
    if (!isAuthenticated) return <AuthNavigator initialRouteName="Login" />;
    switch (user?.role) {
      case USER_ROLES.SELLER:
        return <SellerNavigator />;
      case USER_ROLES.ADMIN:
        return <AdminNavigator />;
      default:
        return <CustomerNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
};

export default AppNavigator;
