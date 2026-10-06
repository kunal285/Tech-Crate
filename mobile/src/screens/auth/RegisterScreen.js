import React, { useState } from 'react';
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
import { Zap, Phone, User, GraduationCap, Building2, BookOpen, Mail } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuthStore from '../../store/authStore';

const RegisterScreen = ({ navigation }) => {
  const [accountType, setAccountType] = useState('customer'); // 'customer' or 'student'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [studentId, setStudentId] = useState('');
  const [errors, setErrors] = useState({});

  const { sendOtp, isLoading } = useAuthStore();

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
    if (!validate()) return;
    const result = await sendOtp(phone);
    if (result.success) {
      Alert.alert('OTP Sent', 'A 6-digit verification code has been sent to your mobile number.');
      navigation.navigate('Login');
    } else {
      Alert.alert('OTP Request Failed', result.message);
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
              Passwordless Mobile OTP Registration for Customers & Students
            </Text>

            {/* Account Type Selector */}
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
          </View>

          {/* Form */}
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
              By proceeding, an OTP will be sent to your mobile number for instant passwordless verification.
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
  icon: { fontSize: 18 },
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
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
