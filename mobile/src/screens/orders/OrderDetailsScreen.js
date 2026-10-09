import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  Phone,
  Mail,
  XCircle,
  AlertCircle,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import SafeImage from '../../components/common/SafeImage';
import Button from '../../components/common/Button';
import { orderService } from '../../services/orderService';
import paymentService from '../../services/paymentService';

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId, order: initialOrder } = route.params || {};
  const activeOrderId = orderId || initialOrder?._id;

  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!activeOrderId);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const fetchOrderDetails = useCallback(async () => {
    if (!activeOrderId) return;
    try {
      if (!initialOrder) setLoading(true);
      const res = await (orderService.getOrder || orderService.getOrderById)(activeOrderId);
      const fetched = res?.data?.order || res?.data || res;
      if (fetched && (fetched._id || fetched.orderItems)) {
        setOrder(fetched);
      }
    } catch (err) {
      console.warn('[OrderDetails] Error fetching order:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [activeOrderId, initialOrder]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const res = await orderService.cancelOrder(activeOrderId, 'Customer requested cancellation');
              if (res?.success !== false) {
                Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
                fetchOrderDetails();
              } else {
                Alert.alert('Cancellation Error', res?.message || 'Could not cancel order.');
              }
            } catch (err) {
              Alert.alert('Cancellation Error', err.message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleSupportCall = () => {
    Linking.openURL('tel:+918005553420').catch(() => {
      Alert.alert('Support Helpline', 'Call us at +91 800 555 3420');
    });
  };

  const handleSupportEmail = () => {
    const subject = encodeURIComponent(`Inquiry for Order #${order?.trackingNumber || activeOrderId}`);
    Linking.openURL(`mailto:support@TechCrate.com?subject=${subject}`).catch(() => {
      Alert.alert('Support Email', 'Email us at support@TechCrate.com');
    });
  };

  const handlePayNow = async () => {
    if (!order || paying) return;
    try {
      setPaying(true);
      setPaymentMessage('');
      const payment = await paymentService.createPaymentOrder({
        order_id: activeOrderId,
        redirect_url: 'techcrate://payment/success',
        failure_url: 'techcrate://payment/failed',
      });

      if (payment?.payment_url) {
        await paymentService.openPaymentGateway(payment.payment_url);
        navigation.replace('PaymentProcessing', {
          order_id: activeOrderId,
          orderId: activeOrderId,
        });
      } else if (payment?.upi_intent_url) {
        await paymentService.openPaymentGateway(payment.upi_intent_url);
        navigation.replace('PaymentProcessing', {
          order_id: activeOrderId,
          orderId: activeOrderId,
        });
      } else {
        setPaymentMessage('Payment details could not be generated. Please try again.');
      }
    } catch (err) {
      setPaymentMessage(err?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading && !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text style={styles.loadingText}>Loading shipment details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Header title="Order Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <AlertCircle size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Order Not Found</Text>
          <Text style={styles.emptySubtitle}>Unable to retrieve tracking details for this order.</Text>
          <Button
            title="Back to Orders"
            type="primary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  const status = String(order.orderStatus || 'Placed').toLowerCase();
  const isDelivered = status === 'delivered';
  const isShipped = status === 'shipped' || status === 'out_for_delivery' || isDelivered;
  const isCancelled = status === 'cancelled' || status === 'returned';

  const timelineSteps = [
    { title: 'Order Placed', time: order.isPaid ? 'Payment Verified' : 'Awaiting Payment', done: !isCancelled },
    { title: 'Packed & Anti-Static Sealed', time: 'Warehouse Quality Check', done: order.isPaid && !isCancelled },
    { title: 'In Transit / Dispatched', time: 'Courier Partner Assigned', done: isShipped && !isCancelled },
    { title: 'Delivered', time: isDelivered ? 'Handed to Recipient' : 'Estimated 2-3 Business Days', done: isDelivered },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Track Shipment"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusTopRow}>
            <View>
              <Text style={styles.trackingNumberLabel}>Tracking Number</Text>
              <Text style={styles.trackingNumberVal}>
                {order.trackingNumber || `ORD-${String(order._id || activeOrderId).slice(-8).toUpperCase()}`}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isCancelled ? styles.statusBadgeRed : isDelivered ? styles.statusBadgeGreen : styles.statusBadgeBlue,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isCancelled ? styles.statusTextRed : isDelivered ? styles.statusTextGreen : styles.statusTextBlue,
                ]}
              >
                {order.orderStatus || 'Confirmed'}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDateText}>
            Order Date:{' '}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString('en-IN')
              : 'Recent'}
          </Text>
        </View>

        {/* Timeline Tracker */}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery Timeline</Text>
            {timelineSteps.map((step, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <View style={[styles.timelineDot, step.done && styles.timelineDotDone]}>
                  {step.done && <CheckCircle size={10} color="#FFFFFF" />}
                </View>
                <View style={styles.timelineInfo}>
                  <Text style={[styles.timelineTitle, step.done && styles.timelineTitleDone]}>
                    {step.title}
                  </Text>
                  <Text style={styles.timelineTime}>{step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Ordered Items List */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Package Contents ({order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'items'})
          </Text>
          {order.orderItems?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <SafeImage
                source={item.image || item.images?.[0]}
                style={styles.itemImage}
                resizeMode="contain"
                placeholderIcon={Package}
              />
              <View style={styles.itemMeta}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title || item.name || 'Component'}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity || 1}</Text>
                <Text style={styles.itemPrice}>
                  ₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <View style={styles.cardHeaderWithIcon}>
            <MapPin size={17} color="#0284C7" />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>
          <Text style={styles.addressName}>
            {order.shippingAddress?.fullName || 'Rahul Sharma'}
          </Text>
          <Text style={styles.addressLine}>
            {order.shippingAddress?.street || 'Hostel 12, BITS Campus'}
          </Text>
          <Text style={styles.addressLine}>
            {order.shippingAddress?.city || 'Jaipur'}, {order.shippingAddress?.state || 'Rajasthan'} -{' '}
            {order.shippingAddress?.pincode || '302001'}
          </Text>
          <Text style={styles.addressPhone}>
            Phone: {order.shippingAddress?.phone || '+91 98765 43210'}
          </Text>
        </View>

        {/* Payment section intentionally hidden on order details */}
        {false && (
        <View style={styles.card}>
          <View style={styles.cardHeaderWithIcon}>
            <CreditCard size={17} color="#0284C7" />
            <Text style={styles.sectionTitle}>Payment</Text>
          </View>
          {!order.isPaid && order.paymentMethod === 'UPI' && !isCancelled && (
            <View style={styles.paymentActionBox}>
              <Text style={styles.paymentInstruction}>
                Complete payment to confirm this order. The payable amount is calculated by the server.
              </Text>
              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={handlePayNow}
                disabled={paying}
                activeOpacity={0.85}
              >
                <CreditCard size={16} color="#FFFFFF" />
                <Text style={styles.payNowBtnText}>{paying ? 'Preparing payment...' : 'Pay Now'}</Text>
              </TouchableOpacity>
              {!!paymentMessage && <Text style={styles.paymentError}>{paymentMessage}</Text>}
            </View>
          )}
        </View>
        )}

        {/* Need Help / Support Section with clickable phone and email */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Need Help with this Order?</Text>
          <View style={styles.supportButtonsRow}>
            <TouchableOpacity
              style={styles.supportBtn}
              onPress={handleSupportCall}
              activeOpacity={0.7}
              accessibilityLabel="Call support"
            >
              <Phone size={15} color="#1E3A5F" />
              <Text style={styles.supportBtnText}>Call Helpline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportBtn}
              onPress={handleSupportEmail}
              activeOpacity={0.7}
              accessibilityLabel="Email support"
            >
              <Mail size={15} color="#1E3A5F" />
              <Text style={styles.supportBtnText}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cancel Order Button (if eligible) */}
        {!isCancelled && !isDelivered && (
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            disabled={cancelling}
            onPress={handleCancelOrder}
            accessibilityLabel="Cancel order"
          >
            <XCircle size={16} color="#DC2626" />
            <Text style={styles.cancelBtnText}>
              {cancelling ? 'Cancelling...' : 'Cancel This Order'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
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
  statusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingNumberLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  trackingNumberVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1E3A5F',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeBlue: {
    backgroundColor: '#EFF6FF',
  },
  statusBadgeGreen: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgeRed: {
    backgroundColor: '#FEF2F2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusTextBlue: {
    color: '#2563EB',
  },
  statusTextGreen: {
    color: '#059669',
  },
  statusTextRed: {
    color: '#DC2626',
  },
  orderDateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotDone: {
    backgroundColor: '#1E3A5F',
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timelineTitleDone: {
    color: '#0F172A',
    fontWeight: '700',
  },
  timelineTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginRight: 10,
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A5F',
    marginTop: 2,
  },
  addressName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  addressLine: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  addressPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  billValueGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  billRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
    paddingTop: 8,
  },
  paymentActionBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  paymentInstruction: {
    color: '#92400E',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  payNowBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 12,
  },
  payNowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  paymentError: {
    color: '#B91C1C',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  billTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E3A5F',
  },
  supportButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
});
