import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  Tag,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import SafeImage from '../../components/common/SafeImage';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const items = useCartStore((state) => state.items || []);
  const isLoading = useCartStore((state) => state.isLoading);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const restoreLocal = useCartStore((state) => state.restoreLocal);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotals = useCartStore((state) => state.getTotals);
  const coupon = useCartStore((state) => state.coupon);
  const couponDiscount = useCartStore((state) => state.couponDiscount || 0);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Re-fetch / restore cart on screen focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const load = async () => {
        await restoreLocal();
        await fetchCart();
        if (isMounted) setInitialLoaded(true);
      };
      load();
      return () => {
        isMounted = false;
      };
    }, [fetchCart, restoreLocal])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCart();
    } finally {
      setRefreshing(false);
    }
  };

  const totals = typeof getTotals === 'function' ? getTotals() : {
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    couponDiscount: 0,
    total: 0,
  };

  const totalAmount = totals.subtotal || 0;
  const taxAmount = totals.tax || 0;
  const shippingCost = totals.deliveryFee || 0;
  const discountAmount = totals.couponDiscount || couponDiscount || 0;
  const grandTotal = Math.max(0, totals.total || 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Coupon Code', 'Please enter a valid coupon code (e.g. TECH10)');
      return;
    }
    setCouponLoading(true);
    try {
      const res = await applyCoupon(couponCode.trim().toUpperCase());
      if (res && res.success) {
        Alert.alert('Coupon Applied', `Code "${couponCode.trim().toUpperCase()}" applied successfully!`);
        setCouponCode('');
      } else {
        Alert.alert('Coupon Invalid', res?.message || 'This coupon code could not be applied.');
      }
    } catch (err) {
      Alert.alert('Coupon Error', err?.message || 'Error validating coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch {}
  };

  const handleDeleteItem = (itemId, itemTitle) => {
    removeItem(itemId);
  };

  if (!initialLoaded && isLoading && items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Shopping Cart" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Shopping Cart" />
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyIconBg}>
            <ShoppingCart size={54} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore thousands of microcontrollers, sensors, robotics parts & engineering project kits!
          </Text>
          <Button
            title="Browse Hardware Store"
            type="primary"
            onPress={() => navigation.navigate('Home', { screen: 'HomeMain' })}
            style={styles.emptyBtn}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`Cart (${items.length} ${items.length === 1 ? 'Item' : 'Items'})`}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Cart Item Cards */}
        {items.map((item, idx) => {
          const itemId = item._id || item.productId || item.product?._id || item.id || `item_${idx}`;
          const itemTitle =
            item.title ||
            item.name ||
            item.product?.title ||
            item.product?.name ||
            item.projectKit?.title ||
            item.projectKit?.name ||
            'Hardware Component';

          const itemImage =
            item.image ||
            item.imageUrl ||
            (Array.isArray(item.images) && item.images[0]) ||
            item.product?.images?.[0] ||
            item.product?.image ||
            item.product?.imageUrl ||
            item.projectKit?.images?.[0] ||
            item.projectKit?.image ||
            null;

          const itemPrice = Number(item.price ?? item.product?.discountPrice ?? item.product?.price ?? 0);
          const itemQty = Math.max(1, Number(item.quantity) || 1);

          return (
            <View key={itemId} style={styles.cartCard}>
              <SafeImage
                source={itemImage}
                style={styles.itemImage}
                resizeMode="contain"
                placeholderIcon={Package}
                placeholderText="Tech Crate"
              />

              <View style={styles.itemDetails}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {itemTitle}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(itemId, itemTitle)}
                    style={styles.removeBtn}
                    accessibilityLabel="Remove item"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemPriceAndQtyRow}>
                  <Text style={styles.itemPrice}>
                    ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                    {itemQty > 1 && (
                      <Text style={styles.singleItemPrice}>
                        {' '}(₹{itemPrice.toLocaleString('en-IN')} ea)
                      </Text>
                    )}
                  </Text>

                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(itemId, itemQty - 1)}
                      style={styles.qtyBtn}
                      activeOpacity={0.7}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Minus
                        size={13}
                        color={itemQty <= 1 ? '#EF4444' : '#0F172A'}
                      />
                    </TouchableOpacity>

                    <Text style={styles.qtyVal}>{itemQty}</Text>

                    <TouchableOpacity
                      onPress={() => updateQuantity(itemId, itemQty + 1)}
                      style={styles.qtyBtn}
                      activeOpacity={0.7}
                      accessibilityLabel="Increase quantity"
                    >
                      <Plus size={13} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Promo / Coupon Section */}
        <View style={styles.couponCard}>
          <View style={styles.couponHeader}>
            <Tag size={16} color="#0284C7" />
            <Text style={styles.couponTitle}>Discount Coupon</Text>
          </View>

          {coupon ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.appliedCouponInfo}>
                <Check size={16} color="#059669" />
                <Text style={styles.appliedCouponCode}>
                  {typeof coupon === 'string' ? coupon : coupon.code || 'COUPON APPLIED'}
                </Text>
                {discountAmount > 0 && (
                  <Text style={styles.appliedDiscountText}>
                    (-₹{discountAmount.toLocaleString('en-IN')})
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={handleRemoveCoupon}
                style={styles.removeCouponBtn}
                accessibilityLabel="Remove coupon"
              >
                <X size={15} color="#DC2626" />
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextInput
                placeholder="Enter coupon (e.g. TECH10)"
                placeholderTextColor="#94A3B8"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
                style={styles.couponInput}
              />
              <TouchableOpacity
                onPress={handleApplyCoupon}
                disabled={couponLoading}
                style={styles.applyBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>
                  {couponLoading ? 'Checking...' : 'Apply'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Breakdown Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bill Breakdown</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelGreen}>Coupon Savings</Text>
              <Text style={styles.summaryValueGreen}>
                -₹{discountAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated GST (18%)</Text>
            <Text style={styles.summaryValue}>₹{taxAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Charges</Text>
            <Text style={styles.summaryValue}>
              {shippingCost === 0 ? (
                <Text style={styles.freeDelivery}>FREE</Text>
              ) : (
                `₹${shippingCost}`
              )}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.trustNoteRow}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.trustNoteText}>
              Safe & Secure Payments with 256-bit encryption
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Checkout Bar */}
      <View
        style={[
          styles.checkoutBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.checkoutPriceBlock}>
          <Text style={styles.checkoutTotalLabel}>Total Amount</Text>
          <Text style={styles.checkoutTotalVal}>
            ₹{grandTotal.toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.proceedBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Checkout', { grandTotal })}
          accessibilityLabel="Proceed to Checkout"
        >
          <Text style={styles.proceedBtnText}>Proceed to Checkout</Text>
          <ArrowRight size={17} color="#FFFFFF" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  itemImage: {
    width: 82,
    height: 82,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    padding: 4,
  },
  itemPriceAndQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E3A5F',
  },
  singleItemPrice: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyBtn: {
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  qtyVal: {
    paddingHorizontal: 8,
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
    minWidth: 20,
    textAlign: 'center',
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: '#1E3A5F',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  appliedCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appliedCouponCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  appliedDiscountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  removeCouponBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4,
  },
  removeCouponText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  summaryLabelGreen: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '600',
  },
  summaryValueGreen: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '800',
  },
  freeDelivery: {
    color: '#059669',
    fontWeight: '800',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E3A5F',
  },
  trustNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  trustNoteText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 8,
  },
  checkoutPriceBlock: {
    justifyContent: 'center',
  },
  checkoutTotalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  checkoutTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3A5F',
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
