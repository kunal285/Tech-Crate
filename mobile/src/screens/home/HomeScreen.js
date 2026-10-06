import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
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
  Flame,
  Wifi,
  Radio,
  Eye,
  Globe,
  Database,
  Monitor,
  Hammer,
  Layers,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { CATEGORIES } from '../../constants';
import useAuthStore from '../../store/authStore';
import useProductStore from '../../store/productStore';
import useProjectStore from '../../store/projectStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import ProductCard from '../../components/product/ProductCard';
import ProjectCard from '../../components/project/ProjectCard';

const BANNER_HEIGHT = 190;

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { trending, recommended, fetchTrending, fetchRecommended } = useProductStore();
  const { featuredKits, fetchFeaturedKits } = useProjectStore();
  const cartCount = useCartStore(state => state.getItemCount());
  const wishlistCount = useWishlistStore(state => state.getCount());
  const fetchCart = useCartStore(state => state.fetchCart);
  const fetchWishlist = useWishlistStore(state => state.fetchWishlist);

  const [refreshing, setRefreshing] = useState(false);

  const loadData = React.useCallback(async () => {
    try {
      await Promise.all([
        fetchTrending(),
        fetchRecommended(),
        fetchFeaturedKits(),
        fetchCart(),
        fetchWishlist(),
      ]);
    } catch (err) {
      console.log('Home screen load data error:', err);
    }
  }, [fetchTrending, fetchRecommended, fetchFeaturedKits, fetchCart, fetchWishlist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToProduct = product => {
    if (!product) return;
    navigation.navigate('ProductDetail', { productId: product._id, product });
  };

  const navigateToCategory = category => {
    if (!category) return;
    navigation.navigate('Category', { categoryId: category.id, categoryName: category.name });
  };

  // Hero Banner
  const HeroBanner = () => (
    <View style={styles.hero}>
      <View style={styles.heroBg} />
      <View style={styles.heroContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <Flame size={14} color={Colors.secondary || '#F97316'} />
          <Text style={styles.heroTag}>New Arrivals</Text>
        </View>
        <Text style={styles.heroTitle}>Build. Learn.{'\n'}Create.</Text>
        <Text style={styles.heroSubtitle}>
          Everything you need for your next engineering project.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.heroPrimaryBtn}
            onPress={() => navigation.navigate('Search')}>
            <Text style={styles.heroPrimaryText}>Explore Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroSecondaryBtn}
            onPress={() => navigation.navigate('Projects')}>
            <Text style={styles.heroSecondaryText}>Project Kits</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.heroDecor1} />
      <View style={styles.heroDecor2} />
      <View style={styles.heroEmojiContainer}>
        <Cpu size={56} color="#FFFFFF" opacity={0.15} />
      </View>
    </View>
  );

  // Stats Row
  const StatsRow = () => (
    <View style={styles.statsRow}>
      {[
        { IconComp: Package, value: '1000+', label: 'Products' },
        { IconComp: Cpu, value: '50+', label: 'Projects' },
        { IconComp: Rocket, value: '10K+', label: 'Students' },
        { IconComp: Star, value: '4.8', label: 'Rating' },
      ].map((stat, i) => (
        <View key={i} style={styles.statCard}>
          <stat.IconComp size={18} color={Colors.primary || '#1E3A5F'} style={{ marginBottom: 4 }} />
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );

  // Section Header
  const SectionHeader = ({ title, subtitle, onSeeAll }) => (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.seeAll}>See All </Text>
          <ChevronRight size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Category Card
  const CategoryCard = ({ category }) => {
    const IconComponent = getCategoryIcon(category.id);
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigateToCategory(category)}
        activeOpacity={0.8}>
        <View style={[styles.categoryIcon, { backgroundColor: (category.color || Colors.primary) + '18' }]}>
          <IconComponent size={22} color={category.color || Colors.primary} />
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // AI Assistant Banner
  const AIBanner = () => (
    <TouchableOpacity
      style={styles.aiBanner}
      onPress={() => navigation.navigate('AIAssistant')}
      activeOpacity={0.9}>
      <View style={styles.aiBannerLeft}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Sparkles size={14} color={Colors.secondary} />
          <Text style={styles.aiLabel}>AI Shopping Assistant</Text>
        </View>
        <Text style={styles.aiTitle}>Tell me your project!</Text>
        <Text style={styles.aiDesc}>Get component suggestions & budget estimates</Text>
      </View>
      <View style={styles.aiBannerRight}>
        <Bot size={40} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  // Project Builder Banner
  const BuilderBanner = () => (
    <TouchableOpacity
      style={styles.builderBanner}
      onPress={() => navigation.navigate('Projects', { screen: 'ProjectBuilder' })}
      activeOpacity={0.9}>
      <Wrench size={26} color={Colors.secondary || '#F97316'} style={{ marginRight: 10 }} />
      <View style={styles.builderContent}>
        <Text style={styles.builderTitle}>Build Your Project</Text>
        <Text style={styles.builderDesc}>Step-by-step project configurator</Text>
      </View>
      <ChevronRight size={20} color={Colors.secondary || '#F97316'} />
    </TouchableOpacity>
  );

  const displayTrending = trending || [];
  const displayRecommended = recommended || [];
  const displayKits = featuredKits || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.logoMini}>
            <Zap size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.greeting}>
              Good {getGreeting()}, {user?.name?.split(' ')[0] || 'Maker'}!
            </Text>
            <Text style={styles.logoFull}>ProjectKart</Text>
          </View>
        </View>
        <View style={styles.appBarRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AIAssistant')}>
            <Bot size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Profile', { screen: 'Wishlist' })}>
            <Heart size={18} color={Colors.textPrimary} />
            {wishlistCount > 0 && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>{wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={18} color={Colors.textPrimary} />
            {cartCount > 0 && (
              <View style={styles.badgeSmall}>
                <Text style={styles.badgeSmallText}>{cartCount}</Text>
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
          activeOpacity={0.8}>
          <Search size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <Text style={styles.searchPlaceholder}>
            Search products, projects, kits...
          </Text>
          <View style={styles.searchFilter}>
            <Text style={styles.searchFilterText}>Filter</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }>
        {/* Hero Banner */}
        <HeroBanner />

        {/* Stats */}
        <StatsRow />

        {/* AI Assistant Banner */}
        <View style={styles.bannerPad}>
          <AIBanner />
        </View>

        {/* Popular Categories */}
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
            contentContainerStyle={styles.categoryList}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <CategoryCard category={item} />}
          />
        </View>

        {/* Project Kits Carousel */}
        <View style={styles.section}>
          <SectionHeader
            title="Featured Project Kits"
            subtitle="Complete kits with components + tutorials"
            onSeeAll={() => navigation.navigate('Projects')}
          />
          <FlatList
            data={displayKits}
            horizontal
            showsHorizontalScrollIndicator={false}
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
        </View>

        {/* Trending Products */}
        <View style={styles.section}>
          <SectionHeader
            title="Trending Products"
            subtitle="Most popular this week"
            onSeeAll={() => navigation.navigate('Search', { sort: 'trending' })}
          />
          <FlatList
            data={displayTrending}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            keyExtractor={(item, index) => item._id || `trending-${index}`}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigateToProduct(item)}
              />
            )}
          />
        </View>

        {/* Project Builder Banner */}
        <View style={styles.bannerPad}>
          <BuilderBanner />
        </View>

        {/* Recommended Products */}
        <View style={styles.section}>
          <SectionHeader
            title="Recommended for You"
            subtitle="Based on your interests"
            onSeeAll={() => navigation.navigate('Search', { sort: 'recommended' })}
          />
          <FlatList
            data={displayRecommended}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            keyExtractor={(item, index) => item._id || `recommended-${index}`}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigateToProduct(item)}
              />
            )}
          />
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};



