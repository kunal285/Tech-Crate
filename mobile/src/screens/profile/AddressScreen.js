import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Building,
  Home,
  Briefcase,
  ChevronRight,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { Colors } from '../../theme';
import useAuthStore from '../../store/authStore';

const STORAGE_KEY_ADDRESSES = '@techcrate_saved_addresses';

const INITIAL_ADDRESSES = [
  {
    id: 'addr_1',
    name: 'Kunal Sharma',
    phone: '+91 98765 43210',
    type: 'Hostel / Campus',
    street: 'Hostel 4, Room B-208, Engineering Campus',
    city: 'Pilani',
    state: 'Rajasthan',
    pincode: '333031',
    isDefault: true,
  },
  {
    id: 'addr_2',
    name: 'Kunal Sharma',
    phone: '+91 98765 43210',
    type: 'Home',
    street: 'Plot 42, Green Park Avenue, Near Metro Station',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110016',
    isDefault: false,
  },
];

export default function AddressScreen({ navigation }) {
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const user = useAuthStore((state) => state.user);

  const loadAddresses = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_ADDRESSES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
          return;
        }
      }
      // If user profile has an address, merge it
      if (user?.address?.street) {
        const userAddr = {
          id: 'addr_user',
          name: user.name || 'Default Maker',
          phone: user.phone || '+91 98765 43210',
          type: 'Primary',
          street: user.address.street,
          city: user.address.city || 'Bengaluru',
          state: user.address.state || 'Karnataka',
          pincode: user.address.pincode || '560001',
          isDefault: true,
        };
        setAddresses([userAddr]);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const saveAddresses = async (newList) => {
    setAddresses(newList);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(newList));
    } catch {}
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveAddresses(updated);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this delivery address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filtered = addresses.filter((a) => a.id !== id);
            if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
              filtered[0].isDefault = true;
            }
            saveAddresses(filtered);
          },
        },
      ]
    );
  };

  const getTypeIcon = (type = '') => {
    const t = type.toLowerCase();
    if (t.includes('hostel') || t.includes('campus') || t.includes('college')) {
      return Building;
    }
    if (t.includes('work') || t.includes('lab') || t.includes('office')) {
      return Briefcase;
    }
    return Home;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Saved Addresses"
        showBack
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => navigation.navigate('AddAddress')}>
            <Plus size={20} color="#032762" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MapPin size={36} color="#032762" />
            </View>
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptySubtitle}>
              Add your delivery addresses (hostel, home, or maker lab) for faster checkout.
            </Text>
            <Button
              title="Add New Address"
              onPress={() => navigation.navigate('AddAddress')}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          addresses.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <View
                key={item.id}
                style={[styles.addressCard, item.isDefault && styles.addressCardDefault]}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeBadge}>
                    <TypeIcon size={13} color="#032762" />
                    <Text style={styles.typeBadgeText}>{item.type || 'Delivery'}</Text>
                  </View>
                  {item.isDefault ? (
                    <View style={styles.defaultPill}>
                      <CheckCircle2 size={12} color="#16A34A" />
                      <Text style={styles.defaultPillText}>Default Delivery</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.setDefaultText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.recipientName}>{item.name}</Text>
                <Text style={styles.addressStreet}>{item.street}</Text>
                <Text style={styles.addressCity}>
                  {item.city}, {item.state} - {item.pincode}
                </Text>
                <Text style={styles.phoneText}>Mobile: {item.phone}</Text>

                <View style={styles.cardFooter}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}>
                    <Trash2 size={14} color="#DC2626" />
                    <Text style={styles.deleteBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.addNewCardBtn}
          onPress={() => navigation.navigate('AddAddress')}
          activeOpacity={0.8}>
          <Plus size={18} color="#032762" />
          <Text style={styles.addNewCardText}>Add Another Delivery Address</Text>
        </TouchableOpacity>
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
    gap: 12,
    paddingBottom: 40,
  },
  addHeaderBtn: {
    padding: 6,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressCardDefault: {
    borderColor: '#032762',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#032762',
  },
  defaultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  setDefaultText: {
    fontSize: 11.5,
    color: '#0284C7',
    fontWeight: '700',
  },
  recipientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  addressStreet: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  addressCity: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
    paddingTop: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  addNewCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginTop: 6,
  },
  addNewCardText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#032762',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
