import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { productService } from '../../services/productService';

export default function AddProductScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Microcontrollers');
  const [stock, setStock] = useState('20');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !price || !description) {
      Alert.alert('Missing Fields', 'Please enter title, price, and description');
      return;
    }

    try {
      setLoading(true);
      await productService.createProduct({
        title,
        description,
        price: Number(price),
        category,
        stock: Number(stock),
        images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80'],
      });
      Alert.alert('Success', 'Hardware component published to TechCrate store!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Add Hardware Product" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input label="Component Title" placeholder="e.g. Raspberry Pi Pico W" value={title} onChangeText={setTitle} />
        <Input label="Price (₹)" keyboardType="numeric" placeholder="e.g. 499" value={price} onChangeText={setPrice} />
        <Input label="Stock Count" keyboardType="numeric" placeholder="20" value={stock} onChangeText={setStock} />
        <Input label="Category" placeholder="Microcontrollers / Sensors / Wireless" value={category} onChangeText={setCategory} />
        <Input label="Pinout & Specs Description" multiline numberOfLines={4} value={description} onChangeText={setDescription} />

        <Button title={loading ? 'Publishing...' : 'Publish Component to Marketplace'} loading={loading} onPress={handleSubmit} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
});
