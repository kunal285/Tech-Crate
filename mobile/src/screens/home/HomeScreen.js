import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Zap,
  Bot,
  Heart,
  ShoppingCart,
  Search,
  Package,
  Rocket,
  Star,
  Sparkles,
  Cpu,
  Wrench,
  ChevronRight,
  Wifi,
  Radio,
  Eye,
  Globe,
  Database,
  Monitor,
  Hammer,
  Layers,
  AlertCircle,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { CATEGORIES } from '../../constants';
import useAuthStore from '../../store/authStore';
import useProductStore from '../../store/productStore';
import useProjectStore from '../../store/projectStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import usePosterStore from '../../store/posterStore';
import ProductCard from '../../components/product/ProductCard';
import ProjectCard from '../../components/project/ProjectCard';
import PosterCarousel from '../../components/home/PosterCarousel';

// Brand Color Palette
const BRAND = {
  primaryNavy: '#032762',
  secondaryBlue: '#034697',
  blue: '#0262B8',
  cyan: '#02C9CC',
  brightCyan: '#03E0E4',
  white: '#FFFFFF',
  darkNavy: '#061A3A',
  accentOrange: '#F97316',
};

// ============================================================================
// Skeleton & Placeholder Components
// ============================================================================

const ProductCardSkeleton = () => (
  <View style={styles.productSkeleton}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonContent}>
      <View style={[styles.skeletonLine, { width: '40%', height: 8, marginBottom: 6 }]} />
      <View style={[styles.skeletonLine, { width: '85%', height: 12, marginBottom: 4 }]} />
      <View style={[styles.skeletonLine, { width: '65%', height: 12, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '50%', height: 14, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '100%', height: 28, borderRadius: 6 }]} />
    </View>
  </View>
);

const ProjectKitSkeleton = () => (
  <View style={styles.kitSkeleton}>
    <View style={styles.kitSkeletonImage} />
    <View style={styles.skeletonContent}>
      <View style={[styles.skeletonLine, { width: '35%', height: 8, marginBottom: 6 }]} />
      <View style={[styles.skeletonLine, { width: '80%', height: 14, marginBottom: 6 }]} />
      <View style={[styles.skeletonLine, { width: '95%', height: 10, marginBottom: 4 }]} />
      <View style={[styles.skeletonLine, { width: '70%', height: 10, marginBottom: 10 }]} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={[styles.skeletonLine, { width: '35%', height: 16 }]} />
        <View style={[styles.skeletonLine, { width: '40%', height: 26, borderRadius: 6 }]} />
      </View>
    </View>
  </View>
);

const SectionEmptyState = ({ message, onRetry }) => (
  <View style={styles.emptyContainer}>
    <Package size={26} color="#94A3B8" style={{ marginBottom: 6 }} />
    <Text style={styles.emptyText}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Refresh</Text>
      </TouchableOpacity>
    )}
  </View>
);

const SectionErrorState = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <AlertCircle size={22} color="#EF4444" style={{ marginBottom: 4 }} />
    <Text style={styles.errorText}>{message || 'Unable to load items'}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ============================================================================
// Helpers
// ============================================================================

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Morning';
  if (h >= 12 && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  return 'Night';
};

const getCategoryIcon = id => {
  const map = {
    arduino: Cpu,
    esp32: Wifi,
    esp8266: Radio,
    'raspberry-pi': Cpu,
    sensors: Eye,
    robotics: Bot,
    iot: Globe,
    embedded: Database,
    motors: Wrench,
    displays: Monitor,
    communication: Radio,
    'dev-boards': Cpu,
    pcbs: Layers,
    power: Zap,
    components: Package,
    'project-kits': Package,
    'diy-kits': Hammer,
    tools: Wrench,
    modules: Cpu,
    accessories: Package,
  };
  return map[id] || Zap;
};

// ============================================================================
// Top-Level Subcomponents
// ============================================================================

