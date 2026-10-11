import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, Cpu, ShoppingCart, User } from 'lucide-react-native';
import { Colors } from '../theme';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/products/SearchScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CategoryScreen from '../screens/products/CategoryScreen';
import ProjectHubScreen from '../screens/projects/ProjectHubScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import ProjectKitDetailScreen from '../screens/projects/ProjectKitDetailScreen';
import ProjectBuilderScreen from '../screens/projects/ProjectBuilderScreen';
import CartScreen from '../screens/cart/CartScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import OrderTrackingScreen from '../screens/orders/OrderTrackingScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AddressScreen from '../screens/profile/AddressScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import PaymentScreen from '../screens/checkout/PaymentScreen';
import OrderSuccessScreen from '../screens/checkout/OrderSuccessScreen';
import PaymentProcessingScreen from '../screens/checkout/PaymentProcessingScreen';
import PaymentResultScreen from '../screens/checkout/PaymentResultScreen';
import AIAssistantScreen from '../screens/ai/AIAssistantScreen';
import ReviewsScreen from '../screens/products/ReviewsScreen';
import WriteReviewScreen from '../screens/products/WriteReviewScreen';

import useCartStore from '../store/cartStore';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Bar Icon component
const TabIcon = ({ focused, IconComponent, label, badge }) => (
  <View style={styles.tabItem}>
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <IconComponent
        size={21}
        color={focused ? '#032762' : '#94A3B8'}
        strokeWidth={focused ? 2.4 : 1.8}
      />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
    <Text
      numberOfLines={1}
      style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ProductList" component={ProductListScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <Stack.Screen name="ProjectKitDetail" component={ProjectKitDetailScreen} />
    <Stack.Screen name="Category" component={CategoryScreen} />
    <Stack.Screen name="Reviews" component={ReviewsScreen} />
    <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
    <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
    <Stack.Screen name="ProjectHubFromHome" component={ProjectHubScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="OrderHistory" component={OrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailScreen} />
  </Stack.Navigator>
);

// Search Stack
const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <Stack.Screen name="ProjectKitDetail" component={ProjectKitDetailScreen} />
    <Stack.Screen name="Category" component={CategoryScreen} />
    <Stack.Screen name="ProductList" component={ProductListScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
  </Stack.Navigator>
);

// Projects Stack
const ProjectsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProjectHub" component={ProjectHubScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <Stack.Screen name="ProjectKitDetail" component={ProjectKitDetailScreen} />
    <Stack.Screen name="ProjectBuilder" component={ProjectBuilderScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

// Cart Stack
const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartMain" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
    <Stack.Screen name="PaymentResult" component={PaymentResultScreen} />
    <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <Stack.Screen name="ProjectKitDetail" component={ProjectKitDetailScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="OrderHistory" component={OrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="OrderHistory" component={OrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    <Stack.Screen name="Wishlist" component={WishlistScreen} />
    <Stack.Screen name="Addresses" component={AddressScreen} />
    <Stack.Screen name="AddAddress" component={AddAddressScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    <Stack.Screen name="ProjectKitDetail" component={ProjectKitDetailScreen} />
  </Stack.Navigator>
);

const CustomerNavigator = () => {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore(state =>
    (state.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
  );

  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 6);
  const tabHeight = 54 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: tabHeight, paddingBottom: bottomPadding }],
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIconStyle,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComponent={Home} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComponent={Search} label="Search" />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComponent={Cpu} label="Projects" />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              IconComponent={ShoppingCart}
              label="Cart"
              badge={cartCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} IconComponent={User} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  tabBarIconStyle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#03276214',
  },
  tabLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#032762',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.secondary || '#F97316',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default CustomerNavigator;
