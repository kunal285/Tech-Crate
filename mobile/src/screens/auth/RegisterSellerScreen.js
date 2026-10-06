import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing, BorderRadius} from '../../theme';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import {apiPost} from '../../services/api';

const RegisterSellerScreen = ({navigation}) => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    businessName: '', businessType: '', gstNumber: '', panNumber: '',
    bankAccount: '', ifscCode: '', accountHolderName: '',
    address: '', city: '', state: '', pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const updateForm = (key, value) => setForm(p => ({...p, [key]: value}));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit number required';
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = 'Required';
    if (!form.businessType.trim()) e.businessType = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const result = await apiPost('/auth/register-seller', {...form, role: 'seller'});
    setIsLoading(false);
    if (result.success) {
      Alert.alert(
        'Application Submitted! 🎉',
        'Your seller application has been submitted for review. We will contact you within 2-3 business days.',
        [{text: 'OK', onPress: () => navigation.navigate('Login')}],
      );
    } else {
      Alert.alert('Error', result.message || 'Failed to submit application');
    }
  };

  const icon = () => {
    switch (step) {
      case 1: return '👤';
      case 2: return '🏪';
      case 3: return '🏦';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <Header
        title="Seller Registration"
        onBack={step > 1 ? () => setStep(s => s - 1) : () => navigation.goBack()}
      />
      {/* Progress */}
      <View style={styles.progress}>
        {[1, 2, 3].map(s => (
          <View key={s} style={styles.progressStep}>
            <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
              <Text style={[styles.progressNum, step >= s && styles.progressNumActive]}>{s}</Text>
            </View>
            {s < 3 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
          </View>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepTitle}>
            {icon()} {step === 1 ? 'Personal Info' : step === 2 ? 'Business Info' : 'Bank Details'}
          </Text>

          {step === 1 && (
            <>
              <Input label="Full Name" value={form.name} onChangeText={v => updateForm('name', v)} placeholder="Your full name" error={errors.name} required />
              <Input label="Email" value={form.email} onChangeText={v => updateForm('email', v)} placeholder="business@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} required />
              <Input label="Mobile Number" value={form.phone} onChangeText={v => updateForm('phone', v)} placeholder="9876543210" keyboardType="number-pad" maxLength={10} error={errors.phone} required />
              <Input label="Password" value={form.password} onChangeText={v => updateForm('password', v)} placeholder="Min. 8 characters" secureTextEntry required error={errors.password} />
            </>
          )}

          {step === 2 && (
            <>
              <Input label="Business Name" value={form.businessName} onChangeText={v => updateForm('businessName', v)} placeholder="Your Shop / Company Name" error={errors.businessName} required />
              <Input label="Business Type" value={form.businessType} onChangeText={v => updateForm('businessType', v)} placeholder="e.g., Electronics, Components" error={errors.businessType} required />
              <Input label="GST Number (Optional)" value={form.gstNumber} onChangeText={v => updateForm('gstNumber', v)} placeholder="22AAAAA0000A1Z5" autoCapitalize="characters" />
              <Input label="PAN Number" value={form.panNumber} onChangeText={v => updateForm('panNumber', v)} placeholder="ABCDE1234F" autoCapitalize="characters" />
              <Input label="Business Address" value={form.address} onChangeText={v => updateForm('address', v)} placeholder="Complete address" multiline />
              <Input label="City" value={form.city} onChangeText={v => updateForm('city', v)} placeholder="City" />
              <Input label="State" value={form.state} onChangeText={v => updateForm('state', v)} placeholder="State" />
              <Input label="Pincode" value={form.pincode} onChangeText={v => updateForm('pincode', v)} placeholder="560001" keyboardType="number-pad" maxLength={6} />
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>💡 Your bank details are needed for payment settlements. All information is encrypted and secure.</Text>
              </View>
              <Input label="Account Holder Name" value={form.accountHolderName} onChangeText={v => updateForm('accountHolderName', v)} placeholder="As per bank records" />
              <Input label="Bank Account Number" value={form.bankAccount} onChangeText={v => updateForm('bankAccount', v)} placeholder="Account number" keyboardType="number-pad" />
              <Input label="IFSC Code" value={form.ifscCode} onChangeText={v => updateForm('ifscCode', v)} placeholder="SBIN0001234" autoCapitalize="characters" />

              <View style={styles.noteBox}>
                <Text style={styles.noteTitle}>📋 Note</Text>
                <Text style={styles.noteText}>Your account will be reviewed by our team within 2-3 business days. You'll receive an email notification once approved.</Text>
              </View>

              <Button title="Submit Application" onPress={handleSubmit} loading={isLoading} fullWidth size="lg" style={styles.submitBtn} />
            </>
          )}

          {step < 3 && (
            <Button title="Next →" onPress={handleNext} fullWidth size="lg" style={styles.nextBtn} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {flex: 1, backgroundColor: Colors.white},
  progress: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.base, paddingHorizontal: Spacing['2xl'],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  progressStep: {flexDirection: 'row', alignItems: 'center'},
  progressDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceElevated, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  progressDotActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  progressNum: {fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.textMuted},
  progressNumActive: {color: Colors.white},
  progressLine: {width: 40, height: 2, backgroundColor: Colors.border, marginHorizontal: Spacing.xs},
  progressLineActive: {backgroundColor: Colors.primary},
  scroll: {padding: Spacing.base, flexGrow: 1},
  stepTitle: {fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xl},
  infoBox: {backgroundColor: Colors.info + '10', borderRadius: BorderRadius.base, padding: Spacing.base, marginBottom: Spacing.base, borderLeftWidth: 3, borderLeftColor: Colors.info},
  infoText: {fontSize: Typography.fontSize.sm, color: Colors.info, lineHeight: 20},
  noteBox: {backgroundColor: Colors.warning + '10', borderRadius: BorderRadius.base, padding: Spacing.base, marginVertical: Spacing.base},
  noteTitle: {fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.warning, marginBottom: Spacing.xs},
  noteText: {fontSize: Typography.fontSize.sm, color: Colors.textSecondary, lineHeight: 20},
  nextBtn: {marginTop: Spacing.xl},
  submitBtn: {marginTop: Spacing.sm},
});

export default RegisterSellerScreen;
