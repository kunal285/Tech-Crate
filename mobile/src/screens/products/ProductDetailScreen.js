import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Dimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Heart,
  Package,
  Zap,
  Check,
  CheckCircle,
  Share2,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  FileText,
  ChevronRight,
  ExternalLink,
  Plus,
  Minus,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import SafeImage from '../../components/common/SafeImage';
import { Colors } from '../../theme';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { productService } from '../../services/productService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { productId, product: initialProduct } = route.params || {};
  const activeId = productId || initialProduct?._id;

  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Cart & Wishlist hooks
  const addItemToCart = useCartStore((state) => state.addToCart || state.addItem);
  const cartItems = useCartStore((state) => state.items || []);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist || state.toggleItem
  );
  const isInWishlist = useWishlistStore((state) =>
    activeId ? state.isInWishlist(activeId) : false
  );

  // Fetch product data
  const loadProduct = useCallback(async () => {
    if (!activeId) {
      setLoading(false);
      return;
    }
    try {
      if (!initialProduct) setLoading(true);
      const res = await productService.getProduct(activeId);
      const fetched = res?.data?.product || res?.data || res;
      if (fetched && (fetched._id || fetched.title)) {
        setProduct(fetched);
        setSelectedImageIndex(0);

        // Fetch related or compatible items
        if (fetched.category) {
          try {
            const relRes = await productService.getProducts({
              category: fetched.category,
              limit: 6,
            });
            const items = relRes?.data?.products || (Array.isArray(relRes?.data) ? relRes.data : []);
            setRelatedProducts(items.filter((p) => p._id !== activeId).slice(0, 5));
          } catch {
            // ignore non-critical related fetch error
          }
        }
      }
    } catch (err) {
      console.error('[ProductDetail] Error loading product:', err);
    } finally {
      setLoading(false);
    }
  }, [activeId, initialProduct]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Handle Share
  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        title: product.title,
        message: `Check out ${product.title} on TechCrate for ₹${product.price}!\nHigh quality hardware component for makers & engineers.`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  // Add to cart
  const handleAddToCart = async (openCartAfter = false) => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addItemToCart(
        {
          _id: product._id,
          productId: product._id,
          title: product.title,
          name: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || product.image || product.imageUrl,
          images: product.images || [],
          stock: product.stock ?? 10,
        },
        quantity
      );

      if (openCartAfter) {
        navigation.navigate('Cart', { screen: 'CartMain' });
      } else {
        Alert.alert(
          'Added to Cart',
          `${quantity}x "${product.title}" added to your shopping cart.`,
          [
            { text: 'Keep Browsing', style: 'cancel' },
            {
              text: 'View Cart',
              onPress: () => navigation.navigate('Cart', { screen: 'CartMain' }),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Cart Error', err?.message || 'Could not add product to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(true);
  };

  const handleOpenDatasheet = () => {
    if (product?.datasheetUrl) {
      Linking.openURL(product.datasheetUrl).catch(() => {
        Alert.alert('Datasheet', 'Unable to open datasheet URL.');
      });
    } else {
      Alert.alert(
        'Datasheet & Pinout',
        `Detailed specs for ${product?.title}:\n\n` +
        `• Operating Voltage: ${product?.specifications?.operatingVoltage || '5V DC'}\n` +
        `• Pin Count: ${product?.specifications?.pinCount || 'Standard DIP/SMD'}\n` +
        `• Interface: ${product?.specifications?.interface || 'I2C / SPI / GPIO'}\n` +
        `• Dimensions: ${product?.specifications?.dimensions || 'Standard Form Factor'}\n` +
        `• Weight: ${product?.specifications?.weight || '30g'}`
      );
    }
  };

  if (loading && !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary || '#1E3A5F'} />
        <Text style={styles.loadingText}>Loading hardware specifications...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Header title="Product Details" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundContainer}>
          <Package size={52} color={Colors.textMuted || '#94A3B8'} />
          <Text style={styles.notFoundTitle}>Component Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This hardware item may be unavailable or out of stock.
          </Text>
          <Button
            title="Browse All Hardware"
            type="primary"
            onPress={() => navigation.goBack()}
            style={styles.browseBtn}
          />
        </View>
      </View>
    );
  }

  // Media preparation
  const imageList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || product.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'];

  const activeImageSource = imageList[selectedImageIndex] || imageList[0];
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 5;
  const originalPrice = Number(product.originalPrice) || 0;
  const price = Number(product.price) || 0;
  const hasDiscount = originalPrice > price;
  const discountPercent =
    product.discountPercentage ||
    (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const savingsAmount = hasDiscount ? originalPrice - price : 0;

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <Header
        title={product.category || 'Product Specs'}
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => toggleWishlist(product)}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
              accessibilityLabel="Add to Wishlist"
            >
              <Heart
                size={21}
                color={isInWishlist ? '#EF4444' : (Colors.textPrimary || '#0F172A')}
                fill={isInWishlist ? '#EF4444' : 'transparent'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
              accessibilityLabel="Share Product"
            >
              <Share2 size={20} color={Colors.textPrimary || '#0F172A'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Cart', { screen: 'CartMain' })}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
              accessibilityLabel="Shopping Cart"
            >
              <ShoppingCart size={21} color={Colors.textPrimary || '#0F172A'} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Product Showcase Box */}
        <View style={styles.showcaseCard}>
          <View style={styles.imageContainer}>
            <SafeImage
              source={activeImageSource}
              style={styles.productImage}
              resizeMode="contain"
              placeholderIcon={Cpu}
              placeholderText={product.category || 'Component'}
            />

            {/* Overlaid Badges */}
            <View style={styles.overlayBadges}>
              {hasDiscount && (
                <View style={styles.discountBadge}>
                  <Sparkles size={11} color="#FFFFFF" style={styles.sparklesIcon} />
                  <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                </View>
              )}
              {isLowStock && (
                <View style={styles.lowStockBadge}>
                  <Text style={styles.lowStockText}>Only {product.stock} Left!</Text>
                </View>
              )}
            </View>

            {/* Image Counter Badge */}
            {imageList.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {selectedImageIndex + 1} / {imageList.length}
                </Text>
              </View>
            )}
          </View>

          {/* Thumbnail Strip */}
          {imageList.length > 1 && (
            <View style={styles.thumbnailRow}>
              {imageList.map((img, idx) => {
                const isSelected = idx === selectedImageIndex;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedImageIndex(idx)}
                    activeOpacity={0.75}
                    style={[
                      styles.thumbnailCard,
                      isSelected && styles.thumbnailCardSelected,
                    ]}
                  >
                    <SafeImage
                      source={img}
                      style={styles.thumbnailImg}
                      resizeMode="cover"
                      placeholderIcon={Cpu}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Title, Brand & Ratings Section */}
        <View style={styles.detailsCard}>
          <View style={styles.metaTopRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {product.category || 'Hardware'}
              </Text>
            </View>
            <View
              style={[
                styles.stockPill,
                isOutOfStock ? styles.stockPillOut : styles.stockPillIn,
              ]}
            >
              <View
                style={[
                  styles.stockDot,
                  isOutOfStock ? styles.stockDotOut : styles.stockDotIn,
                ]}
              />
              <Text
                style={[
                  styles.stockPillText,
                  isOutOfStock ? styles.stockPillTextOut : styles.stockPillTextIn,
                ]}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : isLowStock
                    ? `Low Stock (${product.stock})`
                    : 'In Stock'}
              </Text>
            </View>
          </View>

          <Text style={styles.productTitle}>{product.title}</Text>

          {/* Rating and Seller Info */}
          <View style={styles.ratingAndSellerRow}>
            <TouchableOpacity
              style={styles.ratingBox}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Reviews')}
            >
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingValue}>{product.rating || 4.8}</Text>
              <Text style={styles.ratingCount}>
                ({product.reviewCount || 38} reviews)
              </Text>
              <ChevronRight size={13} color={Colors.textMuted || '#94A3B8'} />
            </TouchableOpacity>

            <View style={styles.sellerTag}>
              <ShieldCheck size={13} color="#059669" />
              <Text style={styles.sellerName}>Verified Partner</Text>
            </View>
          </View>

          {/* Pricing Box */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.mainPrice}>{price.toLocaleString('en-IN')}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </Text>
              )}
            </View>
            {hasDiscount && savingsAmount > 0 && (
              <View style={styles.savingsPill}>
                <Text style={styles.savingsText}>
                  You Save ₹{savingsAmount.toLocaleString('en-IN')} ({discountPercent}%)
                </Text>
              </View>
            )}
            <Text style={styles.taxNote}>
              Inclusive of all taxes (GST) • 100% Genuine Maker Component
            </Text>
          </View>

          {/* Value Propositions / Guarantees Strip */}
          <View style={styles.guaranteeStrip}>
            <View style={styles.guaranteeItem}>
              <Truck size={17} color={Colors.primary || '#1E3A5F'} />
              <Text style={styles.guaranteeTitle}>Fast Dispatch</Text>
              <Text style={styles.guaranteeSub}>Within 24 Hours</Text>
            </View>
            <View style={styles.guaranteeDivider} />
            <View style={styles.guaranteeItem}>
              <ShieldCheck size={17} color="#059669" />
              <Text style={styles.guaranteeTitle}>100% Genuine</Text>
              <Text style={styles.guaranteeSub}>Tested Hardware</Text>
            </View>
            <View style={styles.guaranteeDivider} />
            <View style={styles.guaranteeItem}>
              <RotateCcw size={17} color={Colors.primary || '#1E3A5F'} />
              <Text style={styles.guaranteeTitle}>7-Day Warranty</Text>
              <Text style={styles.guaranteeSub}>Easy Replacement</Text>
            </View>
          </View>
        </View>

        {/* Technical & Electrical Specifications Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Zap size={18} color={Colors.primary || '#1E3A5F'} />
              <Text style={styles.cardTitle}>Electrical & Tech Specs</Text>
            </View>
            <TouchableOpacity
              onPress={handleOpenDatasheet}
              style={styles.datasheetBtn}
              activeOpacity={0.7}
            >
              <FileText size={13} color="#2563EB" />
              <Text style={styles.datasheetBtnText}>Datasheet</Text>
              <ExternalLink size={11} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <View style={styles.specsTable}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Operating Voltage</Text>
              <Text style={styles.specValue}>
                {product.specifications?.operatingVoltage || '3.3V – 5.0V DC'}
              </Text>
            </View>
            <View style={[styles.specRow, styles.specRowAlt]}>
              <Text style={styles.specLabel}>Pin Configuration</Text>
              <Text style={styles.specValue}>
                {product.specifications?.pinCount || 'Standard Breadboard Headers'}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Communication Protocol</Text>
              <Text style={styles.specValue}>
                {product.specifications?.interface || 'I2C / SPI / UART / GPIO'}
              </Text>
            </View>
            <View style={[styles.specRow, styles.specRowAlt]}>
              <Text style={styles.specLabel}>Category Type</Text>
              <Text style={styles.specValue}>{product.category || 'Component'}</Text>
            </View>
            {product.specifications?.dimensions && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Dimensions</Text>
                <Text style={styles.specValue}>
                  {product.specifications.dimensions}
                </Text>
              </View>
            )}
            {product.specifications?.weight && (
              <View style={[styles.specRow, styles.specRowAlt]}>
                <Text style={styles.specLabel}>Net Weight</Text>
                <Text style={styles.specValue}>{product.specifications.weight}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Compatibility Verified For */}
        {((product.compatibilityTags && product.compatibilityTags.length > 0) ||
          true) && (
            <View style={styles.card}>
              <View style={styles.cardHeaderLeft}>
                <Cpu size={18} color={Colors.primary || '#1E3A5F'} />
                <Text style={styles.cardTitle}>Compatibility Verified With</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Pre-tested with standard prototyping microcontrollers & dev boards:
              </Text>
              <View style={styles.tagsContainer}>
                {(product.compatibilityTags && product.compatibilityTags.length > 0
                  ? product.compatibilityTags
                  : [
                    'Arduino Uno & Nano',
                    'ESP32 & ESP8266',
                    'Raspberry Pi 4 / 5',
                    'STM32 BluePill',
                    'Solderless Breadboard',
                  ]
                ).map((tag, idx) => (
                  <View key={idx} style={styles.tagPill}>
                    <Check size={12} color="#059669" style={styles.tagCheckIcon} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Key Features & Highlights */}
        {((product.features && product.features.length > 0) || true) && (
          <View style={styles.card}>
            <View style={styles.cardHeaderLeft}>
              <Layers size={18} color={Colors.primary || '#1E3A5F'} />
              <Text style={styles.cardTitle}>Key Features & Highlights</Text>
            </View>
            <View style={styles.featuresList}>
              {(product.features && product.features.length > 0
                ? product.features
                : [
                  'Factory calibrated with high precision output',
                  'Breadboard friendly 2.54mm pitch terminal pins',
                  'Low power consumption, ideal for battery-operated IoT nodes',
                  'Robust ESD protection and reverse polarity tolerance',
                  'Full open-source code libraries and schematics available',
                ]
              ).map((feat, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <CheckCircle
                    size={16}
                    color="#0284C7"
                    style={styles.featureCheckIcon}
                  />
                  <Text style={styles.featureText}>{feat}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Detailed Product Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description & Pinout Details</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={isDescExpanded ? undefined : 4}
          >
            {product.description ||
              'High quality hardware module designed for hobbyists, engineers, and educational robotics. Provides accurate performance with easy interfacing for microcontrollers.'}
          </Text>
          {product.description && product.description.length > 180 && (
            <TouchableOpacity
              onPress={() => setIsDescExpanded(!isDescExpanded)}
              style={styles.readMoreBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.readMoreText}>
                {isDescExpanded ? 'Show Less' : 'Read Full Description'}
              </Text>
              <ChevronRight
                size={14}
                color="#2563EB"
                style={{
                  transform: [{ rotate: isDescExpanded ? '-90deg' : '90deg' }],
                }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Related / Compatible Items */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Frequently Bought Together</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SearchStack', {
                    screen: 'SearchMain',
                    params: { category: product.category },
                  })
                }
              >
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {relatedProducts.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.relatedCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.push('ProductDetail', {
                      productId: item._id,
                      product: item,
                    })
                  }
                >
                  <SafeImage
                    source={item.images?.[0] || item.image || item.imageUrl}
                    style={styles.relatedImage}
                    resizeMode="contain"
                    placeholderIcon={Cpu}
                  />
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.relatedCardPrice}>₹{item.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Fixed Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        {/* Quantity Stepper */}
        {!isOutOfStock && (
          <View style={styles.qtyControl}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.qtyBtn}
              activeOpacity={0.7}
              disabled={quantity <= 1}
            >
              <Minus
                size={14}
                color={quantity <= 1 ? '#CBD5E1' : (Colors.textPrimary || '#0F172A')}
              />
            </TouchableOpacity>
            <Text style={styles.qtyNumber}>{quantity}</Text>
            <TouchableOpacity
              onPress={() =>
                setQuantity(
                  Math.min(product.stock !== undefined ? product.stock : 50, quantity + 1)
                )
              }
              style={styles.qtyBtn}
              activeOpacity={0.7}
              disabled={
                product.stock !== undefined && quantity >= product.stock
              }
            >
              <Plus size={14} color={Colors.textPrimary || '#0F172A'} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        {isOutOfStock ? (
          <View style={styles.outOfStockBar}>
            <Text style={styles.outOfStockBarText}>Currently Out of Stock</Text>
          </View>
        ) : (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={() => handleAddToCart(false)}
              disabled={isAdding}
              style={styles.addToCartBtn}
              activeOpacity={0.85}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#1E3A5F" />
              ) : (
                <>
                  <ShoppingCart size={17} color="#1E3A5F" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBuyNow}
              disabled={isAdding}
              style={styles.buyNowBtn}
              activeOpacity={0.85}
            >
              <Zap size={17} color="#FFFFFF" />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
  },
  notFoundSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingTop: 8,
  },
  showcaseCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
  },
  imageContainer: {
    width: '100%',
    height: 310,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: SCREEN_WIDTH - 32,
    height: 290,
  },
  overlayBadges: {
    position: 'absolute',
    top: 12,
    left: 16,
    flexDirection: 'column',
    gap: 6,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  lowStockBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowStockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  thumbnailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  thumbnailCard: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  thumbnailCardSelected: {
    borderColor: '#0284C7',
    borderWidth: 2,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stockPillIn: {
    backgroundColor: '#ECFDF5',
  },
  stockPillOut: {
    backgroundColor: '#FEF2F2',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  stockDotIn: {
    backgroundColor: '#10B981',
  },
  stockDotOut: {
    backgroundColor: '#EF4444',
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stockPillTextIn: {
    color: '#059669',
  },
  stockPillTextOut: {
    color: '#DC2626',
  },
  productTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 25,
    marginBottom: 8,
  },
  ratingAndSellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748B',
  },
  sellerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A5F',
    marginRight: 2,
  },
  mainPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E3A5F',
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  savingsPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  taxNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  guaranteeStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guaranteeItem: {
    flex: 1,
    alignItems: 'center',
  },
  guaranteeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  guaranteeSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  guaranteeDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  datasheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  datasheetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  specsTable: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  specRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  specLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  specValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    flex: 1.2,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  featuresList: {
    marginTop: 10,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    flex: 1,
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginTop: 6,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  relatedSection: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  relatedScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  relatedCard: {
    width: 130,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  relatedImage: {
    width: '100%',
    height: 90,
    marginBottom: 6,
  },
  relatedCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    height: 28,
  },
  relatedCardPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A5F',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 10,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyBtn: {
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  qtyNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 22,
    textAlign: 'center',
  },
  outOfStockBar: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  actionButtonsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingVertical: 12,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  buyNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingVertical: 12,
  },
  buyNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  browseBtn: {
    marginTop: 16,
  },
  sparklesIcon: {
    marginRight: 3,
  },
  tagCheckIcon: {
    marginRight: 5,
  },
  featureCheckIcon: {
    marginTop: 2,
    marginRight: 8,
    flexShrink: 0,
  },
});
