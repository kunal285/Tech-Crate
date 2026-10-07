import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Package,
  Search,
  ChevronRight,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import SafeImage from '../../components/common/SafeImage';
import { productService } from '../../services/productService';

export default function AdminProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const res = await productService.getProducts({ limit: 50 });
      const list = res?.data?.products || (Array.isArray(res?.data) ? res.data : []);
      setProducts(list);
    } catch (err) {
      console.error('[AdminProducts] Error loading products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const renderProductItem = ({ item }) => {
    const isOut = item.stock !== undefined && item.stock <= 0;
    const isLow = item.stock !== undefined && item.stock > 0 && item.stock <= 5;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('ProductDetail', {
            productId: item._id,
            product: item,
          })
        }
      >
        <SafeImage
          source={item.images?.[0] || item.image || item.imageUrl}
          style={styles.cardImage}
          resizeMode="contain"
          placeholderIcon={Package}
        />

        <View style={styles.cardDetails}>
          <View style={styles.cardCategoryRow}>
            <Text style={styles.cardCategory}>{item.category || 'Component'}</Text>
            <View
              style={[
                styles.stockBadge,
                isOut
                  ? styles.stockBadgeOut
                  : isLow
                  ? styles.stockBadgeLow
                  : styles.stockBadgeIn,
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  isOut
                    ? styles.stockBadgeTextOut
                    : isLow
                    ? styles.stockBadgeTextLow
                    : styles.stockBadgeTextIn,
                ]}
              >
                {isOut ? 'Out of Stock' : `Stock: ${item.stock ?? 10}`}
              </Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.cardPriceRow}>
            <Text style={styles.cardPrice}>₹{item.price}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.cardOriginalPrice}>₹{item.originalPrice}</Text>
            )}
            <ChevronRight size={16} color="#94A3B8" style={styles.cardChevron} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Product Catalog" subtitle={`Total: ${products.length} Items`} />

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Search size={18} color="#94A3B8" />
        <TextInput
          placeholder="Search hardware, microcontrollers, sensors..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E3A5F" />
          <Text style={styles.loadingText}>Fetching system catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id || String(Math.random())}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Package size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'No hardware components registered in database'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeIn: {
    backgroundColor: '#ECFDF5',
  },
  stockBadgeLow: {
    backgroundColor: '#FEF3C7',
  },
  stockBadgeOut: {
    backgroundColor: '#FEF2F2',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockBadgeTextIn: {
    color: '#059669',
  },
  stockBadgeTextLow: {
    color: '#D97706',
  },
  stockBadgeTextOut: {
    color: '#DC2626',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E3A5F',
  },
  cardOriginalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  cardChevron: {
    marginLeft: 'auto',
  },
});
