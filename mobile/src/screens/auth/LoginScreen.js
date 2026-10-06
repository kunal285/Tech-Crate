import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, Phone, Lock, ArrowRight, RefreshCw, GraduationCap, UserCheck, ShieldCheck } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuthStore from '../../store/authStore';

import firebaseAuthService from '../../services/firebaseAuthService';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState('');
  const [firebaseSessionInfo, setFirebaseSessionInfo] = useState('');
  const [authMode, setAuthMode] = useState('firebase'); // 'firebase' or 'direct'
  const [maskedPhone, setMaskedPhone] = useState('');
  const [step, setStep] = useState(1); // 1: Send Phone, 2: Enter OTP
  const [accountType, setAccountType] = useState('customer'); // 'customer' or 'student'
  
  // Student Additional Details (for student activation)
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [studentId, setStudentId] = useState('');

  // Timers
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes (300 seconds)
  const [cooldownTimer, setCooldownTimer] = useState(0); // 30 seconds resend cooldown
  const [errors, setErrors] = useState({});

  const { sendOtp, verifyOtp, firebaseLogin, isLoading, error, clearError } = useAuthStore();

  // 5-Minute OTP Expiry Countdown
  useEffect(() => {
    let interval = null;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  // 30-Second Resend Cooldown Timer
  useEffect(() => {
    let interval = null;
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer((prev) => prev - 1);
      }, 1000);
    } else if (cooldownTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [cooldownTimer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validatePhone = () => {
    const clean = phone.replace(/\D/g, '');
    if (!clean || clean.length !== 10) {
      setErrors({ phone: 'Enter a valid 10-digit mobile number' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSendOtp = async () => {
    clearError();
    if (!validatePhone()) return;

    // Check if Firebase Client Credentials are ready
    if (firebaseAuthService.isFirebaseConfigured()) {
      setAuthMode('firebase');
      const result = await firebaseAuthService.sendPhoneOtp(phone);
      if (result.success) {
        setFirebaseSessionInfo(result.sessionInfo);
        setMaskedPhone(result.maskedPhone || `+91 ******${phone.slice(-4)}`);
        setStep(2);
        setOtpTimer(300);
        setCooldownTimer(30);
      } else {
        Alert.alert('Firebase Phone Auth', result.message);
      }
    } else {
      // Direct SMS Provider Route
      setAuthMode('direct');
      const result = await sendOtp(phone);
      if (result.success) {
        setRequestId(result.data.requestId);
        setMaskedPhone(result.data.maskedPhone || `+91 ******${phone.slice(-4)}`);
        setStep(2);
        setOtpTimer(300);
        setCooldownTimer(30);
      } else {
        Alert.alert('Phone Authentication', result.message);
      }
    }
  };

  const handleResendOtp = async () => {
    if (cooldownTimer > 0) return;
    clearError();

    if (authMode === 'firebase') {
      const result = await firebaseAuthService.sendPhoneOtp(phone);
      if (result.success) {
        setFirebaseSessionInfo(result.sessionInfo);
        setOtpTimer(300);
        setCooldownTimer(30);
        Alert.alert('OTP Resent', 'A new verification code has been dispatched to your mobile number.');
      } else {
        Alert.alert('Resend Failed', result.message);
      }
    } else {
      const result = await sendOtp(phone);
      if (result.success) {
        setRequestId(result.data.requestId);
        setOtpTimer(300);
        setCooldownTimer(30);
        Alert.alert('OTP Resent', 'A new verification code has been sent to your mobile number.');
      } else {
        Alert.alert('Resend Failed', result.message);
      }
    }
  };

  const handleVerifyOtp = async () => {
    clearError();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Enter 6-digit verification code' });
      return;
    }

    if (otpTimer === 0) {
      Alert.alert('OTP Expired', 'Your verification code has expired. Please request a new code.');
      return;
    }

    if (authMode === 'firebase') {
      // 1. Verify code with Firebase and retrieve Firebase ID Token
      const fbResult = await firebaseAuthService.verifyOtpAndGetIdToken(
        firebaseSessionInfo,
        otp
      );

      if (!fbResult.success) {
        Alert.alert('Verification Failed', fbResult.message);
        return;
      }

      // 2. Exchange verified Firebase ID token for secure ProjectKart application session
      const loginResult = await firebaseLogin({
        idToken: fbResult.idToken,
        accountType,
        name: name.trim(),
        college: college.trim(),
        branch: branch.trim(),
        studentId: studentId.trim(),
      });

      if (!loginResult.success) {
        Alert.alert('Authentication Failed', loginResult.message);
      }
    } else {
      // Direct verification fallback
      const result = await verifyOtp({
        phoneNumber: phone,
        otp,
        requestId,
        accountType,
        name: name.trim(),
        college: college.trim(),
        branch: branch.trim(),
        studentId: studentId.trim(),
      });

      if (!result.success) {
        Alert.alert('Verification Failed', result.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 44, height: 44, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Tech Crate</Text>
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              {step === 1 ? 'Login securely with Mobile Number & OTP' : 'Enter 6-digit verification code'}
            </Text>

            {/* Account Type Selector (Customer / Student) */}
            {step === 1 && (
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleTab, accountType === 'customer' && styles.roleTabActive]}
                  onPress={() => setAccountType('customer')}>
                  <UserCheck size={16} color={accountType === 'customer' ? Colors.white : Colors.textMuted} />
                  <Text style={[styles.roleTabText, accountType === 'customer' && styles.roleTabTextActive]}>
                    Customer Account
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleTab, accountType === 'student' && styles.roleTabActive]}
                  onPress={() => setAccountType('student')}>
                  <GraduationCap size={16} color={accountType === 'student' ? Colors.white : Colors.textMuted} />
                  <Text style={[styles.roleTabText, accountType === 'student' && styles.roleTabTextActive]}>
                    Student Account
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Step 1: Send Phone OTP */}
          {step === 1 && (
            <View style={styles.form}>
              <Input
                label="Mobile Number"
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, ''))}
                placeholder="9876543210"
                keyboardType="number-pad"
                maxLength={10}
                error={errors.phone}
                leftIcon={<Text style={styles.prefixText}>+91</Text>}
              />

              {accountType === 'student' && (
                <View style={styles.studentInfoBox}>
                  <Text style={styles.studentInfoTitle}>Student Account Verification</Text>
                  <Input
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Kunal Gavit"
                  />
                  <Input
                    label="College / Institution"
                    value={college}
                    onChangeText={setCollege}
                    placeholder="IIT Bombay"
                  />
                  <Input
                    label="Branch / Course"
                    value={branch}
                    onChangeText={setBranch}
                    placeholder="Electronics & Electrical"
                  />
                </View>
              )}

              <Button
                title="Send OTP"
                onPress={handleSendOtp}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.actionBtn}
              />
            </View>
          )}

          {/* Step 2: Enter 6-Digit OTP */}
          {step === 2 && (
            <View style={styles.form}>
              <View style={styles.verifyHeaderBox}>
                <Text style={styles.verifyTitle}>Verify Mobile Number</Text>
                <Text style={styles.verifySubtitle}>
                  OTP sent to <Text style={styles.boldPhone}>{maskedPhone}</Text>
                </Text>
                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text style={styles.changeNumberText}>Edit Phone Number</Text>
                </TouchableOpacity>
              </View>

              <Input
                label="6-Digit Verification Code"
                value={otp}
                onChangeText={(v) => setOtp(v.replace(/\D/g, ''))}
                placeholder="_ _ _ _ _ _"
                keyboardType="number-pad"
                maxLength={6}
                error={errors.otp}
                style={styles.otpInput}
                leftIcon={<Lock size={18} color={Colors.primary} />}
              />

              <View style={styles.timerRow}>
                <Text style={styles.timerLabel}>OTP expires in: </Text>
                <Text style={[styles.timerValue, otpTimer === 0 && { color: '#EF4444' }]}>
                  {otpTimer > 0 ? formatTimer(otpTimer) : 'OTP Expired'}
                </Text>
              </View>

              <Button
                title="Verify OTP"
                onPress={handleVerifyOtp}
                loading={isLoading}
                disabled={otpTimer === 0}
                fullWidth
                size="lg"
                style={styles.actionBtn}
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the OTP?</Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={cooldownTimer > 0}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <RefreshCw size={14} color={cooldownTimer > 0 ? Colors.textMuted : Colors.primary} />
                  <Text style={[styles.resendBtnText, cooldownTimer > 0 && { color: Colors.textMuted }]}>
                    {cooldownTimer > 0 ? `Resend available in ${cooldownTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer Security Badge */}
          <View style={styles.securityBadge}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={styles.securityText}>256-Bit Cryptographically Secure Passwordless Auth</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { flexGrow: 1, padding: Spacing.base },
  header: { alignItems: 'center', paddingTop: Spacing.lg, paddingBottom: Spacing.base },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  logoText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary,
  },
  welcomeText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginTop: Spacing.md,
    width: '100%',
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.base,
  },
  roleTabActive: {
    backgroundColor: Colors.primary,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  roleTabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  form: { marginTop: Spacing.sm },
  prefixText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginRight: 8 },
  studentInfoBox: {
    backgroundColor: Colors.primary + '08',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    marginBottom: Spacing.base,
  },
  studentInfoTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  actionBtn: { marginTop: Spacing.sm },
  verifyHeaderBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
  },
  verifyTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  verifySubtitle: { fontSize: 13, color: Colors.textSecondary },
  boldPhone: { fontWeight: '700', color: Colors.primary },
  changeNumberText: { fontSize: 12, color: Colors.secondary, fontWeight: '600', marginTop: 6 },
  otpInput: { textAlign: 'center', letterSpacing: 8, fontSize: 20, fontWeight: '800' },
  timerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 12 },
  timerLabel: { fontSize: 13, color: Colors.textMuted },
  timerValue: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  resendContainer: { alignItems: 'center', marginTop: Spacing.xl },
  resendText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  resendBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.base,
  },
  securityText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
});

export default LoginScreen;
