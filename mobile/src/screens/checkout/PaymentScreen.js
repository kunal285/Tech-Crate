import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing } from '../../theme';

const PaymentScreen = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <Header title="Payment Options" showBack onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Select Payment Method</Text>
        <TouchableOpacity 
          style={styles.payBtn}
          onPress={() => navigation.navigate('OrderSuccess')}
        >
          <Text style={styles.payBtnText}>Pay & Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text, marginBottom: Spacing.lg },
  payBtn: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: 12, alignItems: 'center' },
  payBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.md },
});

export default PaymentScreen;
