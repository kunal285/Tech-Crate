import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  FileText,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';

const OrderSuccessScreen = ({ navigation, route }) => {
  const { order, orderId, trackingNumber, grandTotal } = route.params || {};

  const activeOrderId =
    orderId ||
    order?._id ||
    order?.order_id ||
    'TC-' + Math.floor(100000 + Math.random() * 900000);

  const activeTracking =
    trackingNumber ||
    order?.trackingNumber ||
    `AWB${String(activeOrderId).slice(-8).toUpperCase()}`;

  const amount =
    grandTotal ||
    order?.totalPrice ||
    order?.itemsPrice ||
    0;

  const shipping = order?.shippingAddress;

  const navigateToTracking = () => {
    navigation.navigate('OrderTracking', {
      orderId: activeOrderId,
      order,
    });
  };

  const navigateToDetails = () => {
    navigation.navigate('OrderDetail', {
      orderId: activeOrderId,
      order,
    });
  };

  const navigateToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <Header title="Order Confirmed" hideBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Success Icon Circle */}
        <View style={styles.heroSection}>
          <View style={styles.iconRing}>
            <View style={styles.iconInner}>
              <CheckCircle2 size={52} color="#059669" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Thank You for Your Order!</Text>
          <Text style={styles.heroSubtitle}>
            Your hardware order has been placed successfully and sent to our fulfillment center.
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Order Number</Text>
            <Text style={styles.cardValue} numberOfLines={1}>
              #{String(activeOrderId).slice(-10).toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Tracking AWB</Text>
            <View style={styles.awbBadge}>
              <Package size={13} color={Colors.primary} />
              <Text style={styles.awbText}>{activeTracking}</Text>
            </View>
          </View>

          {amount > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Total Amount</Text>
                <Text style={styles.priceValue}>
                  ₹{Number(amount).toLocaleString('en-IN')}
                </Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Estimated Delivery</Text>
            <View style={styles.deliveryBadge}>
              <Clock size={13} color="#059669" />
              <Text style={styles.deliveryText}>3–5 Business Days</Text>
            </View>
          </View>

          {shipping?.city && (
            <>
              <View style={styles.divider} />
              <View style={styles.addressSection}>
                <View style={styles.addressHeader}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.addressTitle}>Shipping Destination</Text>
                </View>
                <Text style={styles.addressLine} numberOfLines={2}>
                  {shipping.fullName ? `${shipping.fullName}, ` : ''}
                  {shipping.street || ''}, {shipping.city}
                  {shipping.pincode ? ` - ${shipping.pincode}` : ''}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Safety & Guarantee Badge */}
        <View style={styles.guaranteeBanner}>
          <ShieldCheck size={18} color={Colors.primary} />
          <Text style={styles.guaranteeText}>
            Tested components & 7-day hassle-free replacement guarantee.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={navigateToTracking}
            activeOpacity={0.85}>
            <Truck size={18} color={Colors.white} />
            <Text style={styles.primaryBtnText}>Track Your Shipment</Text>
            <ArrowRight size={16} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={navigateToDetails}
            activeOpacity={0.85}>
            <FileText size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>View Full Order Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={navigateToHome}
            activeOpacity={0.85}>
            <ShoppingBag size={18} color={Colors.textPrimary} />
            <Text style={styles.outlineBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 6,
    borderColor: '#D1FAE5',
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cardLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  cardValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  priceValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  awbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  awbText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  deliveryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  addressSection: {
    paddingTop: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressLine: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  guaranteeBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary + '08',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    marginBottom: Spacing.lg,
  },
  guaranteeText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.base,
    ...Shadows.sm,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  secondaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: BorderRadius.base,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  outlineBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 13,
    borderRadius: BorderRadius.base,
  },
  outlineBtnText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default OrderSuccessScreen;
