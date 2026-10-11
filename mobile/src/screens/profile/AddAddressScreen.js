import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';

const STORAGE_KEY_ADDRESSES = '@techcrate_saved_addresses';

export default function AddAddressScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);

  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [type, setType] = useState('Hostel / Campus');
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addressTypes = ['Hostel / Campus', 'Home', 'Lab / Work'];

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter recipient name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Required Field', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!street.trim()) {
      Alert.alert('Required Field', 'Please enter street, hostel, or room address.');
      return;
    }
    if (!city.trim() || !pincode.trim() || pincode.trim().length < 6) {
      Alert.alert('Required Field', 'Please enter valid city and 6-digit PIN code.');
      return;
    }

    try {
      setIsSaving(true);
      const newAddress = {
        id: `addr_${Date.now()}`,
        name: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: stateName.trim() || 'India',
        pincode: pincode.trim(),
        type,
        isDefault,
      };

      const stored = await AsyncStorage.getItem(STORAGE_KEY_ADDRESSES);
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];

      if (isDefault || list.length === 0) {
        list = list.map((a) => ({ ...a, isDefault: false }));
        newAddress.isDefault = true;
      }

      list.unshift(newAddress);
      await AsyncStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(list));

      Alert.alert('Address Saved', 'Delivery address has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Add New Address"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Type Selector */}
        <Text style={styles.label}>Address Category</Text>
        <View style={styles.typeRow}>
          {addressTypes.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typePill, type === t && styles.typePillActive]}
              onPress={() => setType(t)}>
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Kunal Sharma"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="10-digit mobile number"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={14}
        />

        <Text style={styles.label}>Street / Hostel / Room / Building *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. Room 204, Ramanujan Hostel, Campus Block 2"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={3}
          value={street}
          onChangeText={setStreet}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bengaluru"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>PIN Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="6 digits"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={setPincode}
            />
          </View>
        </View>

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Karnataka"
          placeholderTextColor="#94A3B8"
          value={stateName}
          onChangeText={setStateName}
        />

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setIsDefault(!isDefault)}
          activeOpacity={0.8}>
          <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
            {isDefault && <Text style={styles.checkCheck}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Make this my default delivery address</Text>
        </TouchableOpacity>

        <Button
          title={isSaving ? 'Saving Address...' : 'Save Address'}
          onPress={handleSave}
          loading={isSaving}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    marginTop: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typePillActive: {
    backgroundColor: '#032762',
    borderColor: '#032762',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#032762',
    borderColor: '#032762',
  },
  checkCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
});
