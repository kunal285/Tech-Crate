import React, {useState} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuthStore from '../../store/authStore';

const RegisterScreen = ({navigation}) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const {register, isLoading, clearError} = useAuthStore();

  const updateForm = (key, value) => setForm(prev => ({...prev, [key]: value}));

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      newErrors.name = 'Full name must be at least 2 characters';
    if (!form.email.trim())
      newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Enter a valid email address';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.password)
      newErrors.password = 'Password is required';
    else if (form.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      newErrors.password = 'Password must contain uppercase, lowercase and a number';
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      password: form.password,
      role: 'customer',
    });
    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
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
              <View style={styles.logoIcon}>
                <Text style={styles.logoIconText}>⚡</Text>
              </View>
              <Text style={styles.logoText}>ProjectKart</Text>
            </View>
            <Text style={styles.titleText}>Create Account 🚀</Text>
            <Text style={styles.subtitleText}>
              Join thousands of makers, students and engineers
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={form.name}
              onChangeText={v => updateForm('name', v)}
              placeholder="John Doe"
              autoCapitalize="words"
              error={errors.name}
              required
              leftIcon={<Text style={styles.icon}>👤</Text>}
            />
            <Input
              label="Email Address"
              value={form.email}
              onChangeText={v => updateForm('email', v)}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
              leftIcon={<Text style={styles.icon}>✉️</Text>}
            />
            <Input
              label="Mobile Number (Optional)"
              value={form.phone}
              onChangeText={v => updateForm('phone', v)}
              placeholder="9876543210"
              keyboardType="number-pad"
              maxLength={10}
              error={errors.phone}
              leftIcon={<Text style={styles.icon}>📱</Text>}
            />
            <Input
              label="Password"
              value={form.password}
              onChangeText={v => updateForm('password', v)}
              placeholder="Min. 8 characters"
              secureTextEntry={!showPassword}
              error={errors.password}
              required
              leftIcon={<Text style={styles.icon}>🔒</Text>}
              rightIcon={<Text style={styles.icon}>{showPassword ? '👁️' : '🙈'}</Text>}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
            <Input
              label="Confirm Password"
              value={form.confirmPassword}
              onChangeText={v => updateForm('confirmPassword', v)}
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirm}
              error={errors.confirmPassword}
              required
              leftIcon={<Text style={styles.icon}>🔒</Text>}
              rightIcon={<Text style={styles.icon}>{showConfirm ? '👁️' : '🙈'}</Text>}
              onRightIconPress={() => setShowConfirm(!showConfirm)}
            />

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <Button
              title="Create Account"
              onPress={handleRegister}
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
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {flex: 1, backgroundColor: Colors.white},
  scroll: {flexGrow: 1, padding: Spacing.base},
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoRow: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl},
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.sm,
  },
  logoIconText: {fontSize: 22},
  logoText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary,
  },
  titleText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitleText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {marginTop: Spacing.sm},
  icon: {fontSize: 18},
  termsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.base,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  registerBtn: {marginTop: Spacing.xs},
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  loginText: {fontSize: Typography.fontSize.base, color: Colors.textSecondary},
  loginLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default RegisterScreen;
