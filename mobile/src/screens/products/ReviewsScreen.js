import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import { Colors, Typography, Spacing } from '../../theme';

const ReviewsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Header title="Reviews & Ratings" showBack onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.title}>Customer Reviews</Text>
        <Text style={styles.subtitle}>⭐ 4.8 / 5.0 (24 reviews)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.text },
  subtitle: { fontSize: Typography.fontSize.md, color: Colors.textMuted, marginTop: 4 },
});

export default ReviewsScreen;
