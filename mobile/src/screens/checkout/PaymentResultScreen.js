import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  FileText,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import paymentService from '../../services/paymentService';
import useCartStore from '../../store/cartStore';

export default function PaymentResultScreen({ route, navigation }) {
  const { order_id, orderId, status: initialStatus } = route.params || {};
  const targetOrderId = order_id || orderId;

  const [loading, setLoading] = useState(true);
  const [serverVerifiedStatus, setServerVerifiedStatus] = useState('pending');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const clearCart = useCartStore((state) => state.clearCart);

  const verifyBackendPayment = useCallback(async () => {
    if (!targetOrderId) {
      setLoading(false);
      setServerVerifiedStatus('failed');
      return;
    }
    try {
      setLoading(true);
      const res = await paymentService.getPaymentStatus(targetOrderId);
      if (res && res.isPaid) {
        setServerVerifiedStatus('paid');
        setPaymentDetails(res);
        if (typeof clearCart === 'function') {
          await clearCart();
        }
      } else if (res && res.status === 'failed') {
        setServerVerifiedStatus('failed');
        setPaymentDetails(res);
      } else {
        setServerVerifiedStatus('pending');
        setPaymentDetails(res);
      }
    } catch (err) {
      console.warn('[Payment Result Verification Error]', err.message);
      setServerVerifiedStatus('pending');
    } finally {
      setLoading(false);
    }
  }, [targetOrderId, clearCart]);

  useEffect(() => {
    verifyBackendPayment();
  }, [verifyBackendPayment]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Verifying with server...</Text>
      </View>
    );
  }

  const isSuccess = serverVerifiedStatus === 'paid';
  const isFailed = serverVerifiedStatus === 'failed';
  const isPending = serverVerifiedStatus === 'pending';

  return (
    <View style={styles.container}>
      <Header title="Payment Confirmation" hideBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SUCCESS STATE */}
        {isSuccess && (
          <View style={[styles.card, styles.successCard]}>
            <View style={styles.iconCircleSuccess}>
              <CheckCircle2 size={44} color="#059669" />
            </View>
            <Text style={styles.titleSuccess}>Payment Successful</Text>
            <Text style={styles.subtitle}>
              Your transaction has been securely verified and recorded on our server.
            </Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order Reference:</Text>
                <Text style={styles.detailVal}>#{targetOrderId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Paid:</Text>
                <Text style={styles.detailAmount}>
                  ₹{Number(paymentDetails?.amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment ID:</Text>
                <Text style={styles.detailVal}>{paymentDetails?.payment_id || `PAY_${targetOrderId}`}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Verification Source:</Text>
                <Text style={styles.verifiedTag}>Signed Webhook / Server DB</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.replace('OrderDetail', { orderId: targetOrderId, order_id: targetOrderId })
                }
              >
                <FileText size={16} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>View Order Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Home')}
              >
                <ShoppingBag size={16} color="#0284C7" />
                <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FAILED STATE */}
        {isFailed && (
          <View style={[styles.card, styles.failedCard]}>
            <View style={styles.iconCircleFailed}>
              <XCircle size={44} color="#DC2626" />
            </View>
            <Text style={styles.titleFailed}>Payment Failed</Text>
            <Text style={styles.subtitle}>
              Your payment was not completed. No charges were made to your account.
            </Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID:</Text>
                <Text style={styles.detailVal}>#{targetOrderId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.failedTag}>Transaction Failed / Cancelled</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.dangerBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Checkout')}
              >
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Orders')}
              >
                <FileText size={16} color="#0284C7" />
                <Text style={styles.secondaryBtnText}>Back to Orders</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* PENDING STATE */}
        {isPending && (
          <View style={[styles.card, styles.pendingCard]}>
            <View style={styles.iconCirclePending}>
              <Clock size={44} color="#D97706" />
            </View>
            <Text style={styles.titlePending}>Payment Pending</Text>
            <Text style={styles.subtitle}>
              Your payment status is currently pending bank confirmation. We are waiting for the authoritative payment webhook.
            </Text>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID:</Text>
                <Text style={styles.detailVal}>#{targetOrderId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Current Status:</Text>
                <Text style={styles.pendingTag}>Awaiting Bank Confirmation</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.warningBtn}
                activeOpacity={0.85}
                onPress={verifyBackendPayment}
              >
                <RefreshCw size={16} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Re-check Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Orders')}
              >
                <Text style={styles.secondaryBtnText}>View My Orders</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  successCard: {
    borderColor: '#A7F3D0',
  },
  failedCard: {
    borderColor: '#FCA5A5',
  },
  pendingCard: {
    borderColor: '#FDE68A',
  },
  iconCircleSuccess: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircleFailed: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCirclePending: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSuccess: {
    fontSize: 22,
    fontWeight: '900',
    color: '#065F46',
    marginBottom: 6,
  },
  titleFailed: {
    fontSize: 22,
    fontWeight: '900',
    color: '#991B1B',
    marginBottom: 6,
  },
  titlePending: {
    fontSize: 22,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
  },
  verifiedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  failedTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  btnRow: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  dangerBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  warningBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtnText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '700',
  },
});
