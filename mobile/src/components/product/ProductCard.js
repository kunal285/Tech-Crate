import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Heart, Star, Check, X, ShoppingCart, Package } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import SafeImage from '../common/SafeImage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.base * 2 - Spacing.sm) / 2;

const ProductCard = ({ product, onPress, horizontal = false, style }) => {
  const addItem = useCartStore(state => state.addItem);
  const toggleItem = useWishlistStore(state => state.toggleItem);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  const productId = product?._id;
  const inWishlist = isInWishlist(productId);

  const handleAddToCart = useCallback(
    e => {
      e?.stopPropagation?.();
      if (product) addItem(product, 1);
    },
    [product, addItem],
  );

  const handleWishlist = useCallback(
    e => {
      e?.stopPropagation?.();
      if (product) toggleItem(product);
    },
    [product, toggleItem],
  );

  if (!product) return null;

  const title = product.name || product.title || 'Product';
  const brand = product.brand || (typeof product.category === 'string' ? product.category : 'Tech Crate');
  const price = product.price ?? 0;
  const originalPrice = product.originalPrice;
  const discountPercent =
    product.discountPercentage ||
    (originalPrice && originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : null);

  if (horizontal) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.horizontalCard, style]}>
        <View style={styles.horizontalImageContainer}>
          <SafeImage
            source={product.images || product.image || product.imageUrl}
            style={styles.horizontalImage}
            resizeMode="contain"
            placeholderIcon={Package}
            placeholderText={brand}
          />
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.brandText} numberOfLines={1}>
            {brand}
          </Text>
          <Text style={styles.nameText} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.ratingRow}>
            <Star size={12} color={Colors.star || '#F59E0B'} fill={Colors.star || '#F59E0B'} />
            <Text style={styles.ratingText}>
              {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
            </Text>
            <Text style={styles.reviewCount}>
              ({product.reviewCount || 0})
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price.toLocaleString()}</Text>
            {originalPrice ? (
              <Text style={styles.originalPrice}>
                ₹{originalPrice.toLocaleString()}
              </Text>
            ) : null}
            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPercent}% off</Text>
              </View>
            )}
          </View>
          <View style={styles.stockRow}>
            <Text
              style={[
                styles.stockText,
                product.stock > 0 ? styles.inStock : styles.outOfStock,
              ]}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleWishlist}
          style={styles.wishlistBtnHorizontal}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Heart size={18} color={inWishlist ? '#EF4444' : Colors.textMuted} fill={inWishlist ? '#EF4444' : 'none'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { width: CARD_WIDTH }, style]}>
      {/* Product Image Container with Badges & Wishlist */}
      <View style={styles.imageContainer}>
        <SafeImage
          source={product.images || product.image || product.imageUrl}
          style={styles.image}
          resizeMode="contain"
          placeholderIcon={Package}
          placeholderText={brand}
        />

        {/* Badges */}
        <View style={styles.badges}>
          {discountPercent > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
          {product.stock === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>Sold Out</Text>
            </View>
          )}
        </View>

        {/* Wishlist Button */}
        <TouchableOpacity
          onPress={handleWishlist}
          style={styles.wishlistBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Heart size={16} color={inWishlist ? '#EF4444' : Colors.textMuted} fill={inWishlist ? '#EF4444' : 'none'} />
        </TouchableOpacity>
      </View>

      {/* Product Info Section (Pure Flex Flow) */}
      <View style={styles.content}>
        <Text style={styles.brandText} numberOfLines={1}>
          {brand}
        </Text>
        <Text style={styles.nameText} numberOfLines={2}>
          {title}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Star size={12} color={Colors.star || '#F59E0B'} fill={Colors.star || '#F59E0B'} />
          <Text style={styles.ratingText}>
            {product.rating ? Number(product.rating).toFixed(1) : '4.5'}
          </Text>
          <Text style={styles.reviewCount}>
            ({product.reviewCount || 0})
          </Text>
        </View>

        {/* Price & Original Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price.toLocaleString()}</Text>
          {originalPrice && originalPrice > price ? (
            <Text style={styles.originalPrice}>
              ₹{originalPrice.toLocaleString()}
            </Text>
          ) : null}
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          style={[
            styles.addToCartBtn,
            product.stock === 0 && styles.addToCartDisabled,
          ]}>
          <Text style={styles.addToCartText}>
            {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white || '#FFFFFF',
    borderRadius: BorderRadius.base || 12,
    overflow: 'hidden',
    margin: Spacing.xs || 6,
    borderWidth: 1,
    borderColor: (Colors.border || '#E2E8F0') + '80',
    ...(Shadows.md || {}),
  },
  imageContainer: {
    width: '100%',
    height: 135,
    backgroundColor: Colors.surfaceElevated || '#F8FAFC',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badges: {
    position: 'absolute',
    top: Spacing.xs || 8,
    left: Spacing.xs || 8,
    gap: 4,
    zIndex: 2,
  },
  discountBadge: {
    backgroundColor: Colors.secondary || '#F97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  outOfStockBadge: {
    backgroundColor: Colors.error || '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  wishlistBtn: {
    position: 'absolute',
    top: Spacing.xs || 8,
    right: Spacing.xs || 8,
    backgroundColor: Colors.white || '#FFFFFF',
    borderRadius: 16,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    ...(Shadows.sm || {}),
  },
  heartIcon: { fontSize: 13 },
  content: {
    padding: Spacing.sm || 10,
    justifyContent: 'space-between',
  },
  brandText: {
    fontSize: 10,
    color: Colors.textMuted || '#94A3B8',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nameText: {
    fontSize: Typography.fontSize.sm || 13,
    color: Colors.textPrimary || '#0F172A',
    fontWeight: '600',
    lineHeight: 18,
    height: 36,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starIcon: { fontSize: 11, color: Colors.star || '#F59E0B' },
  ratingText: {
    fontSize: 11,
    color: Colors.textSecondary || '#475569',
    fontWeight: '600',
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 11,
    color: Colors.textMuted || '#94A3B8',
    marginLeft: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: Typography.fontSize.base || 15,
    fontWeight: '800',
    color: Colors.primary || '#1E3A5F',
  },
  originalPrice: {
    fontSize: 11,
    color: Colors.textMuted || '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addToCartBtn: {
    backgroundColor: Colors.primary || '#1E3A5F',
    borderRadius: BorderRadius.sm || 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartDisabled: {
    backgroundColor: Colors.disabled || '#CBD5E1',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  // Horizontal layout styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white || '#FFFFFF',
    borderRadius: BorderRadius.base || 12,
    padding: Spacing.sm || 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: (Colors.border || '#E2E8F0') + '80',
    alignItems: 'center',
    ...(Shadows.sm || {}),
  },
  horizontalImageContainer: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.sm || 8,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated || '#F8FAFC',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalContent: {
    flex: 1,
    marginLeft: Spacing.sm || 10,
    paddingRight: Spacing.sm || 10,
  },
  stockRow: { marginTop: 2 },
  stockText: { fontSize: 10, fontWeight: '700' },
  inStock: { color: Colors.success || '#10B981' },
  outOfStock: { color: Colors.error || '#EF4444' },
  wishlistBtnHorizontal: {
    padding: 6,
  },
});

export default React.memo(ProductCard);
