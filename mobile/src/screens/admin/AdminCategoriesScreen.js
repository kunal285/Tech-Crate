import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing } from '../../theme';

const AdminCategoriesScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Header title="Manage Categories" showBack onBackPress={() => navigation.goBack()} />
    <View style={styles.content}>
      <Text style={styles.title}>Categories & Subcategories</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text },
});

export default AdminCategoriesScreen;
