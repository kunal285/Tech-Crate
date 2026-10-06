import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MapPin, CreditCard, Zap, Check, Banknote } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useCartStore } from '../../store/cartStore';
import { orderService } from '../../services/orderService';

export default function CheckoutScreen({ route, navigation }) {
  const { grandTotal } = route.params || { grandTotal: 0 };
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    street: 'Hostel 12, BITS Pilani Campus',
    city: 'Pilani',
    state: 'Rajasthan',
    pincode: '333031',
  });

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.street || !address.pincode) {
      Alert.alert('Missing Details', 'Please fill in full delivery address');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        orderItems: items.map((i) => ({
          title: i.title,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
          product: i.productId,
          projectKit: i.projectKitId,
          itemType: i.itemType || 'product',
        })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: grandTotal,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: grandTotal,
      };

      const res = await orderService.createOrder(orderData);
      await clearCart();
      Alert.alert('Order Confirmed!', `Tracking ID: ${res.trackingNumber || 'PK' + Math.floor(Math.random() * 1000000)}`, [
        {
          text: 'View My Orders',
          onPress: () => navigation.navigate('OrderHistory'),
        },
      ]);
    } catch (error) {
      Alert.alert('Order Failed', error.message || 'Error processing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Checkout" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Shipping Address Section */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MapPin size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitleText}>Delivery Address</Text>
          </View>
          <Input
            label="Full Name"
            value={address.fullName}
            onChangeText={(t) => setAddress({ ...address, fullName: t })}
          />
          <Input
            label="Phone Number"
            keyboardType="phone-pad"
            value={address.phone}
            onChangeText={(t) => setAddress({ ...address, phone: t })}
          />
          <Input
            label="Street / Campus Hostel Address"
            value={address.street}
            onChangeText={(t) => setAddress({ ...address, street: t })}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="City"
                value={address.city}
                onChangeText={(t) => setAddress({ ...address, city: t })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Pincode"
                keyboardType="numeric"
                value={address.pincode}
                onChangeText={(t) => setAddress({ ...address, pincode: t })}
              />
            </View>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <CreditCard size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitleText}>Payment Method</Text>
          </View>
          {['UPI', 'Card', 'NetBanking', 'COD'].map((method) => (
            <TouchableOpacity
              key={method}
              style={[styles.paymentOption, paymentMethod === method && styles.paymentOptionSelected]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={[styles.paymentText, paymentMethod === method && styles.paymentTextSelected]}>
                {method === 'UPI' ? 'Google Pay / PhonePe / BHIM UPI' : method === 'COD' ? 'Cash on Delivery (COD)' : method}
              </Text>
              {paymentMethod === method && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={loading ? 'Processing Order...' : `Pay & Confirm Order (₹${grandTotal})`}
          loading={loading}
          onPress={handlePlaceOrder}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  cardTitleText: { fontSize: 16, fontWeight: '800', color: colors.text },
  paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 8 },
  paymentOptionSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceVariant },
  paymentText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  paymentTextSelected: { color: colors.primary, fontWeight: '800' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
});
