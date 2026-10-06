import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import { useWishlistStore } from '../../store/wishlistStore';

export default function WishlistScreen({ navigation }) {
  const items = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`Wishlist (${items.length})`} showBack />
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved items in your wishlist</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {items.map((product) => (
            <TouchableOpacity
              key={product._id}
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
            >
              <Image source={{ uri: product.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.img} />
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
                <Text style={styles.price}>₹{product.price}</Text>
                <TouchableOpacity onPress={() => removeFromWishlist(product._id)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>Remove from Wishlist</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  scrollContent: { padding: 16 },
  card: { flexDirection: 'row', backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  img: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.surfaceVariant },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  price: { fontSize: 16, fontWeight: '800', color: colors.primary },
  removeBtn: { marginTop: 4 },
  removeText: { color: colors.error, fontSize: 12, fontWeight: '600' },
});
