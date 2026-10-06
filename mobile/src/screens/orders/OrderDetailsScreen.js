import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';

export default function OrderDetailsScreen({ route }) {
  const { order } = route.params || {};

  const timeline = [
    { title: 'Order Placed', time: 'Confirmed', done: true },
    { title: 'Packed & Dispatched', time: 'Completed', done: true },
    { title: 'In Transit / Shipped', time: 'Express Courier', done: order?.orderStatus === 'Shipped' || order?.orderStatus === 'Delivered' },
    { title: 'Out For Delivery', time: 'Today', done: order?.orderStatus === 'Delivered' },
    { title: 'Delivered', time: 'Pending', done: order?.orderStatus === 'Delivered' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Track Shipment" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tracking Header */}
        <View style={styles.card}>
          <Text style={styles.trackingNumber}>Tracking #: {order?.trackingNumber || 'PK8472910'}</Text>
          <Text style={styles.statusTitle}>Current Status: {order?.orderStatus || 'Shipped'}</Text>
        </View>

        {/* Timeline Tracker */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Timeline</Text>
          {timeline.map((step, idx) => (
            <View key={idx} style={styles.timelineRow}>
              <View style={[styles.timelineDot, step.done && styles.timelineDotDone]} />
              <View style={styles.timelineInfo}>
                <Text style={[styles.timelineTitle, step.done && styles.timelineTitleDone]}>{step.title}</Text>
                <Text style={styles.timelineTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>{order?.shippingAddress?.fullName || 'Rahul Sharma'}</Text>
          <Text style={styles.addressText}>{order?.shippingAddress?.street || 'Hostel 12, BITS Pilani'}</Text>
          <Text style={styles.addressText}>{order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  trackingNumber: { fontSize: 16, fontWeight: '800', color: colors.primary },
  statusTitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  timelineDot: { width: 14, h: 14, height: 14, borderRadius: 7, backgroundColor: colors.border, marginRight: 12 },
  timelineDotDone: { backgroundColor: colors.primary },
  timelineInfo: { flex: 1 },
  timelineTitle: { color: colors.textTertiary, fontSize: 13, fontWeight: '600' },
  timelineTitleDone: { color: colors.text, fontWeight: '800' },
  timelineTime: { color: colors.textTertiary, fontSize: 11 },
  addressText: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
