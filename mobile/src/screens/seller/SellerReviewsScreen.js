import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing } from '../../theme';

const SellerReviewsScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Header title="Customer Reviews" />
    <View style={styles.content}>
      <Text style={styles.title}>Product Reviews & Feedback</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text },
});

export default SellerReviewsScreen;
