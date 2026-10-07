import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Bell,
  Package,
  Tag,
  Info,
  CheckCheck,
  Trash2,
  Sparkles,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import notificationService from '../../services/notificationService';

const formatRelativeTime = (dateInput) => {
  if (!dateInput) return 'Recently';
  try {
    const diffMs = Date.now() - new Date(dateInput).getTime();
    if (isNaN(diffMs)) return String(dateInput);

    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateInput).toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await notificationService.fetchNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn('[NotificationsScreen] Error loading notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await notificationService.markAsRead(null, true);
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setNotifications([]);
            await notificationService.clearNotifications(null, true);
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (item) => {
    const itemId = item._id || item.id;
    setNotifications((prev) =>
      prev.map((n) => (n._id === itemId || n.id === itemId ? { ...n, read: true } : n))
    );

    await notificationService.markAsRead(itemId, false);

    if (item.data && Object.keys(item.data).length > 0) {
      notificationService.handleNotificationNavigation(navigation, item.data);
      return;
    }

    if (item.type === 'order') {
      navigation.navigate('Orders');
    } else if (item.type === 'promo') {
      navigation.navigate('Home', { screen: 'HomeMain' });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package size={18} color="#0284C7" />;
      case 'promo':
        return <Tag size={18} color="#D97706" />;
      case 'broadcast':
        return <Sparkles size={18} color="#7C3AED" />;
      default:
        return <Info size={18} color="#059669" />;
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.read;
    const timeLabel = formatRelativeTime(item.createdAt || item.date);

    return (
      <TouchableOpacity
        style={[styles.notifCard, isUnread && styles.notifCardUnread]}
        activeOpacity={0.8}
        onPress={() => handleNotificationPress(item)}
        accessibilityLabel={item.title}
      >
        <View style={styles.iconCircle}>{getNotificationIcon(item.type)}</View>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.notifTitle, isUnread && styles.notifTitleBold]}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifBody}>{item.body}</Text>
          <Text style={styles.notifDate}>{timeLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          notifications.length > 0 && (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.headerBtn}
                accessibilityLabel="Mark all as read"
              >
                <CheckCheck size={18} color="#1E3A5F" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearAllNotifications}
                style={styles.headerBtn}
                accessibilityLabel="Clear all notifications"
              >
                <Trash2 size={17} color="#DC2626" />
              </TouchableOpacity>
            </View>
          )
        }
      />

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Fetching live notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item._id || item.id || `notif_${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications(true)}
              colors={['#0284C7']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Bell size={44} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>
                You're all caught up! Order tracking, store updates, and announcements will appear here.
              </Text>
              <Button
                title="Explore Store"
                type="primary"
                onPress={() => navigation.navigate('Home', { screen: 'HomeMain' })}
                style={styles.emptyBtn}
              />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  listContent: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  notifCardUnread: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  notifTitleBold: {
    fontWeight: '800',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0284C7',
    marginLeft: 6,
  },
  notifBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  notifDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
  },
});
