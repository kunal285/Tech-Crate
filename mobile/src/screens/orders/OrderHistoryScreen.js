import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Package } from 'lucide-react-native';
import Header from '../../components/common/Header';
import { orderService } from '../../services/orderService';

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="My Orders & Shipments" onBack={() => navigation.goBack()} />
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {orders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetails', { orderId: order._id, order })}
            >
              <View style={styles.cardHeader}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Package size={16} color={colors.primary} />
                    <Text style={styles.trackingText}>{order.trackingNumber || 'PK8472910'}</Text>
                  </View>
                  <Text style={styles.dateText}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={styles.statusText}>{order.orderStatus}</Text>
                </View>
              </View>

              <View style={styles.itemsPreview}>
                {order.orderItems?.map((item, idx) => (
                  <Text key={idx} style={styles.itemTitle} numberOfLines={1}>
                    • {item.title} (x{item.quantity})
                  </Text>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Order Total:</Text>
                <Text style={styles.totalVal}>₹{order.totalPrice}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
  orderCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10, marginBottom: 10 },
  trackingText: { fontSize: 14, fontWeight: '800', color: colors.text },
  dateText: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  itemsPreview: { marginVertical: 4 },
  itemTitle: { fontSize: 13, color: colors.textSecondary, marginVertical: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 10 },
  totalLabel: { fontSize: 13, color: colors.textSecondary },
  totalVal: { fontSize: 16, fontWeight: '900', color: colors.primary },
});
