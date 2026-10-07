import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { Colors } from '../../theme';
import { orderService } from '../../services/orderService';

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await (orderService.getMyOrders || orderService.getOrders)();
      const list =
        res?.data?.orders ||
        (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      setOrders(list);
    } catch (error) {
      console.warn('[OrderHistory] Error loading orders:', error?.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusBadge = (status = '') => {
    const s = String(status).toLowerCase();
    if (s === 'delivered') {
      return { bg: '#ECFDF5', text: '#059669', icon: CheckCircle };
    }
    if (s === 'shipped' || s === 'out_for_delivery') {
      return { bg: '#EFF6FF', text: '#2563EB', icon: Truck };
    }
    if (s === 'cancelled' || s === 'returned') {
      return { bg: '#FEF2F2', text: '#DC2626', icon: XCircle };
    }
    return { bg: '#FEF3C7', text: '#D97706', icon: Clock };
  };

  const renderOrderItem = ({ item }) => {
    const badge = getStatusBadge(item.orderStatus);
    const StatusIcon = badge.icon;
    const itemsCount = item.orderItems?.length || 1;
    const formattedDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recent Order';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('OrderDetail', {
            orderId: item._id,
            order: item,
          })
        }
        accessibilityLabel={`Order ${item.trackingNumber || ''}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.trackingRow}>
              <Package size={15} color="#1E3A5F" />
              <Text style={styles.trackingText}>
                {item.trackingNumber || `ORD-${String(item._id).slice(-8).toUpperCase()}`}
              </Text>
            </View>
            <Text style={styles.dateText}>Placed on {formattedDate}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <StatusIcon size={12} color={badge.text} style={styles.badgeIcon} />
            <Text style={[styles.statusText, { color: badge.text }]}>
              {item.orderStatus || 'Processing'}
            </Text>
          </View>
        </View>

        <View style={styles.itemsPreview}>
          {item.orderItems?.slice(0, 2).map((prod, idx) => (
            <Text key={idx} style={styles.itemTitle} numberOfLines={1}>
              • {prod.title || prod.name || 'Component'} (x{prod.quantity || 1})
            </Text>
          ))}
          {itemsCount > 2 && (
            <Text style={styles.moreItemsText}>
              + {itemsCount - 2} more {itemsCount - 2 === 1 ? 'item' : 'items'}
            </Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalVal}>
              ₹{Number(item.totalPrice || item.itemsPrice || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>Track Order</Text>
            <ChevronRight size={15} color="#2563EB" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Orders & Shipments"
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>Fetching your order history...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id || String(Math.random())}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <ShoppingBag size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven't placed any hardware or electronics kit orders yet.
              </Text>
              <Button
                title="Browse Store"
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  itemsPreview: {
    marginVertical: 4,
  },
  itemTitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 2,
  },
  moreItemsText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E3A5F',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
  },
});
