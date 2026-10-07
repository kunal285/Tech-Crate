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
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuthStore from '../../store/authStore';
import CaptchaBox from '../../components/common/CaptchaBox';
import socialAuthService from '../../services/socialAuthService';

const generateCaptchaCode = () => {
  // 5 characters avoiding confusing symbols like 0, O, 1, I
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const RegisterScreen = ({ navigation }) => {
  const register = useAuthStore(state => state.register);
  const socialAuth = useAuthStore(state => state.socialAuth);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptchaCode());

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState('customer'); // 'customer' or 'student'
  const [errors, setErrors] = useState({});

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setCaptchaInput('');
    if (errors.captcha) {
      setErrors((prev) => ({ ...prev, captcha: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Name validation
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters)';
    }

    // 2. Mobile No validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    // 3. Email validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 4. Password validation
    if (!password) {
      newErrors.password = 'Please enter a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // 5. Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // 6. Captcha validation
    if (!captchaInput.trim()) {
      newErrors.captcha = 'Please enter the captcha code';
    } else if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      newErrors.captcha = 'Incorrect captcha code. Please try again.';
      handleRefreshCaptcha();
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    const result = await register({
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      role: accountType,
    });

    if (result.success) {
      Alert.alert(
        'Registration Successful',
        'Welcome to TechCrate! Your account has been created.',
        [{ text: 'Continue', onPress: () => { } }]
      );
    } else {
      Alert.alert(
        'Registration Failed',
        result.message || 'Unable to complete registration. Please try again.'
      );
      handleRefreshCaptcha();
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    const result = await socialAuthService.signInWithGoogle();
    if (result.cancelled) {
      // Return cleanly without showing an error modal
      return;
    }

    if (result.success && result.account) {
      const authRes = await socialAuth({
        ...result.account,
        role: accountType,
      });
      if (!authRes.success) {
        Alert.alert('Google Sign-In', authRes.message || 'Registration failed');
      }
    } else if (result.message) {
      Alert.alert('Google Sign-In', result.message);
    }
  };

  const handleFacebookSignIn = async () => {
    clearError();
    const result = await socialAuthService.signInWithFacebook();
    if (result.cancelled) return;

    if (result.success && result.account) {
      const authRes = await socialAuth({
        ...result.account,
        role: accountType,
      });
      if (!authRes.success) {
        Alert.alert('Facebook Sign-In', authRes.message || 'Registration failed');
      }
    } else if (result.message) {
      Alert.alert('Facebook Sign-In', result.message);
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
                source={require('../../assets/images/TechCrate.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              {/* <View>
                <Text style={styles.logoTitle}>
                  <Text style={styles.logoTech}>Tech</Text>
                  <Text style={styles.logoCrate}> Crate</Text>
                </Text>
              </View> */}
            </View>

            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Register with your details & captcha code
            </Text>

            {/* Account Type Selector */}
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleTab, accountType === 'customer' && styles.roleTabActive]}
                onPress={() => setAccountType('customer')}>
                <User size={15} color={accountType === 'customer' ? Colors.white : Colors.textMuted} />
                <Text style={[styles.roleTabText, accountType === 'customer' && styles.roleTabTextActive]}>
                  Customer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleTab, accountType === 'student' && styles.roleTabActive]}
                onPress={() => setAccountType('student')}>
                <GraduationCap size={15} color={accountType === 'student' ? Colors.white : Colors.textMuted} />
                <Text style={[styles.roleTabText, accountType === 'student' && styles.roleTabTextActive]}>
                  Student
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* 1. Full Name */}
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              autoCapitalize="words"
              leftIcon={<User size={19} color={Colors.textSecondary} />}
              error={errors.name}
              required
            />

            {/* 2. Mobile No */}
            <Input
              label="Mobile Number"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={(text) => {
                const numeric = text.replace(/\D/g, '').slice(0, 10);
                setPhone(numeric);
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
              keyboardType="phone-pad"
              maxLength={10}
              leftIcon={<Phone size={19} color={Colors.textSecondary} />}
              error={errors.phone}
              required
            />

            {/* 3. Email */}
            <Input
              label="Email Address"
              placeholder="e.g. name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Mail size={19} color={Colors.textSecondary} />}
              error={errors.email}
              required
            />

            {/* 4. Password */}
            <Input
              label="Password"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon={<Lock size={19} color={Colors.textSecondary} />}
              rightIcon={
                showPassword ? (
                  <EyeOff size={19} color={Colors.textSecondary} />
                ) : (
                  <Eye size={19} color={Colors.textSecondary} />
                )
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
              required
            />

            {/* 5. Confirm Password */}
            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              leftIcon={<Lock size={19} color={Colors.textSecondary} />}
              rightIcon={
                showConfirmPassword ? (
                  <EyeOff size={19} color={Colors.textSecondary} />
                ) : (
                  <Eye size={19} color={Colors.textSecondary} />
                )
              }
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              error={errors.confirmPassword}
              required
            />

            {/* 6. Captcha Security Verification */}
            <View style={styles.captchaSection}>
              <Text style={styles.captchaLabel}>
                Security Captcha <Text style={styles.requiredStar}>*</Text>
              </Text>
              <CaptchaBox
                captchaCode={captchaCode}
                onRefresh={handleRefreshCaptcha}
              />
              <Input
                placeholder="Type the 5 characters above"
                value={captchaInput}
                onChangeText={(text) => {
                  setCaptchaInput(text.toUpperCase());
                  if (errors.captcha) setErrors({ ...errors, captcha: null });
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                leftIcon={<ShieldCheck size={19} color={Colors.primary} />}
                error={errors.captcha}
                containerStyle={{ marginBottom: Spacing.sm }}
              />
            </View>

            {/* Submit Register Button */}
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.submitBtn}
            />

            {/* Social Registration Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or register with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Registration Buttons */}
            <View style={styles.socialButtonsRow}>
              <TouchableOpacity
                style={styles.googleBtn}
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}>
                <View style={styles.googleIconCircle}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.facebookBtn}
                activeOpacity={0.8}
                onPress={handleFacebookSignIn}>
                <View style={styles.facebookIconCircle}>
                  <Text style={styles.facebookIconText}>f</Text>
                </View>
                <Text style={styles.facebookBtnText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoImage: {
    width: 200,
    height: 100,
    marginRight: Spacing.sm + 2,
  },
  logoTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.5,
  },
  logoTech: {
    color: '#2563EB', // Tech Blue
    fontWeight: '800',
  },
  logoCrate: {
    color: '#16A34A', // Crate Green
    fontWeight: '800',
  },
  logoSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  welcomeText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
    padding: 3,
    width: '100%',
    maxWidth: 280,
    marginTop: Spacing.xs,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: Colors.primary,
    ...Shadows.sm,
  },
  roleTabText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textMuted,
  },
  roleTabTextActive: {
    color: Colors.white,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  captchaSection: {
    marginBottom: Spacing.sm,
  },
  captchaLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  requiredStar: {
    color: Colors.error,
  },
  submitBtn: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  googleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  googleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA4335',
  },
  googleBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  facebookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#1877F2',
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  facebookIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  facebookIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1877F2',
  },
  facebookBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default RegisterScreen;
