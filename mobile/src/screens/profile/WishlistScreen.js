import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react-native';
import Header from '../../components/common/Header';
import SafeImage from '../../components/common/SafeImage';
import Button from '../../components/common/Button';
import { Colors } from '../../theme';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';

export default function WishlistScreen({ navigation }) {
  const items = useWishlistStore((state) => state.items || []);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist || state.removeItem
  );
  const addToCart = useCartStore((state) => state.addToCart || state.addItem);

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product, 1);
      Alert.alert(
        'Added to Cart',
        `"${product.title || product.name}" moved to your shopping cart!`,
        [
          { text: 'Keep Browsing', style: 'cancel' },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('Cart', { screen: 'CartMain' }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Cart Error', err?.message || 'Could not add to cart');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Wishlist (${items.length})`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Heart size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Save your favorite microcontrollers, project kits and sensors here to revisit anytime.
          </Text>
          <Button
            title="Browse Hardware"
            type="primary"
            onPress={() => navigation.navigate('Home', { screen: 'HomeMain' })}
            style={styles.emptyBtn}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((rawItem, idx) => {
            const product = rawItem.product || rawItem;
            const productId = product._id || rawItem.productId || `item_${idx}`;
            const title = product.title || product.name || 'Component';
            const price = Number(product.price) || 0;

            return (
              <TouchableOpacity
                key={productId}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('ProductDetail', {
                    productId,
                    product,
                  })
                }
                accessibilityLabel={title}
              >
                <SafeImage
                  source={product.images?.[0] || product.image || product.imageUrl}
                  style={styles.img}
                  resizeMode="contain"
                  placeholderIcon={Package}
                />

                <View style={styles.info}>
                  <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={2}>
                      {title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFromWishlist(productId)}
                      style={styles.removeBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Remove from wishlist"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => handleMoveToCart(product)}
                      style={styles.addToCartBtn}
                      activeOpacity={0.8}
                    >
                      <ShoppingCart size={14} color="#1E3A5F" />
                      <Text style={styles.addToCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  img: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    padding: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E3A5F',
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A5F',
  },
});
