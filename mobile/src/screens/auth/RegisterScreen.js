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
import {
  Phone,
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Mail,
  Lock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuthStore from '../../store/authStore';
import firebaseAuthService from '../../services/firebaseAuthService';

const RegisterScreen = ({ navigation }) => {
  const [accountType, setAccountType] = useState('customer'); // 'customer' or 'student'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [errors, setErrors] = useState({});

  // 2-Step OTP Verification State
  const [step, setStep] = useState(1); // 1: Form details, 2: Enter OTP
  const [otp, setOtp] = useState('');
  const [firebaseSessionInfo, setFirebaseSessionInfo] = useState('');
  const [authMode, setAuthMode] = useState('firebase');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes
  const [cooldownTimer, setCooldownTimer] = useState(0); // 30s resend cooldown

  const { sendOtp, firebaseRegister, verifyOtp, isLoading, clearError } = useAuthStore();

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

  // 30-Second Resend Cooldown
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

  const validate = () => {
    const newErrors = {};
    if (!name.trim() || name.trim().length < 2)
      newErrors.name = 'Full name must be at least 2 characters';
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10)
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Enter a valid email address';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartOtpRegistration = async () => {
    clearError();
    if (!validate()) return;

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
      setAuthMode('direct');
      const result = await sendOtp(phone);
      if (result.success) {
        setMaskedPhone(result.data.maskedPhone || `+91 ******${phone.slice(-4)}`);
        setStep(2);
        setOtpTimer(300);
        setCooldownTimer(30);
      } else {
        Alert.alert('Registration Request', result.message);
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
        Alert.alert('OTP Resent', 'A new verification code has been dispatched.');
      } else {
        Alert.alert('Resend Failed', result.message);
      }
    } else {
      const result = await sendOtp(phone);
      if (result.success) {
        setOtpTimer(300);
        setCooldownTimer(30);
        Alert.alert('OTP Resent', 'A new verification code has been sent.');
      } else {
        Alert.alert('Resend Failed', result.message);
      }
    }
  };

  const handleVerifyAndRegister = async () => {
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
      // 1. Verify OTP with Firebase
      const fbResult = await firebaseAuthService.verifyOtpAndGetIdToken(
        firebaseSessionInfo,
        otp
      );

      if (!fbResult.success) {
        Alert.alert('Verification Failed', fbResult.message);
        return;
      }

      // 2. Register account on backend with verified Firebase ID Token
      const regResult = await firebaseRegister({
        idToken: fbResult.idToken,
        name: name.trim(),
        email: email.trim(),
        accountType,
        college: college.trim(),
        branch: branch.trim(),
        studentId: studentId.trim(),
      });

      if (!regResult.success) {
        Alert.alert('Registration Failed', regResult.message);
      }
    } else {
      // Direct verification fallback
      const result = await verifyOtp({
        phoneNumber: phone,
        otp,
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
            <Text style={styles.titleText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              {step === 1
                ? 'Passwordless Mobile Verification for Customers & Students'
                : 'Enter 6-digit verification code to complete setup'}
            </Text>

            {/* Account Type Selector (Step 1 only) */}
            {step === 1 && (
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[styles.roleTab, accountType === 'customer' && styles.roleTabActive]}
                  onPress={() => setAccountType('customer')}>
                  <User size={16} color={accountType === 'customer' ? Colors.white : Colors.textMuted} />
                  <Text style={[styles.roleTabText, accountType === 'customer' && styles.roleTabTextActive]}>
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roleTab, accountType === 'student' && styles.roleTabActive]}
                  onPress={() => setAccountType('student')}>
                  <GraduationCap size={16} color={accountType === 'student' ? Colors.white : Colors.textMuted} />
                  <Text style={[styles.roleTabText, accountType === 'student' && styles.roleTabTextActive]}>
                    Student
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Step 1: Account Registration Form */}
          {step === 1 && (
            <View style={styles.form}>
              <Input
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                autoCapitalize="words"
                error={errors.name}
                required
                leftIcon={<User size={18} color={Colors.textMuted} />}
              />

              <Input
                label="Mobile Number"
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, ''))}
                placeholder="9876543210"
                keyboardType="number-pad"
                maxLength={10}
                error={errors.phone}
                required
                leftIcon={<Text style={styles.prefixText}>+91</Text>}
              />

              <Input
                label="Email Address (Optional)"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Mail size={18} color={Colors.textMuted} />}
              />

              {accountType === 'student' && (
                <View style={styles.studentBox}>
                  <Text style={styles.studentBoxTitle}>Academic & Student Information</Text>
                  <Input
                    label="College / University"
                    value={college}
                    onChangeText={setCollege}
                    placeholder="IIT Bombay / VJTI Mumbai"
                    leftIcon={<Building2 size={18} color={Colors.primary} />}
                  />
                  <Input
                    label="Branch / Course"
                    value={branch}
                    onChangeText={setBranch}
                    placeholder="Electrical & Electronics"
                    leftIcon={<BookOpen size={18} color={Colors.primary} />}
                  />
                  <Input
                    label="Student ID / Roll No (Optional)"
                    value={studentId}
                    onChangeText={setStudentId}
                    placeholder="2026-EE-1049"
                    leftIcon={<GraduationCap size={18} color={Colors.primary} />}
                  />
                </View>
              )}

              <Text style={styles.termsText}>
                An OTP will be sent to your mobile number via Firebase Phone Authentication for instant verification.
              </Text>

              <Button
                title="Send Registration OTP"
                onPress={handleStartOtpRegistration}
                loading={isLoading}
                fullWidth
                size="lg"
                style={styles.registerBtn}
              />
            </View>
          )}

          {/* Step 2: Enter Verification Code */}
          {step === 2 && (
            <View style={styles.form}>
              <View style={styles.verifyHeaderBox}>
                <Text style={styles.verifyTitle}>Verify Mobile Number</Text>
                <Text style={styles.verifySubtitle}>
                  OTP sent to <Text style={styles.boldPhone}>{maskedPhone}</Text>
                </Text>
                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text style={styles.changeNumberText}>Edit Information</Text>
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
                title="Verify & Complete Registration"
                onPress={handleVerifyAndRegister}
                loading={isLoading}
                disabled={otpTimer === 0}
                fullWidth
                size="lg"
                style={styles.registerBtn}
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

          {/* Security Badge */}
          <View style={styles.securityBadge}>
            <ShieldCheck size={16} color="#10B981" />
            <Text style={styles.securityText}>Official Firebase Phone Authentication Protected</Text>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login with OTP</Text>
            </TouchableOpacity>
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
  logoText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary,
  },
  titleText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.base,
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
  roleTabActive: { backgroundColor: Colors.primary },
  roleTabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  roleTabTextActive: { color: Colors.white, fontWeight: '700' },
  form: { marginTop: Spacing.sm },
  prefixText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginRight: 8 },
  studentBox: {
    backgroundColor: Colors.primary + '08',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    marginBottom: Spacing.base,
  },
  studentBoxTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  termsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.base,
  },
  registerBtn: { marginTop: Spacing.xs },
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
    marginTop: Spacing.xl,
  },
  securityText: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
  loginText: { fontSize: Typography.fontSize.base, color: Colors.textSecondary },
  loginLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default RegisterScreen;
