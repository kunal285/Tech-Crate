import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Copy,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { orderService } from '../../services/orderService';

const TRACKING_STEPS = [
  {
    step: 1,
    title: 'Order Placed & Confirmed',
    description: 'Hardware items reserved and transaction verified.',
    time: 'Day 1',
    statusKey: 'placed',
  },
  {
    step: 2,
    title: 'Hardware QA & Inspection',
    description: 'Components tested for pinout integrity and flash firmware.',
    time: 'Day 1–2',
    statusKey: 'confirmed',
  },
  {
    step: 3,
    title: 'Dispatched from Fulfillment Hub',
    description: 'Package handed over to logistics courier facility.',
    time: 'Day 2–3',
    statusKey: 'shipped',
  },
  {
    step: 4,
    title: 'Out for Delivery',
    description: 'Delivery executive is en route to your shipping address.',
    time: 'Today',
    statusKey: 'out_for_delivery',
  },
  {
    step: 5,
    title: 'Delivered',
    description: 'Package successfully delivered and signed for.',
    time: 'Estimated by 6:00 PM',
    statusKey: 'delivered',
  },
];

const OrderTrackingScreen = ({ navigation, route }) => {
  const { orderId, order: initialOrder } = route.params || {};
  const activeId = orderId || initialOrder?._id || 'ORD-894210';

  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder && !!orderId);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      if (!initialOrder) setLoading(true);
      const res = await (orderService.getOrder || orderService.getOrderById)(orderId);
      const fetched = res?.data?.order || res?.data || res;
      if (fetched && (fetched._id || fetched.orderStatus)) {
        setOrder(fetched);
      }
    } catch (err) {
      console.warn('[OrderTracking] Error fetching order details:', err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId, initialOrder]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const currentStatus = String(order?.orderStatus || 'out_for_delivery').toLowerCase();

  const getStepProgress = () => {
    switch (currentStatus) {
      case 'delivered':
        return 5;
      case 'out_for_delivery':
        return 4;
      case 'shipped':
        return 3;
      case 'confirmed':
      case 'packed':
        return 2;
      case 'placed':
      default:
        return 1;
    }
  };

  const currentStep = getStepProgress();
  const awbNumber =
    order?.trackingNumber ||
    `TC-EXP-${String(activeId).slice(-6).toUpperCase()}`;

  const copyTracking = () => {
    Clipboard.setString(awbNumber);
    Alert.alert('Copied to Clipboard', `AWB tracking number: ${awbNumber}`);
  };

  const handleSupport = () => {
    Linking.openURL('tel:+918005553420').catch(() => {
      Alert.alert('Customer Care', 'Helpline: +91 800 555 3420');
    });
  };

  const shipping = order?.shippingAddress;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Live Shipment Tracking"
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading tracking updates...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Main Status Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroLeft}>
                <Text style={styles.orderNumberLabel}>ORDER NUMBER</Text>
                <Text style={styles.orderNumberVal}>
                  #{String(activeId).slice(-10).toUpperCase()}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Truck size={14} color={Colors.primary} />
                <Text style={styles.statusPillText}>
                  {currentStatus === 'delivered'
                    ? 'Delivered'
                    : currentStatus === 'out_for_delivery'
                    ? 'Out for Delivery'
                    : currentStatus === 'shipped'
                    ? 'In Transit'
                    : 'Processing'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.courierRow}>
              <View style={styles.courierInfo}>
                <Text style={styles.courierLabel}>Courier Partner</Text>
                <Text style={styles.courierName}>Delhivery Express Logistics</Text>
              </View>
              <TouchableOpacity
                style={styles.awbBtn}
                onPress={copyTracking}
                activeOpacity={0.8}>
                <Text style={styles.awbBtnText}>{awbNumber}</Text>
                <Copy size={13} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.etaBox}>
              <Clock size={16} color="#059669" />
              <Text style={styles.etaText}>
                {currentStatus === 'delivered'
                  ? 'Delivered on Schedule'
                  : 'Expected Delivery: Today by 7:00 PM'}
              </Text>
            </View>
          </View>

          {/* Timeline Section */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Shipment Progress</Text>

            <View style={styles.timelineList}>
              {TRACKING_STEPS.map((item, index) => {
                const isPassed = item.step < currentStep;
                const isCurrent = item.step === currentStep;
                const isLast = index === TRACKING_STEPS.length - 1;

                return (
                  <View key={item.step} style={styles.stepItem}>
                    {/* Node and Line */}
                    <View style={styles.nodeColumn}>
                      <View
                        style={[
                          styles.nodeCircle,
                          isPassed && styles.nodeCircleCompleted,
                          isCurrent && styles.nodeCircleActive,
                        ]}>
                        {isPassed ? (
                          <CheckCircle2 size={16} color={Colors.white} />
                        ) : isCurrent ? (
                          <View style={styles.pulseDot} />
                        ) : (
                          <View style={styles.idleDot} />
                        )}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.connectorLine,
                            (isPassed || isCurrent) && styles.connectorLineActive,
                          ]}
                        />
                      )}
                    </View>

                    {/* Step Content */}
                    <View style={styles.stepContent}>
                      <View style={styles.stepHeader}>
                        <Text
                          style={[
                            styles.stepTitle,
                            (isPassed || isCurrent) && styles.stepTitleActive,
                          ]}>
                          {item.title}
                        </Text>
                        <Text style={styles.stepTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.stepDesc}>{item.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Shipping Address Card */}
          {shipping && (
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.addressTitle}>Delivery Destination</Text>
              </View>
              <Text style={styles.addressName}>{shipping.fullName || 'Recipient'}</Text>
              <Text style={styles.addressText}>
                {shipping.street || ''}, {shipping.city || ''}
                {shipping.state ? `, ${shipping.state}` : ''}
                {shipping.pincode ? ` - ${shipping.pincode}` : ''}
              </Text>
              {shipping.phone && (
                <View style={styles.phoneRow}>
                  <Phone size={13} color={Colors.textSecondary} />
                  <Text style={styles.phoneText}>+91 {shipping.phone}</Text>
                </View>
              )}
            </View>
          )}

          {/* Support Helpline Bar */}
          <TouchableOpacity
            style={styles.supportBar}
            onPress={handleSupport}
            activeOpacity={0.85}>
            <View style={styles.supportLeft}>
              <HelpCircle size={20} color={Colors.primary} />
              <View>
                <Text style={styles.supportTitle}>Delivery Questions?</Text>
                <Text style={styles.supportDesc}>
                  Contact TechCrate priority logistics helpline
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLeft: {
    flex: 1,
  },
  orderNumberLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  orderNumberVal: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  statusPillText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  courierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  courierInfo: {
    flex: 1,
  },
  courierLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  courierName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  awbBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.base,
  },
  awbBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary,
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  etaText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: '#065F46',
  },
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  timelineTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineList: {
    paddingLeft: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 28,
  },
  nodeCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCircleCompleted: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  nodeCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  idleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  connectorLine: {
    width: 2,
    height: 48,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  connectorLineActive: {
    backgroundColor: Colors.primary,
  },
  stepContent: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  stepTitleActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.bold,
  },
  stepTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  stepDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  addressTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  addressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  phoneText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  supportBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  supportTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  supportDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default OrderTrackingScreen;
