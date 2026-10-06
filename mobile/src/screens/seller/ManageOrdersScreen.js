import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';

export default function ManageOrdersScreen() {
  const sellerOrders = [
    {
      id: 'ord-101',
      customer: 'Rahul Sharma (BITS Pilani)',
      item: 'Arduino UNO R3 + ESP32 Kit',
      amount: 1948,
      status: 'Processing',
    },
    {
      id: 'ord-102',
      customer: 'Priya Verma (IIT Bombay)',
      item: 'HC-SR04 Ultrasonic Sensor (x5)',
      amount: 445,
      status: 'Shipped',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Manage Seller Orders" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sellerOrders.map((ord) => (
          <View key={ord.id} style={styles.orderCard}>
            <View style={styles.headerRow}>
              <Text style={styles.ordId}>{ord.id}</Text>
              <Text style={styles.statusBadge}>{ord.status}</Text>
            </View>
            <Text style={styles.customerName}>{ord.customer}</Text>
            <Text style={styles.itemTitle}>{ord.item}</Text>
            <Text style={styles.amount}>Revenue: ₹{ord.amount}</Text>

            <TouchableOpacity style={styles.dispatchBtn}>
              <Text style={styles.dispatchBtnText}>Mark Dispatched & Print Shipping Label</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
  orderCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ordId: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  statusBadge: { backgroundColor: colors.primary + '20', color: colors.primary, fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  customerName: { color: colors.text, fontWeight: '700', fontSize: 14 },
  itemTitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  amount: { color: colors.success, fontWeight: '800', fontSize: 14, marginTop: 8 },
  dispatchBtn: { marginTop: 12, backgroundColor: colors.surfaceVariant, padding: 10, borderRadius: 8, alignItems: 'center' },
  dispatchBtnText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
});
