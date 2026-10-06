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
import { Zap, Mail, Lock, Eye, EyeOff, Search, Store, KeyRound } from 'lucide-react-native';
import {Colors, Typography, Spacing, BorderRadius, Shadows} from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuthStore from '../../store/authStore';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const {login, isLoading, clearError} = useAuthStore();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!require2FA && !validate()) return;
    const result = await login({
      email: email.trim().toLowerCase(),
      password,
      totpCode: useRecovery ? undefined : totpCode,
      recoveryCode: useRecovery ? recoveryCode : undefined,
    });

    if (!result.success) {
      if (result.data?.require2FA) {
        setRequire2FA(true);
      } else {
        Alert.alert('Authentication Failed', result.message || 'Invalid email or password.');
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
              <View style={styles.logoIcon}>
                <Zap size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.logoText}>ProjectKart</Text>
            </View>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>
              Sign in to continue building amazing projects
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!require2FA ? (
              <>
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  leftIcon={<Mail size={18} color={Colors.textMuted} />}
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  leftIcon={<Lock size={18} color={Colors.textMuted} />}
                  rightIcon={
                    showPassword ? <EyeOff size={18} color={Colors.textMuted} /> : <Eye size={18} color={Colors.textMuted} />
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.mfaBox}>
                <View style={styles.mfaHeader}>
                  <KeyRound size={20} color={Colors.primary} />
                  <Text style={styles.mfaTitle}>Two-Factor Authentication Required</Text>
                </View>

                {!useRecovery ? (
                  <Input
                    label="6-Digit Authenticator Code"
                    value={totpCode}
                    onChangeText={v => setTotpCode(v.replace(/\D/g, ''))}
                    placeholder="000000"
                    keyboardType="number-pad"
                    maxLength={6}
                    leftIcon={<Lock size={18} color={Colors.primary} />}
                  />
                ) : (
                  <Input
                    label="Backup Recovery Code"
                    value={recoveryCode}
                    onChangeText={v => setRecoveryCode(v.toUpperCase())}
                    placeholder="XXXXXXXX"
                    autoCapitalize="characters"
                    leftIcon={<Lock size={18} color={Colors.primary} />}
                  />
                )}

                <TouchableOpacity
                  onPress={() => setUseRecovery(!useRecovery)}
                  style={{ marginBottom: 16 }}>
                  <Text style={styles.mfaToggleText}>
                    {useRecovery ? 'Use Authenticator App' : 'Use Recovery Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Button
              title={require2FA ? 'Verify 2FA' : 'Sign In'}
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.loginBtn}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <Search size={18} color={Colors.primary} />
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Seller Register Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterSeller')}
            style={styles.sellerLink}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Store size={16} color={Colors.primary} />
              <Text style={styles.sellerLinkText}>
                Become a Seller on ProjectKart
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.base,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  logoIconText: {fontSize: 22},
  logoText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary,
  },
  welcomeText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitleText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginTop: Spacing.sm,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.base,
  },
  forgotText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  mfaBox: {
    backgroundColor: Colors.primary + '08',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    marginBottom: 16,
  },
  mfaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mfaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  mfaToggleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.base,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.sm,
    backgroundColor: Colors.white,
  },
  googleText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  registerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  sellerLink: {
    alignItems: 'center',
    marginTop: Spacing.base,
    padding: Spacing.base,
    backgroundColor: Colors.primary + '08',
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  sellerLinkText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default LoginScreen;
