import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell,
  Package,
  Tag,
  Info,
  CheckCheck,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { Colors, STORAGE_KEYS } from '../../constants';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Order Dispatched 🚚',
      body: 'Your ProjectKart package with Arduino Uno & Sensor Kit has been shipped via Express delivery.',
      type: 'order',
      date: '2 hours ago',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Maker Weekend Deal: 15% OFF 🎉',
      body: 'Use coupon code TECH10 on any IoT or Robotics hardware kit this weekend.',
      type: 'promo',
      date: '1 day ago',
      read: false,
    },
    {
      id: 'notif_3',
      title: 'Welcome to ProjectKart! ⚡',
      body: 'Explore hardware components, verify microcontroller pinouts and build engineering projects.',
      type: 'system',
      date: '3 days ago',
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => setNotifications([]) },
      ]
    );
  };

  const handleNotificationPress = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
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
      default:
        return <Info size={18} color="#059669" />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.notifCardUnread]}
      activeOpacity={0.8}
      onPress={() => handleNotificationPress(item)}
      accessibilityLabel={item.title}
    >
      <View style={styles.iconCircle}>{getNotificationIcon(item.type)}</View>
      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifBody}>{item.body}</Text>
        <Text style={styles.notifDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

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

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Bell size={44} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Order tracking and promotional updates will appear here.
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
