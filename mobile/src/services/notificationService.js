import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { apiPost } from './api';

const notificationService = {
  /**
   * Request push notification permissions on iOS and Android 13+
   */
  requestPermissions: async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Enable Order Tracking Notifications',
            message: 'Get real-time updates when your hardware components and project kits ship.',
            buttonPositive: 'Allow',
            buttonNegative: 'Later',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn('[NotificationService] Error requesting notification permissions:', err);
      return false;
    }
  },

  /**
   * Get cached or register new device token with backend
   */
  getDeviceToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
    } catch {
      return null;
    }
  },

  /**
   * Register device token with backend server
   */
  registerDeviceToken: async (token) => {
    if (!token) return { success: false };
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, String(token));
      // Sync with backend notification service
      return await apiPost('/notifications/register-device', { deviceToken: token, platform: Platform.OS });
    } catch (err) {
      console.warn('[NotificationService] Failed to sync device token:', err?.message);
      return { success: false };
    }
  },

  /**
   * Clean up device token on logout
   */
  unregisterDeviceToken: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
      if (token) {
        await apiPost('/notifications/unregister-device', { deviceToken: token });
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_TOKEN);
    } catch {}
  },

  /**
   * Handle deep-linking navigation when user taps a push notification
   */
  handleNotificationNavigation: (navigation, data = {}) => {
    if (!navigation || !data) return;

    const { type, productId, orderId, category } = data;

    switch (type) {
      case 'product':
        if (productId) {
          navigation.navigate('ProductDetail', { productId });
        }
        break;
      case 'order':
        if (orderId) {
          navigation.navigate('OrderDetail', { orderId });
        } else {
          navigation.navigate('Orders');
        }
        break;
      case 'category':
        if (category) {
          navigation.navigate('Category', { categoryName: category });
        }
        break;
      default:
        navigation.navigate('Notifications');
        break;
    }
  },
};

export default notificationService;