const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const getCategoryIcon = id => {
  const map = {
    arduino: Cpu, esp32: Wifi, esp8266: Radio, 'raspberry-pi': Cpu,
    sensors: Eye, robotics: Bot, iot: Globe, embedded: Database,
    motors: Wrench, displays: Monitor, communication: Radio, 'dev-boards': Cpu,
    pcbs: Layers, power: Zap, components: Package, 'project-kits': Package,
    'diy-kits': Hammer, tools: Wrench, modules: Cpu, accessories: Package,
  };
  return map[id] || Zap;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background || '#F8FAFC' },
  scrollContent: { paddingBottom: Spacing.xl },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  appBarLeft: { flexDirection: 'row', alignItems: 'center' },
  logoMini: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.secondary || '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  logoMiniText: { fontSize: 18 },
  greeting: { fontSize: Typography.fontSize.xs, color: Colors.textMuted },
  logoFull: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary,
  },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceElevated || '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBtnText: { fontSize: 17 },
  badgeSmall: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.secondary || '#F97316',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmallText: { color: Colors.white, fontSize: 9, fontWeight: Typography.fontWeight.bold },
  searchContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated || '#F1F5F9',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border || '#E2E8F0',
  },
  searchIcon: { fontSize: 15, marginRight: Spacing.sm },
  searchPlaceholder: { flex: 1, fontSize: Typography.fontSize.sm, color: Colors.textMuted },
  searchFilter: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  searchFilterText: { color: Colors.white, fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold },

  // Hero
  hero: {
    height: BANNER_HEIGHT,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    position: 'relative',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primaryDark || '#0F172A',
  },
  heroContent: { padding: Spacing.lg, justifyContent: 'center', flex: 1 },
  heroTag: {
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary || '#F97316',
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 4,
    letterSpacing: Typography.letterSpacing.widest,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: Typography.fontSize['2xl'] || 22,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.white,
    lineHeight: 28,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white + 'CC',
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  heroButtons: { flexDirection: 'row', gap: Spacing.sm },
  heroPrimaryBtn: {
    backgroundColor: Colors.secondary || '#F97316',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  heroPrimaryText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.xs },
  heroSecondaryBtn: {
    backgroundColor: Colors.white + '20',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.white + '40',
  },
  heroSecondaryText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.xs },
  heroDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.primaryAccent || '#3B82F6',
    opacity: 0.2,
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -30,
    right: 30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.secondary || '#F97316',
    opacity: 0.15,
  },
  heroEmoji: { position: 'absolute', bottom: 8, right: 16, fontSize: 52, opacity: 0.2 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    ...Shadows.sm,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 18, marginBottom: 2 },
  statValue: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.extrabold, color: Colors.primary },
  statLabel: { fontSize: 10, color: Colors.textMuted },

  // Banners
  bannerPad: { paddingHorizontal: Spacing.base, marginVertical: Spacing.xs },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    overflow: 'hidden',
    ...Shadows.md,
  },
  aiBannerLeft: { flex: 1 },
  aiLabel: { fontSize: Typography.fontSize.xs, color: Colors.secondary, fontWeight: Typography.fontWeight.semibold, marginBottom: 2 },
  aiTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.extrabold, color: Colors.white, marginBottom: 2 },
  aiDesc: { fontSize: Typography.fontSize.xs, color: Colors.white + 'BB' },
  aiBannerRight: { marginLeft: Spacing.sm },
  aiEmoji: { fontSize: 40 },
  builderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (Colors.secondary || '#F97316') + '12',
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: (Colors.secondary || '#F97316') + '30',
  },
  builderEmoji: { fontSize: 28, marginRight: Spacing.sm },
  builderContent: { flex: 1 },
  builderTitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  builderDesc: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
  builderArrow: { fontSize: 18, color: Colors.secondary, fontWeight: Typography.fontWeight.bold },

  // Section
  section: { marginBottom: Spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: { fontSize: Typography.fontSize.base || 16, fontWeight: Typography.fontWeight.bold, color: Colors.textPrimary },
  sectionSubtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  seeAll: { fontSize: Typography.fontSize.xs, color: Colors.primary, fontWeight: Typography.fontWeight.semibold },

  // Categories
  categoryList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xs },
  categoryCard: {
    alignItems: 'center',
    marginRight: Spacing.sm,
    width: 68,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryEmoji: { fontSize: 22 },
  categoryName: { fontSize: 10, fontWeight: Typography.fontWeight.medium, color: Colors.textSecondary, textAlign: 'center' },

  // Products
  productList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xs },

  // Project Kits
  kitList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xs },

  bottomPad: { height: 40 },
});

export default HomeScreen;
