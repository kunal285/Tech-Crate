import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Truck } from 'lucide-react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing } from '../../theme';

const OrderTrackingScreen = ({ navigation, route }) => {
  const orderId = route?.params?.orderId || 'PK-1001';

  return (
    <View style={styles.container}>
      <Header title="Track Order" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.orderId}>Order #{orderId}</Text>
        <View style={styles.statusBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Truck size={20} color={Colors.primary} />
            <Text style={styles.statusText}>Out for Delivery</Text>
          </View>
          <Text style={styles.subText}>Expected delivery: Today by 6:00 PM</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  orderId: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  statusBox: { backgroundColor: Colors.white, padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  statusText: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold, color: Colors.primary },
  subText: { fontSize: Typography.fontSize.sm, color: Colors.textMuted, marginTop: 4 },
});

export default OrderTrackingScreen;
