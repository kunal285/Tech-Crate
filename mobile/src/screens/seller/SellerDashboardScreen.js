import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { CheckCircle2, Star, Plus, Package } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { sellerService } from '../../services/sellerService';

export default function SellerDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await sellerService.getSellerDashboard();
      setStats(data);
    } catch (err) {
      console.error(err);
      setStats({
        totalProducts: 12,
        totalOrders: 48,
        totalRevenue: 24500,
        totalItemsSold: 85,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Seller Storefront Control" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.heroCard}>
          <Text style={styles.storeName}>RoboTech Components Store</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <CheckCircle2 size={14} color={colors.surface} style={{ marginRight: 4 }} />
            <Text style={styles.storeBadge}>Verified Hardware Partner</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>₹{stats?.totalRevenue || 24500}</Text>
            <Text style={styles.statLabel}>Total Sales Revenue</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats?.totalOrders || 48}</Text>
            <Text style={styles.statLabel}>Fulfilling Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{stats?.totalProducts || 12}</Text>
            <Text style={styles.statLabel}>Active Components</Text>
          </View>
          <View style={styles.statBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.statVal}>4.9</Text>
              <Star size={16} color={colors.primary} fill={colors.primary} />
            </View>
            <Text style={styles.statLabel}>Store Rating</Text>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <Button
          title="Add New Component Listing"
          onPress={() => navigation.navigate('AddProduct')}
          style={{ marginBottom: 12 }}
        />
        <Button
          title="Manage Customer Orders"
          type="outline"
          onPress={() => navigation.navigate('ManageOrders')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
  heroCard: { backgroundColor: colors.primary, padding: 20, borderRadius: 16, marginBottom: 16 },
  storeName: { color: colors.surface, fontSize: 18, fontWeight: '900' },
  storeBadge: { color: colors.surface + 'DD', fontSize: 12, marginTop: 4, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  statVal: { fontSize: 20, fontWeight: '900', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});
