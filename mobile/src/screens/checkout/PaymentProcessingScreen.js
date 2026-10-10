import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ShieldCheck, RefreshCw } from 'lucide-react-native';
import Header from '../../components/common/Header';
import paymentService from '../../services/paymentService';

export default function PaymentProcessingScreen({ route, navigation }) {
  const { order_id, orderId } = route.params || {};
  const targetOrderId = order_id || orderId;

  const [checking, setChecking] = useState(true);
  const [attempt, setAttempt] = useState(1);

  useEffect(() => {
    let timer;
    let maxAttempts = 10;

    const checkStatus = async () => {
      if (!targetOrderId) return;
      try {
        setChecking(true);
        let res = await paymentService.getPaymentStatus(targetOrderId);
        if (!res?.isPaid && attempt >= 2) {
          try {
            const verifyRes = await paymentService.verifyPayment({
              session_id: targetOrderId,
              order_id: targetOrderId,
            });
            if (verifyRes && verifyRes.isPaid) {
              res = verifyRes;
            }
          } catch {}
        }

        if (res && res.isPaid) {
          navigation.replace('PaymentResult', {
            order_id: res.final_order_id || targetOrderId,
            status: 'paid',
            paymentDetails: res,
          });
          return;
        } else if (res && res.status === 'failed') {
          navigation.replace('PaymentResult', {
            order_id: targetOrderId,
            status: 'failed',
            paymentDetails: res,
          });
          return;
        }
      } catch (err) {
        console.warn('[Processing Status Check Warning]', err.message);
      } finally {
        setChecking(false);
      }

      if (attempt < maxAttempts) {
        timer = setTimeout(() => {
          setAttempt((prev) => prev + 1);
        }, 3000);
      } else {
        // Fallback to Pending state result after polling timeout
        navigation.replace('PaymentResult', {
          order_id: targetOrderId,
          status: 'pending',
        });
      }
    };

    checkStatus();

    return () => clearTimeout(timer);
  }, [attempt, targetOrderId, navigation]);

  return (
    <View style={styles.container}>
      <Header title="Payment Processing" />
      <View style={styles.content}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#0284C7" style={styles.spinner} />
          <Text style={styles.title}>Verifying Payment Status</Text>
          <Text style={styles.subtitle}>
            Please wait while we securely confirm your transaction with the bank...
          </Text>

          <View style={styles.badgeRow}>
            <ShieldCheck size={16} color="#059669" />
            <Text style={styles.badgeText}>Server-Verified Security Check</Text>
          </View>

          <Text style={styles.attemptText}>Attempt {attempt} of 10</Text>

          <TouchableOpacity
            style={styles.manualBtn}
            onPress={() => setAttempt((prev) => prev + 1)}
          >
            <RefreshCw size={14} color="#0284C7" />
            <Text style={styles.manualBtnText}>Re-check Status Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  spinner: {
    marginBottom: 16,
    transform: [{ scale: 1.2 }],
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  attemptText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 12,
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
  },
  manualBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
});
