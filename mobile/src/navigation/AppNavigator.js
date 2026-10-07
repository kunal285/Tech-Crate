import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Linking } from 'react-native';

import useAuthStore from '../store/authStore';
import { USER_ROLES } from '../constants';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import SellerNavigator from './SellerNavigator';
import AdminNavigator from './AdminNavigator';
import SplashScreen from '../screens/auth/SplashScreen';

/**
 * React Navigation Deep Linking Configuration
 * Handles schemes: TechCrate://, myapp://, myapp-dev://
 */
const linking = {
  prefixes: [
    'TechCrate://',
    'myapp://',
    'myapp-dev://',
    'https://techcrate.com',
    'https://autoupigateway.com',
  ],
  config: {
    screens: {
      Cart: {
        screens: {
          PaymentResult: {
            path: 'payment/:status',
            parse: {
              status: (status) => status,
            },
          },
          PaymentProcessing: 'payment/processing',
          Checkout: 'checkout',
        },
      },
      Profile: {
        screens: {
          OrderDetail: 'orders/:orderId',
        },
      },
    },
  },
};

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const user = useAuthStore((state) => state.user);
  const initialize = useAuthStore((state) => state.initialize);
  const [splashFinished, setSplashFinished] = useState(false);

  const lastHandledUrl = useRef(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      import('../services/notificationService')
        .then((module) => module.default.requestPermissions())
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // Handle deep link URL deduplication & event logging
  useEffect(() => {
    const handleUrlEvent = ({ url }) => {
      if (url && url !== lastHandledUrl.current) {
        lastHandledUrl.current = url;
        console.log('[Deep Link Event Received]', url);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        lastHandledUrl.current = url;
        console.log('[Initial Deep Link URL Launch]', url);
      }
    });

    const subscription = Linking.addEventListener('url', handleUrlEvent);
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

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
    <NavigationContainer linking={linking}>
      {getNavigator()}
    </NavigationContainer>
  );
};

export default AppNavigator;
