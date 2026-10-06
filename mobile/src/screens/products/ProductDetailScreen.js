import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Heart, Package, Zap } from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import SafeImage from '../../components/common/SafeImage';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { productService } from '../../services/productService';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(productId));

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Product Details" showBack />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Hardware item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = async () => {
    await addToCart({
      productId: product._id,
      itemType: 'product',
      quantity,
      price: product.price,
      title: product.title,
      image: product.images?.[0],
    });
    Alert.alert('Cart Updated', `${product.title} added to your shopping cart!`);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigation.navigate('CartTab', { screen: 'Cart' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Component Specs"
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={() => toggleWishlist(product)} style={{ padding: 4 }}>
            <Heart size={20} color={isInWishlist ? '#EF4444' : colors.text} fill={isInWishlist ? '#EF4444' : 'none'} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <SafeImage
          source={product?.images || product?.image || product?.imageUrl}
          style={styles.productImage}
          resizeMode="contain"
          placeholderIcon={Package}
          placeholderText={product?.category || 'Component'}
        />

        <View style={styles.infoSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product?.category}</Text>
          </View>

          <Text style={styles.title}>{product?.title}</Text>
          <Text style={styles.sellerText}>Sold by Verified Partner • RoboTech</Text>

          {/* Pricing Box */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product?.price}</Text>
            {product?.originalPrice > product?.price && (
              <>
                <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{product.discountPercentage || 30}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {/* Compatibility Tags */}
          {product?.compatibilityTags?.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.sectionTitle}>Compatibility Verified For:</Text>
              <View style={styles.tagsList}>
                {product.compatibilityTags.map((tag, idx) => (
                  <View key={idx} style={styles.tagPill}>
                    <Zap size={12} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Hardware Specifications */}
          <View style={styles.specsBox}>
            <Text style={styles.sectionTitle}>Electrical Specifications</Text>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Operating Voltage:</Text>
              <Text style={styles.specVal}>{product.specifications?.operatingVoltage || '5V DC'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Pin Configuration:</Text>
              <Text style={styles.specVal}>{product.specifications?.pinCount || 'Standard Headers'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Communication Protocol:</Text>
              <Text style={styles.specVal}>{product.specifications?.interface || 'I2C / SPI / GPIO'}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description & Pinout Info</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <Button title="Add to Cart" type="outline" onPress={handleAddToCart} style={{ flex: 1, marginRight: 8 }} />
          <Button title="Buy Now" type="primary" onPress={handleBuyNow} style={{ flex: 1 }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { color: colors.textSecondary, fontSize: 16 },
  scrollContent: { paddingBottom: 100 },
  productImage: { width: '100%', height: 280, resizeMode: 'cover' },
  infoSection: { padding: 16 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: colors.surfaceVariant, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  categoryText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  sellerText: { fontSize: 12, color: colors.textTertiary, marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  price: { fontSize: 24, fontWeight: '900', color: colors.primary, marginRight: 8 },
  originalPrice: { fontSize: 16, color: colors.textTertiary, textDecorationLine: 'line-through', marginRight: 8 },
  discountBadge: { backgroundColor: colors.success + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: colors.success, fontSize: 12, fontWeight: '700' },
  tagsContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8, marginTop: 8 },
  tagsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagPill: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  specsBox: { backgroundColor: colors.surface, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  specKey: { color: colors.textSecondary, fontSize: 13 },
  specVal: { color: colors.text, fontSize: 13, fontWeight: '600' },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, padding: 12, flexDirection: 'row', alignItems: 'center' },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginRight: 12 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  qtyText: { color: colors.text, fontSize: 14, fontWeight: '700', paddingHorizontal: 8 },
  actionButtons: { flex: 1, flexDirection: 'row' },
});
