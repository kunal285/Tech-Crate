import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing } from '../../theme';

const OrderSuccessScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Order Placed" />
      <View style={styles.content}>
        <Text style={styles.icon}>🎉</Text>
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>Thank you for buying from ProjectKart.</Text>
        <TouchableOpacity 
          style={styles.homeBtn}
          onPress={() => navigation.navigate('HomeMain')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', flex: 1 },
  icon: { fontSize: 64, marginBottom: Spacing.md },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.textMuted, marginTop: Spacing.sm, textAlign: 'center', marginBottom: Spacing.xl },
  homeBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: 12 },
  homeBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.md },
});

export default OrderSuccessScreen;
