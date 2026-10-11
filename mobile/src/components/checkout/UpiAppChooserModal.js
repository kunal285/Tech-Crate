import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Smartphone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react-native';
import { UPI_APPS } from '../../services/paymentService';
import { getAppLogo } from '../common/PaymentLogos';

export default function UpiAppChooserModal({
  visible,
  onClose,
  onSelectApp,
  amount = 0,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconCircle}>
                    <Smartphone size={20} color="#0284C7" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Pay with UPI</Text>
                    <Text style={styles.headerSub}>Choose your preferred UPI application</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Amount Bar */}
              <View style={styles.amountBar}>
                <Text style={styles.amountLabel}>Total Payable Amount</Text>
                <Text style={styles.amountValue}>₹{Number(amount).toLocaleString('en-IN')}</Text>
              </View>

              {/* App List */}
              <ScrollView
                style={styles.appList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.appListContent}
              >
                <Text style={styles.sectionTitle}>Installed & Recommended Apps</Text>

                {UPI_APPS.map((app) => {
                  return (
                    <TouchableOpacity
                      key={app.id}
                      style={styles.appCard}
                      activeOpacity={0.7}
                      onPress={() => onSelectApp(app.id)}
                    >
                      <View style={styles.appCardLeft}>
                        {getAppLogo(app.id, 40)}
                        <View style={styles.appInfo}>
                          <View style={styles.appNameRow}>
                            <Text style={styles.appName}>{app.name}</Text>
                            {app.popular && (
                              <View style={styles.popularBadge}>
                                <Sparkles size={10} color="#D97706" />
                                <Text style={styles.popularBadgeText}>Popular</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.appDescription}>{app.description}</Text>
                        </View>
                      </View>
                      <ArrowRight size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  );
                })}

                {/* Trust Footer */}
                <View style={styles.securityRow}>
                  <ShieldCheck size={14} color="#059669" />
                  <Text style={styles.securityText}>
                    100% Secure NPCI UPI Encrypted Transaction
                  </Text>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  amountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284C7',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  appList: {
    maxHeight: 380,
  },
  appListContent: {
    paddingBottom: 10,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  appCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  appAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appInfo: {
    flex: 1,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  appDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 8,
  },
  securityText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
});
