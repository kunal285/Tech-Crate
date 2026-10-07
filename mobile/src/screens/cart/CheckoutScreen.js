import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  CreditCard,
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Colors } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { orderService } from '../../services/orderService';

export default function CheckoutScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { grandTotal } = route.params || { grandTotal: 0 };
  const items = useCartStore((state) => state.items || []);
  const clearCart = useCartStore((state) => state.clearCart);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!address.fullName.trim() || address.fullName.trim().length < 2) {
      errs.fullName = 'Full name is required (min 2 letters)';
    }
    const cleanPhone = address.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Valid 10-digit mobile number is required';
    }
    if (!address.street.trim() || address.street.trim().length < 5) {
      errs.street = 'Street address / hostel details required';
    }
    if (!address.city.trim()) {
      errs.city = 'City is required';
    }
    if (!address.pincode.trim() || address.pincode.trim().length < 6) {
      errs.pincode = 'Valid 6-digit postal code required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (loading) return; // Duplicate submission prevention
    if (!validate()) {
      Alert.alert('Delivery Details Required', 'Please fill in all delivery address fields accurately.');
      return;
    }

    if (!items || items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before placing order.');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        orderItems: items.map((i) => ({
          title: i.title || i.name,
          quantity: i.quantity || 1,
          price: i.price,
          image: i.images?.[0] || i.image || i.imageUrl,
          product: i.productId || i._id || i.id,
          projectKit: i.projectKitId,
          itemType: i.itemType || 'product',
        })),
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          state: address.state.trim() || 'India',
          pincode: address.pincode.trim(),
        },
        paymentMethod,
        itemsPrice: grandTotal,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: grandTotal,
      };

      const res = await orderService.createOrder(orderData);

      if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to place order. Please try again.');
      }

      const createdOrder = res.data?.order || res.data || res;
      const trackingNumber =
        createdOrder.trackingNumber ||
        res.trackingNumber ||
        `PK${Math.floor(10000000 + Math.random() * 90000000)}`;

      if (typeof clearCart === 'function') {
        await clearCart();
      }

      navigation.replace('OrderSuccess', {
        order: createdOrder,
        orderId: createdOrder._id,
        trackingNumber,
        grandTotal,
      });
    } catch (error) {
      Alert.alert('Order Placement Error', error.message || 'Error processing your order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout & Payment" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Shipping Address Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={18} color="#0284C7" />
            <Text style={styles.cardTitleText}>Delivery Address</Text>
          </View>

          <Input
            label="Full Name *"
            placeholder="e.g. Rahul Sharma"
            value={address.fullName}
            error={errors.fullName}
            onChangeText={(t) => {
              setAddress({ ...address, fullName: t });
              if (errors.fullName) setErrors({ ...errors, fullName: null });
            }}
          />

          <Input
            label="Mobile Number (for delivery updates) *"
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            maxLength={10}
            value={address.phone}
            error={errors.phone}
            onChangeText={(t) => {
              setAddress({ ...address, phone: t });
              if (errors.phone) setErrors({ ...errors, phone: null });
            }}
          />

          <Input
            label="Street / Campus / Hostel Address *"
            placeholder="e.g. Hostel 12, Room 402, BITS Campus"
            value={address.street}
            error={errors.street}
            onChangeText={(t) => {
              setAddress({ ...address, street: t });
              if (errors.street) setErrors({ ...errors, street: null });
            }}
          />

          <View style={styles.rowInputs}>
            <View style={styles.flexOne}>
              <Input
                label="City *"
                placeholder="e.g. Jaipur"
                value={address.city}
                error={errors.city}
                onChangeText={(t) => {
                  setAddress({ ...address, city: t });
                  if (errors.city) setErrors({ ...errors, city: null });
                }}
              />
            </View>
            <View style={styles.flexOne}>
              <Input
                label="Pincode *"
                placeholder="e.g. 302001"
                keyboardType="numeric"
                maxLength={6}
                value={address.pincode}
                error={errors.pincode}
                onChangeText={(t) => {
                  setAddress({ ...address, pincode: t });
                  if (errors.pincode) setErrors({ ...errors, pincode: null });
                }}
              />
            </View>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <CreditCard size={18} color="#0284C7" />
            <Text style={styles.cardTitleText}>Payment Method</Text>
          </View>

          {[
            { id: 'UPI', label: 'Instant UPI (Google Pay, PhonePe, Paytm)' },
            { id: 'Card', label: 'Debit / Credit Card (Visa, MasterCard, RuPay)' },
            { id: 'NetBanking', label: 'Net Banking (All Indian Banks)' },
            { id: 'COD', label: 'Cash on Delivery (COD)' },
          ].map((method) => {
            const isSelected = paymentMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  isSelected && styles.paymentOptionSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setPaymentMethod(method.id)}
              >
                <View style={styles.paymentRadioRow}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.paymentText,
                      isSelected && styles.paymentTextSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                </View>
                {isSelected && <Check size={16} color="#0284C7" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Summary & Delivery Guarantee */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Truck size={18} color="#059669" />
            <Text style={styles.cardTitleText}>Delivery & Guarantee</Text>
          </View>
          <View style={styles.guaranteeRow}>
            <ShieldCheck size={16} color="#059669" style={styles.shieldIcon} />
            <Text style={styles.guaranteeText}>
              All shipments are bubble-wrapped with anti-static ESD packaging.
            </Text>
          </View>
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>
              Total Items: {items.length}
            </Text>
            <Text style={styles.summaryTotalAmount}>
              ₹{Number(grandTotal).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Confirmation Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.totalPreviewBlock}>
          <Text style={styles.totalPreviewLabel}>Total Payable</Text>
          <Text style={styles.totalPreviewVal}>
            ₹{Number(grandTotal).toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={handlePlaceOrder}
          accessibilityLabel="Pay and Confirm Order"
        >
          <Text style={styles.confirmBtnText}>
            {loading ? 'Processing...' : 'Pay & Confirm'}
          </Text>
          {!loading && <ArrowRight size={17} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  flexOne: {
    flex: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  paymentOptionSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  paymentRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0284C7',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  paymentText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  paymentTextSelected: {
    color: '#0369A1',
    fontWeight: '700',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  shieldIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  guaranteeText: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
    flex: 1,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  summaryTotalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E3A5F',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 8,
  },
  totalPreviewBlock: {
    justifyContent: 'center',
  },
  totalPreviewLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  totalPreviewVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3A5F',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
