import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Package, Heart, Zap, Store, GraduationCap, ChevronRight, LogOut } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { title: 'My Orders & Shipments', IconComp: Package, action: () => navigation.navigate('OrderHistory') },
    { title: 'My Saved Wishlist', IconComp: Heart, action: () => navigation.navigate('Wishlist') },
    { title: 'Compatibility Checker Tool', IconComp: Zap, action: () => navigation.navigate('CompatibilityChecker') },
    { title: 'Seller Mode / Store Management', IconComp: Store, action: () => navigation.navigate('SellerDashboard') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Maker Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || 'Rahul Sharma'}</Text>
          <Text style={styles.email}>{user?.email || 'student@projectkart.com'}</Text>
          <View style={styles.collegeBadge}>
            <GraduationCap size={14} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.collegeText}>{user?.college || 'BITS Pilani'} • {user?.branch || 'Computer Science'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuBox}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuRow} onPress={item.action}>
              <View style={styles.menuTitleRow}>
                <item.IconComp size={18} color={colors.primary} style={{ marginRight: 12 }} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={18} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={16} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
  profileCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 2, borderColor: colors.primary },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  collegeBadge: { marginTop: 10, backgroundColor: colors.surfaceVariant, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  collegeText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  menuBox: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuTitleRow: { flexDirection: 'row', alignItems: 'center' },
  menuTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  logoutBtn: { backgroundColor: colors.error + '15', padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: colors.error + '30' },
  logoutText: { color: colors.error, fontSize: 14, fontWeight: '800' },
});
