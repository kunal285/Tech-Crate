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
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useAuthStore from '../../store/authStore';
import socialAuthService from '../../services/socialAuthService';

const LoginScreen = ({ navigation }) => {
  const login = useAuthStore(state => state.login);
  const socialAuth = useAuthStore(state => state.socialAuth);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const clearError = useAuthStore(state => state.clearError);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const trimmedUser = username.trim();

    if (!trimmedUser) {
      newErrors.username = 'Please enter your mobile number or email';
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUser);
      const cleanDigits = trimmedUser.replace(/\D/g, '');
      const isPhone = cleanDigits.length >= 10;

      if (!isEmail && !isPhone) {
        newErrors.username = 'Enter a valid 10-digit mobile number or email address';
      }
    }

    if (!password) {
      newErrors.password = 'Please enter your password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    const result = await login({
      username: username.trim(),
      password,
    });

    if (!result.success) {
      Alert.alert(
        'Login Failed',
        result.message || 'Invalid mobile number/email or password.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    const result = await socialAuthService.signInWithGoogle();
    if (result.cancelled) {
      // 10. If cancelled, return cleanly without error modal
      return;
    }

    if (result.success && result.account) {
      const authRes = await socialAuth(result.account);
      if (!authRes.success) {
        Alert.alert('Google Sign-In', authRes.message || 'Authentication failed');
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
      const authRes = await socialAuth(result.account);
      if (!authRes.success) {
        Alert.alert('Facebook Sign-In', authRes.message || 'Authentication failed');
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

          {/* Brand Header */}
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

            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              Sign in with your Mobile Number or Email
            </Text>
          </View>

          {/* Server Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username Field (Mobile No or Email) */}
            <Input
              label="Mobile Number or Email"
              placeholder="e.g. 9876543210 or user@example.com"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors({ ...errors, username: null });
              }}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<User size={20} color={Colors.textSecondary} />}
              error={errors.username}
              required
            />

            {/* Password Field */}
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon={<Lock size={20} color={Colors.textSecondary} />}
              rightIcon={
                showPassword ? (
                  <EyeOff size={20} color={Colors.textSecondary} />
                ) : (
                  <Eye size={20} color={Colors.textSecondary} />
                )
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
              error={errors.password}
              required
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.submitBtn}
            />

            {/* Social Authentication Section */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsRow}>
              {/* Google Login Button */}
              <TouchableOpacity
                style={styles.googleBtn}
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}>
                <View style={styles.googleIconCircle}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Google</Text>
              </TouchableOpacity>

              {/* Facebook Login Button */}
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
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Register Here</Text>
            </TouchableOpacity>
          </View>

          {/* Seller Link */}
          <TouchableOpacity
            style={styles.sellerLink}
            onPress={() => navigation.navigate('RegisterSeller')}>
            <Text style={styles.sellerLinkText}>Want to sell project kits? Join as Seller</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoImage: {
    width: 48,
    height: 48,
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
    fontWeight: Typography.fontWeight.medium,
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
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.base,
    marginTop: -4,
  },
  forgotText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  submitBtn: {
    marginBottom: Spacing.base,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
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
    marginTop: Spacing.lg,
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
  sellerLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sellerLinkText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