const StatsRow = () => (
  <View style={styles.statsRow}>
    {[
      { IconComp: Package, value: '350+', label: 'Products' },
      { IconComp: Cpu, value: '10+', label: 'Projects' },
      { IconComp: Rocket, value: '1K+', label: 'Students' },
      { IconComp: Star, value: '4.3', label: 'Rating' },
    ].map((stat, i) => (
      <View key={i} style={styles.statCard}>
        <stat.IconComp size={18} color={BRAND.primaryNavy} style={styles.statIcon} />
        <Text style={styles.statValue} numberOfLines={1}>
          {stat.value}
        </Text>
        <Text style={styles.statLabel} numberOfLines={1}>
          {stat.label}
        </Text>
      </View>
    ))}
  </View>
);

const SectionHeader = ({ title, subtitle, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderTitleCol}>
      <Text style={styles.sectionTitle} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.sectionSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
    {onSeeAll && (
      <TouchableOpacity
        onPress={onSeeAll}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.seeAllBtn}>
        <Text style={styles.seeAll}>See All</Text>
        <ChevronRight size={13} color={BRAND.primaryNavy} />
      </TouchableOpacity>
    )}
  </View>
);

const CategoryCard = ({ category, onPress }) => {
  const IconComponent = getCategoryIcon(category.id);
  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={onPress}
      activeOpacity={0.75}>
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: (category.color || BRAND.primaryNavy) + '15' },
        ]}>
        <IconComponent size={22} color={category.color || BRAND.primaryNavy} />
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const AIBanner = ({ onPress }) => (
  <TouchableOpacity
    style={styles.aiBanner}
    onPress={onPress}
    activeOpacity={0.88}>
    <View style={styles.aiBannerLeft}>
      <View style={styles.aiLabelRow}>
        <Sparkles size={14} color={BRAND.accentOrange} />
        <Text style={styles.aiLabel}>AI Shopping Assistant</Text>
      </View>
      <Text style={styles.aiTitle}>Tell me your project!</Text>
      <Text style={styles.aiDesc}>
        Get component suggestions & budget estimates
      </Text>
    </View>
    <View style={styles.aiBannerRight}>
      <View style={styles.botCircle}>
        <Bot size={28} color="#FFFFFF" />
      </View>
    </View>
  </TouchableOpacity>
);

const BuilderBanner = ({ onPress }) => (
  <TouchableOpacity
    style={styles.builderBanner}
    onPress={onPress}
    activeOpacity={0.88}>
    <View style={styles.builderIconCircle}>
      <Wrench size={22} color={BRAND.accentOrange} />
    </View>
    <View style={styles.builderContent}>
      <Text style={styles.builderTitle}>Build Your Project</Text>
      <Text style={styles.builderDesc}>Step-by-step project configurator</Text>
    </View>
    <ChevronRight size={20} color={BRAND.accentOrange} />
  </TouchableOpacity>
);

// ============================================================================
// Main Home Screen
// ============================================================================

