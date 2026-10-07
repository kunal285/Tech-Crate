import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { apiGet, apiPost } from './api';

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
   * Fetch user and broadcast notifications from server with offline cache fallback
   */
  fetchNotifications: async () => {
    try {
      const res = await apiGet('/notifications');
      if (res && res.success && Array.isArray(res.notifications)) {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(res.notifications));
        return {
          success: true,
          notifications: res.notifications,
          unreadCount: res.unreadCount || 0,
        };
      }
      // Fallback if response is raw array
      if (Array.isArray(res)) {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(res));
        return {
          success: true,
          notifications: res,
          unreadCount: res.filter((n) => !n.read).length,
        };
      }
    } catch (err) {
      console.warn('[NotificationService] Failed to fetch remote notifications:', err?.message);
    }

    // Cache fallback
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          success: true,
          notifications: parsed,
          unreadCount: parsed.filter((n) => !n.read).length,
          fromCache: true,
        };
      }
    } catch {}

    return { success: false, notifications: [], unreadCount: 0 };
  },

  /**
   * Mark single or all notifications as read
   */
  markAsRead: async (notificationId = null, all = false) => {
    try {
      await apiPost('/notifications/mark-read', { notificationId, all });
    } catch (err) {
      console.warn('[NotificationService] Error syncing mark-read with server:', err?.message);
    }

    // Update local cache
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (cached) {
        let list = JSON.parse(cached);
        list = list.map((n) => (all || n._id === notificationId || n.id === notificationId ? { ...n, read: true } : n));
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
      }
    } catch {}
  },

  /**
   * Clear single or all notifications
   */
  clearNotifications: async (notificationId = null, all = false) => {
    try {
      await apiPost('/notifications/clear', { notificationId, all });
    } catch (err) {
      console.warn('[NotificationService] Error syncing clear with server:', err?.message);
    }

    // Update local cache
    try {
      if (all) {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      } else {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (cached) {
          let list = JSON.parse(cached);
          list = list.filter((n) => n._id !== notificationId && n.id !== notificationId);
          await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
        }
      }
    } catch {}
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

export const fetchNotifications = notificationService.fetchNotifications;
export const markAsRead = notificationService.markAsRead;
export const clearNotifications = notificationService.clearNotifications;
export const registerDeviceToken = notificationService.registerDeviceToken;
export const unregisterDeviceToken = notificationService.unregisterDeviceToken;
export const requestPermissions = notificationService.requestPermissions;
export const handleNotificationNavigation = notificationService.handleNotificationNavigation;

export { notificationService };
export default notificationService;
