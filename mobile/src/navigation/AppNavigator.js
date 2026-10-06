import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

import useAuthStore from '../store/authStore';
import {USER_ROLES} from '../constants';
import {Colors} from '../theme';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import SellerNavigator from './SellerNavigator';
import AdminNavigator from './AdminNavigator';

const AppNavigator = () => {
  const {isAuthenticated, isInitialized, user, initialize} = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const getNavigator = () => {
    if (!isAuthenticated) return <AuthNavigator />;
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});

export default AppNavigator;