const HomeScreen = ({ navigation }) => {
  const user = useAuthStore(state => state.user);
  const {
    trending,
    recommended,
    isLoadingTrending,
    trendingError,
    isLoadingRecommended,
    recommendedError,
    fetchTrending,
    fetchRecommended,
  } = useProductStore();

  const {
    featuredKits,
    isLoadingFeatured,
    featuredError,
    fetchFeaturedKits,
  } = useProjectStore();

  const cartCount = useCartStore(state => state.getItemCount());
  const wishlistCount = useWishlistStore(state => state.getCount());
  const fetchCart = useCartStore(state => state.fetchCart);
  const fetchWishlist = useWishlistStore(state => state.fetchWishlist);

  const {
    posters,
    isLoading: isLoadingPosters,
    fetchPosters,
  } = usePosterStore();

  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting);

  // Keep greeting dynamically updated in real time
  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = useCallback(async () => {
    try {
      await Promise.allSettled([
        fetchPosters(),
        fetchTrending(),
        fetchRecommended(),
        fetchFeaturedKits(),
        fetchCart(),
        fetchWishlist(),
      ]);
    } catch (err) {
      console.warn('[Home Screen Load Error]', err);
    }
  }, [fetchPosters, fetchTrending, fetchRecommended, fetchFeaturedKits, fetchCart, fetchWishlist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToProduct = product => {
    if (!product?._id) return;
    navigation.navigate('ProductDetail', { productId: product._id, product });
  };

  const navigateToCategory = category => {
    if (!category?.id) return;
    navigation.navigate('Category', { categoryId: category.id, categoryName: category.name });
  };

  const displayTrending = trending || [];
  const displayRecommended = recommended || [];
  const displayKits = featuredKits || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.titleColumn}>
            <Text style={styles.greeting} numberOfLines={1}>
              Good {greeting}, {user?.name?.split(' ')[0] || 'Maker'}!
            </Text>
            <Text style={styles.logoFull} numberOfLines={1}>
              Tech Crate
            </Text>
          </View>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('AIAssistant')}
            activeOpacity={0.75}>
            <Bot size={20} color={BRAND.primaryNavy} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('Profile', { screen: 'Wishlist' })}
            activeOpacity={0.75}>
            <Heart size={20} color="#0F172A" />
            {wishlistCount > 0 && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.75}>
            <ShoppingCart size={20} color="#0F172A" />
            {cartCount > 0 && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.85}>
          <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            Search products, projects, kits...
          </Text>
          <View style={styles.searchFilter}>
            <Text style={styles.searchFilterText}>Filter</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND.primaryNavy]}
            tintColor={BRAND.primaryNavy}
          />
        }>
        {/* 1. Dynamic Promotional Posters Carousel */}
        <PosterCarousel
          posters={posters}
          isLoading={isLoadingPosters}
          navigation={navigation}
        />

        {/* 2. Stats Row */}
        <StatsRow />

        {/* 3. AI Assistant Banner */}
        <View style={styles.bannerPad}>
          <AIBanner onPress={() => navigation.navigate('AIAssistant')} />
        </View>

        {/* 4. Popular Categories */}
        <View style={styles.section}>
          <SectionHeader
            title="Popular Categories"
            subtitle="Browse by component type"
            onSeeAll={() => navigation.navigate('Search')}
          />
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            contentContainerStyle={styles.categoryList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => navigateToCategory(item)}
              />
            )}
          />
        </View>

        {/* 5. Featured Project Kits */}
        <View style={styles.section}>
          <SectionHeader
            title="Featured Project Kits"
            subtitle="Complete kits with components + tutorials"
            onSeeAll={() => navigation.navigate('Projects')}
          />
          {isLoadingFeatured ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kitList}>
              <ProjectKitSkeleton />
              <ProjectKitSkeleton />
            </ScrollView>
          ) : featuredError ? (
            <SectionErrorState
              message={featuredError}
              onRetry={fetchFeaturedKits}
            />
          ) : displayKits.length === 0 ? (
            <SectionEmptyState
              message="No project kits available right now"
              onRetry={fetchFeaturedKits}
            />
          ) : (
            <FlatList
              data={displayKits}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              contentContainerStyle={styles.kitList}
              keyExtractor={(item, index) => item._id || `kit-${index}`}
              renderItem={({ item }) => (
                <ProjectCard
                  kit={item}
                  onPress={() =>
                    navigation.navigate('Projects', {
                      screen: 'ProjectKitDetail',
                      params: { kitId: item._id, kit: item },
                    })
                  }
                />
              )}
            />
          )}
        </View>

        {/* 6. Trending Products */}
        <View style={styles.section}>
          <SectionHeader
            title="Trending Products"
            subtitle="Most popular this week"
            onSeeAll={() => navigation.navigate('Search', { sort: 'trending' })}
          />
          {isLoadingTrending ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </ScrollView>
          ) : trendingError ? (
            <SectionErrorState
              message={trendingError}
              onRetry={fetchTrending}
            />
          ) : displayTrending.length === 0 ? (
            <SectionEmptyState
              message="No trending products available right now"
              onRetry={fetchTrending}
            />
          ) : (
            <FlatList
              data={displayTrending}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              contentContainerStyle={styles.productList}
              keyExtractor={(item, index) => item._id || `trending-${index}`}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  style={styles.carouselProductCard}
                  onPress={() => navigateToProduct(item)}
                />
              )}
            />
          )}
        </View>

        {/* 7. Build Your Project / CTA */}
        <View style={styles.bannerPad}>
          <BuilderBanner
            onPress={() =>
              navigation.navigate('Projects', { screen: 'ProjectBuilder' })
            }
          />
        </View>

        {/* 8. Recommended Products */}
        <View style={styles.section}>
          <SectionHeader
            title="Recommended for You"
            subtitle="Based on your interests"
            onSeeAll={() => navigation.navigate('Search', { sort: 'recommended' })}
          />
          {isLoadingRecommended ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </ScrollView>
          ) : recommendedError ? (
            <SectionErrorState
              message={recommendedError}
              onRetry={fetchRecommended}
            />
          ) : displayRecommended.length === 0 ? (
            <SectionEmptyState
              message="No recommendations available yet"
              onRetry={fetchRecommended}
            />
          ) : (
            <FlatList
              data={displayRecommended}
              horizontal
              showsHorizontalScrollIndicator={false}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              contentContainerStyle={styles.productList}
              keyExtractor={(item, index) => item._id || `recommended-${index}`}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  style={styles.carouselProductCard}
                  onPress={() => navigateToProduct(item)}
                />
              )}
            />
          )}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};



