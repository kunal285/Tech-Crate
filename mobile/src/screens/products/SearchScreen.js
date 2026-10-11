import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Clock,
  Frown,
  Filter,
  ArrowUpDown,
  Tag,
  Check,
  Package,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import ProductCard from '../../components/product/ProductCard';
import useProductStore from '../../store/productStore';
import { CATEGORIES } from '../../constants';

const POPULAR_SEARCHES = ['Arduino', 'ESP32', 'Raspberry Pi', 'Sensors', 'Robotics Kit', 'IoT', 'Motors'];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
];

const EmptyState = ({ query, selectedCategoryName, onClearFilters, onSelectSearch }) => (
  <View style={styles.emptyState}>
    {query.length > 0 ? (
      <>
        <View style={styles.emptyIconCircle}>
          <Frown size={44} color={Colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>No results for "{query}"</Text>
        <Text style={styles.emptyDesc}>
          Try searching with other keywords or clear active category filters.
        </Text>
        {onClearFilters && (
          <TouchableOpacity style={styles.clearFilterBtn} onPress={onClearFilters}>
            <Text style={styles.clearFilterBtnText}>Clear All Filters</Text>
          </TouchableOpacity>
        )}
      </>
    ) : selectedCategoryName ? (
      <>
        <View style={styles.emptyIconCircle}>
          <Package size={44} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No items in {selectedCategoryName}</Text>
        <Text style={styles.emptyDesc}>
          We are restocking hardware in this category soon.
        </Text>
        {onClearFilters && (
          <TouchableOpacity style={styles.clearFilterBtn} onPress={onClearFilters}>
            <Text style={styles.clearFilterBtnText}>View All Products</Text>
          </TouchableOpacity>
        )}
      </>
    ) : (
      <>
        <View style={styles.emptyIconCircle}>
          <Search size={44} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Explore TechCrate Catalog</Text>
        <Text style={styles.emptyDesc}>
          Discover microcontrollers, robotics parts, sensors and DIY kits
        </Text>
        <Text style={styles.suggestionTitle}>Popular Searches</Text>
        <View style={styles.chips}>
          {POPULAR_SEARCHES.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => onSelectSearch(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    )}
  </View>
);

const SearchScreen = ({ navigation, route }) => {
  const initialCatId =
    route?.params?.categoryId ||
    route?.params?.category ||
    (route?.params?.categoryName
      ? CATEGORIES.find(
          c => c.name.toLowerCase() === route.params.categoryName.toLowerCase(),
        )?.id
      : null) ||
    null;

  const [query, setQuery] = useState(route?.params?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCatId);
  const [selectedSort, setSelectedSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);

  const {
    products,
    searchResults,
    isSearching,
    search,
    clearSearch,
    fetchProducts,
  } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Handle route param changes dynamically
  useEffect(() => {
    if (route?.params?.categoryId || route?.params?.category) {
      const cat = route.params.categoryId || route.params.category;
      setSelectedCategory(cat);
    }
    if (route?.params?.query) {
      setQuery(route.params.query);
      search(route.params.query);
    }
  }, [route?.params, search]);

  const handleSearch = useCallback(
    text => {
      setQuery(text);
      if (text.length >= 2) {
        search(text, { categoryId: selectedCategory });
      } else if (text.length === 0) {
        clearSearch();
      }
    },
    [search, clearSearch, selectedCategory],
  );

  const navigateToProduct = product => {
    navigation.navigate('ProductDetail', { productId: product._id, product });
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    if (query.length >= 2) {
      search(query, { categoryId: null });
    }
  };

  // Resolve active category object
  const activeCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return (
      CATEGORIES.find(
        c =>
          c.id === selectedCategory ||
          c.name.toLowerCase() === String(selectedCategory).toLowerCase(),
      ) || { id: selectedCategory, name: selectedCategory }
    );
  }, [selectedCategory]);

  // Determine items to display
  const displayItems = useMemo(() => {
    let list = [];
    const q = query.trim().toLowerCase();

    if (q.length >= 2) {
      if (searchResults && searchResults.length > 0) {
        list = [...searchResults];
      } else {
        // Local fallback search on products list
        list = products.filter(
          p =>
            p.name?.toLowerCase().includes(q) ||
            p.title?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q),
        );
      }
    } else {
      // No active search text -> use products list
      list = [...products];
    }

    // Apply category filter if active
    if (selectedCategory) {
      const targetCat = String(selectedCategory).toLowerCase();
      list = list.filter(p => {
        const cat = String(p.category || '').toLowerCase();
        const catId = String(p.categoryId || '').toLowerCase();
        return (
          cat === targetCat ||
          catId === targetCat ||
          cat.includes(targetCat) ||
          targetCat.includes(cat)
        );
      });
    }

    // Apply sorting
    if (selectedSort === 'price_asc') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (selectedSort === 'price_desc') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    }

    return list;
  }, [query, searchResults, products, selectedCategory, selectedSort]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header Search Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityLabel="Go back">
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Search size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search products, kits, sensors..."
            placeholderTextColor={Colors.textMuted}
            autoFocus={!initialCatId && !route?.params?.query}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                clearSearch();
              }}
              style={{ padding: 4 }}
              accessibilityLabel="Clear text">
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
          accessibilityLabel="Toggle category filters">
          <SlidersHorizontal
            size={18}
            color={showFilters ? Colors.primary : Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Carousel (Shown when filter active or when category is selected) */}
      {(showFilters || selectedCategory) && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterHeaderRow}>
            <Text style={styles.filterTitle}>Categories</Text>
            {selectedCategory && (
              <TouchableOpacity onPress={handleClearCategory}>
                <Text style={styles.clearCategoryText}>Clear Category</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item.id;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  onPress={() => {
                    const nextCat = isSelected ? null : item.id;
                    setSelectedCategory(nextCat);
                    if (query.length >= 2) {
                      search(query, { categoryId: nextCat });
                    }
                  }}>
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextActive,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.filterChipList}
          />
        </View>
      )}

      {/* Sort Options Strip */}
      <View style={styles.sortBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroll}>
          <View style={styles.sortLabelContainer}>
            <ArrowUpDown size={13} color={Colors.textSecondary} />
            <Text style={styles.sortLabel}>Sort:</Text>
          </View>
          {SORT_OPTIONS.map(opt => {
            const active = selectedSort === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortChip, active && styles.sortChipActive]}
                onPress={() => setSelectedSort(opt.id)}>
                <Text
                  style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Filter Pill Bar */}
      {selectedCategory && activeCategoryObj && (
        <View style={styles.activeBanner}>
          <View style={styles.activePill}>
            <Tag size={12} color={Colors.primary} />
            <Text style={styles.activePillText}>{activeCategoryObj.name}</Text>
            <TouchableOpacity
              onPress={handleClearCategory}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.resultsCountText}>
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      )}

      {/* Loading Indicator */}
      {isSearching && (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Searching catalog...</Text>
        </View>
      )}

      {/* Product Grid Results */}
      {!isSearching && (
        <FlatList
          data={displayItems}
          keyExtractor={(item, index) => item._id || item.id || `prod_${index}`}
          numColumns={2}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              query={query}
              selectedCategoryName={activeCategoryObj?.name}
              onClearFilters={() => {
                setQuery('');
                setSelectedCategory(null);
                clearSearch();
              }}
              onSelectSearch={handleSearch}
            />
          }
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => navigateToProduct(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.sm,
  },
  backBtn: {
    padding: 6,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 42,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  filtersPanel: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
  },
  filterTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearCategoryText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterChipList: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginHorizontal: 3,
    backgroundColor: Colors.surfaceElevated,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  sortBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: 6,
  },
  sortScroll: {
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    gap: 6,
  },
  sortLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  sortLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.normal,
  },
  sortChipTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  activeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  activePillText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  resultsCountText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
  },
  resultsList: {
    padding: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['2xl'],
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.base,
    maxWidth: 260,
    lineHeight: 18,
  },
  clearFilterBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.base,
    marginTop: Spacing.xs,
  },
  clearFilterBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  suggestionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  chipText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default SearchScreen;
