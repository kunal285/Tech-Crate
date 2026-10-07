import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Clock,
  Frown,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import ProductCard from '../../components/product/ProductCard';
import useProductStore from '../../store/productStore';
import { CATEGORIES } from '../../constants';

const POPULAR_SEARCHES = ['Arduino', 'ESP32', 'Raspberry Pi', 'Sensors', 'Robotics Kit', 'IoT'];

const SearchScreen = ({ navigation, route }) => {
  const [query, setQuery] = useState(route?.params?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);

  const { searchResults, isSearching, search, clearSearch } = useProductStore();

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

  const EmptyState = () => (
    <View style={styles.emptyState}>
      {query.length === 0 ? (
        <>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Search size={56} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Search TechCrate</Text>
          <Text style={styles.emptyDesc}>Find components, project kits, and tutorials</Text>

          <Text style={styles.suggestionTitle}>Popular Searches</Text>
          <View style={styles.chips}>
            {POPULAR_SEARCHES.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.chip}
                onPress={() => { setQuery(s); search(s); }}>
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Frown size={56} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptyDesc}>Try different keywords or browse categories</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Search size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search products, projects, kits..."
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); clearSearch(); }} style={{ padding: 4 }}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={18} color={showFilters ? Colors.primary : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterTitle}>Categories</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCategory === item.id && styles.filterChipActive,
                ]}
                onPress={() => {
                  const newCat = selectedCategory === item.id ? null : item.id;
                  setSelectedCategory(newCat);
                  if (query) search(query, { categoryId: newCat });
                }}>
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === item.id && styles.filterChipTextActive,
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.filterChipList}
          />
        </View>
      )}

      {/* Results Count */}
      {searchResults.length > 0 && query.length > 0 && (
        <View style={styles.resultsCount}>
          <Text style={styles.resultsText}>
            {searchResults.length} results for "{query}"
          </Text>
        </View>
      )}

      {/* Loading */}
      {isSearching && (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Results */}
      {!isSearching && (
        <FlatList
          data={searchResults}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigateToProduct(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.white, paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm, gap: Spacing.sm, ...Shadows.sm,
  },
  backBtn: { fontSize: 22, color: Colors.textPrimary, padding: 4 },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base, borderWidth: 1, borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: Spacing.xs },
  input: { flex: 1, paddingVertical: Spacing.md, fontSize: Typography.fontSize.base, color: Colors.textPrimary },
  clearBtn: { fontSize: 16, color: Colors.textMuted, padding: 4 },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: Colors.primary + '20' },
  filterBtnText: { fontSize: 18 },
  filtersPanel: {
    backgroundColor: Colors.white, paddingVertical: Spacing.sm, ...Shadows.sm,
  },
  filterTitle: {
    fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm,
  },
  filterChipList: { paddingHorizontal: Spacing.sm },
  filterChip: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base, paddingVertical: 6, marginHorizontal: 4,
    backgroundColor: Colors.white,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary, fontWeight: Typography.fontWeight.medium },
  filterChipTextActive: { color: Colors.white },
  resultsCount: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, backgroundColor: Colors.white },
  resultsText: { fontSize: Typography.fontSize.sm, color: Colors.textSecondary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm },
  loadingText: { fontSize: Typography.fontSize.sm, color: Colors.textMuted },
  resultsList: { padding: Spacing.sm },
  emptyState: { flex: 1, padding: Spacing.base, paddingTop: Spacing['2xl'] },
  emptyIcon: { fontSize: 64, textAlign: 'center', marginBottom: Spacing.base },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  emptyDesc: { fontSize: Typography.fontSize.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing['2xl'] },
  suggestionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.base },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  chip: {
    backgroundColor: Colors.primary + '10', borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base, paddingVertical: 8, borderWidth: 1, borderColor: Colors.primary + '30',
  },
  chipText: { fontSize: Typography.fontSize.sm, color: Colors.primary, fontWeight: Typography.fontWeight.medium },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  recentIcon: { fontSize: 16, marginRight: Spacing.base },
  recentText: { fontSize: Typography.fontSize.base, color: Colors.textSecondary },
});

export default SearchScreen;
