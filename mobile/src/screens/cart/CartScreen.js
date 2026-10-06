import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import SafeImage from '../../components/common/SafeImage';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen({ navigation }) {
  const items = useCartStore((state) => state.items || []);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotals = useCartStore((state) => state.getTotals);

  const totals = typeof getTotals === 'function' ? getTotals() : { subtotal: 0, tax: 0, deliveryFee: 0, total: 0 };
  const totalAmount = totals.subtotal || 0;
  const taxAmount = totals.tax || 0;
  const shippingCost = totals.deliveryFee || 0;
  const grandTotal = totals.total || 0;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Shopping Cart" />
        <View style={styles.emptyContainer}>
          <ShoppingCart size={64} color={colors.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Explore components & engineering project kits to build!</Text>
          <Button
            title="Explore Products"
            onPress={() => navigation.navigate('HomeTab')}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`Cart (${items.length} Items)`} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.cartCard}>
            <SafeImage
              source={item.images || item.image || item.imageUrl}
              style={styles.itemImage}
              resizeMode="contain"
              placeholderIcon={Package}
              placeholderText="Item"
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>

              <View style={styles.qtyRow}>
                <View style={styles.qtyControls}>
                  <TouchableOpacity onPress={() => updateQuantity(idx, item.quantity - 1)} style={styles.qtyBtn}>
                    <Minus size={14} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(idx, item.quantity + 1)} style={styles.qtyBtn}>
                    <Plus size={14} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => removeItem(item._id || idx)} style={styles.removeBtn}>
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Bill Breakdown */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated GST (5%)</Text>
            <Text style={styles.summaryValue}>₹{taxAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charges</Text>
            <Text style={styles.summaryValue}>
              {shippingCost === 0 ? <Text style={{ color: colors.success }}>FREE</Text> : `₹${shippingCost}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Bottom Button */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotalLabel}>Total Payable</Text>
          <Text style={styles.checkoutTotalVal}>₹{grandTotal}</Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout', { grandTotal })}
          style={{ paddingHorizontal: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  cartCard: { flexDirection: 'row', backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.surfaceVariant },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  itemPrice: { fontSize: 16, fontWeight: '800', color: colors.primary },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  qtyBtnText: { color: colors.text, fontWeight: '700' },
  qtyVal: { paddingHorizontal: 8, color: colors.text, fontWeight: '700', fontSize: 12 },
  removeBtn: { padding: 4 },
  removeText: { color: colors.error, fontSize: 12, fontWeight: '600' },
  summaryCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginTop: 16 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { color: colors.textSecondary, fontSize: 13 },
  summaryValue: { color: colors.text, fontSize: 13, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 },
  totalLabel: { color: colors.text, fontSize: 15, fontWeight: '800' },
  totalValue: { color: colors.primary, fontSize: 18, fontWeight: '900' },
  checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, padding: 16, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkoutTotalLabel: { color: colors.textSecondary, fontSize: 11 },
  checkoutTotalVal: { color: colors.primary, fontSize: 20, fontWeight: '900' },
});