// ============================================================================
// Stylesheet
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 28,
  },

  // App Bar
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...Shadows.sm,
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 1,
  },
  logoFull: {
    fontSize: 17,
    fontWeight: '800',
    color: BRAND.primaryNavy,
    letterSpacing: -0.3,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeSmall: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: BRAND.accentOrange,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeSmallText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
    paddingVertical: 2,
  },
  searchFilter: {
    backgroundColor: BRAND.primaryNavy,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchFilterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Hero Banner (Responsive, Never Clipped)
  hero: {
    minHeight: 215,
    backgroundColor: BRAND.primaryNavy,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    position: 'relative',
    ...Shadows.md,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BRAND.darkNavy,
  },
  heroDecor1: {
    position: 'absolute',
    top: -35,
    right: -35,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: BRAND.cyan,
    opacity: 0.16,
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -25,
    right: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: BRAND.secondaryBlue,
    opacity: 0.35,
  },
  heroEmojiContainer: {
    position: 'absolute',
    bottom: 12,
    right: 18,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  heroTag: {
    fontSize: 11,
    color: BRAND.accentOrange,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
    marginBottom: 16,
    maxWidth: '85%',
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroPrimaryBtn: {
    backgroundColor: BRAND.accentOrange,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    ...Shadows.sm,
  },
  heroPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroSecondaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // Stats Card
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND.primaryNavy,
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },

  // Banners padding
  bannerPad: {
    paddingHorizontal: 16,
    marginTop: 10,
  },

  // AI Shopping Assistant Banner
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND.primaryNavy,
    borderRadius: 16,
    padding: 16,
    ...Shadows.md,
  },
  aiBannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  aiLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aiLabel: {
    fontSize: 11,
    color: BRAND.accentOrange,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
  },
  aiBannerRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  botCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BRAND.secondaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BRAND.cyan,
  },

  // Project Builder Banner
  builderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9731612',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#F9731630',
  },
  builderIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Shadows.sm,
  },
  builderContent: {
    flex: 1,
  },
  builderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  builderDesc: {
    fontSize: 11,
    color: '#64748B',
  },

  // Section Headers
  section: {
    marginTop: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionHeaderTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  seeAll: {
    fontSize: 12,
    color: BRAND.primaryNavy,
    fontWeight: '700',
    marginRight: 2,
  },

  // Category List
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 10,
    width: 72,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    width: '100%',
  },

  // Products and Kits List
  productList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  carouselProductCard: {
    width: 170,
    marginRight: 12,
    marginVertical: 4,
    marginHorizontal: 0,
  },
  kitList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  // Skeletons
  productSkeleton: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  skeletonImage: {
    width: '100%',
    height: 135,
    backgroundColor: '#E2E8F0',
  },
  kitSkeleton: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  kitSkeletonImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#E2E8F0',
  },
  skeletonContent: {
    padding: 10,
  },
  skeletonLine: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },

  // Empty & Error States
  emptyContainer: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorContainer: {
    marginHorizontal: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    backgroundColor: BRAND.primaryNavy,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  bottomPad: {
    height: 24,
  },
});

export default HomeScreen;
