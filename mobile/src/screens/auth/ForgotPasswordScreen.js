import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing} from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import authService from '../../services/authService';

const ForgotPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {setError('Email is required'); return;}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address'); return;
    }
    setIsLoading(true);
    const result = await authService.forgotPassword(email.trim().toLowerCase());
    setIsLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <Header title="Forgot Password" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        {sent ? (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>📧</Text>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to{'\n'}{email}
            </Text>
            <Text style={styles.helpText}>
              Please check your inbox and spam folder.
            </Text>
            <Button
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              fullWidth
              style={styles.btn}
            />
          </View>
        ) : (
          <>
            <Text style={styles.icon}>🔐</Text>
            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
            <Input
              label="Email Address"
              value={email}
              onChangeText={v => {setEmail(v); setError('');}}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
            />
            <Button
              title="Send Reset Link"
              onPress={handleSend}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.btn}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  content: {flex: 1, padding: Spacing.base, paddingTop: Spacing['2xl']},
  icon: {fontSize: 64, textAlign: 'center', marginBottom: Spacing.xl},
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
  },
  inputIcon: {fontSize: 18},
  btn: {marginTop: Spacing.base},
  successContainer: {alignItems: 'center', paddingTop: Spacing['2xl']},
  successIcon: {fontSize: 80, marginBottom: Spacing.xl},
  successTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
    marginBottom: Spacing.base,
  },
  successText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.base,
  },
  helpText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
});

export default ForgotPasswordScreen;
