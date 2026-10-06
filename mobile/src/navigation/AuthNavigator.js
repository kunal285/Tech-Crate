import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterSellerScreen from '../screens/auth/RegisterSellerScreen';

const Stack = createStackNavigator();

const AuthNavigator = ({initialRouteName = 'Login'}) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
      cardStyle: {backgroundColor: '#FFFFFF'},
    }}
    initialRouteName={initialRouteName}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="RegisterSeller" component={RegisterSellerScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
