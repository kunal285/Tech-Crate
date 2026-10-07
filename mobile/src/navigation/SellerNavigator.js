import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {LayoutDashboard, Package, ShoppingBag, Star, User} from 'lucide-react-native';
import {Colors, Typography, Spacing} from '../theme';

// Seller Screens
import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';
import SellerProductsScreen from '../screens/seller/SellerProductsScreen';
import AddProductScreen from '../screens/seller/AddProductScreen';
import EditProductScreen from '../screens/seller/EditProductScreen';
import SellerInventoryScreen from '../screens/seller/SellerInventoryScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';
import SellerOrderDetailScreen from '../screens/seller/SellerOrderDetailScreen';
import SellerReviewsScreen from '../screens/seller/SellerReviewsScreen';
import SellerAnalyticsScreen from '../screens/seller/SellerAnalyticsScreen';
import SellerProfileScreen from '../screens/seller/SellerProfileScreen';
import CreateProjectKitScreen from '../screens/seller/CreateProjectKitScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({focused, IconComponent, label}) => (
  <View style={styles.tabItem}>
    <IconComponent
      size={20}
      color={focused ? (Colors.primary || '#1E3A5F') : (Colors.textMuted || '#94A3B8')}
      strokeWidth={focused ? 2.2 : 1.8}
    />
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
  </View>
);

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SellerDashboardMain" component={SellerDashboardScreen} />
    <Stack.Screen name="SellerAnalytics" component={SellerAnalyticsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const ProductsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SellerProductsMain" component={SellerProductsScreen} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} />
    <Stack.Screen name="EditProduct" component={EditProductScreen} />
    <Stack.Screen name="SellerInventory" component={SellerInventoryScreen} />
    <Stack.Screen name="CreateProjectKit" component={CreateProjectKitScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SellerOrdersMain" component={SellerOrdersScreen} />
    <Stack.Screen name="SellerOrderDetail" component={SellerOrderDetailScreen} />
  </Stack.Navigator>
);

const ReviewsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SellerReviewsMain" component={SellerReviewsScreen} />
  </Stack.Navigator>
);

const SellerNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }}>
    <Tab.Screen
      name="SellerDashboard"
      component={DashboardStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={LayoutDashboard} label="Dashboard" />
        ),
      }}
    />
    <Tab.Screen
      name="SellerProducts"
      component={ProductsStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={Package} label="Products" />
        ),
      }}
    />
    <Tab.Screen
      name="SellerOrdersTab"
      component={OrdersStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={ShoppingBag} label="Orders" />
        ),
      }}
    />
    <Tab.Screen
      name="SellerReviewsTab"
      component={ReviewsStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={Star} label="Reviews" />
        ),
      }}
    />
    <Tab.Screen
      name="SellerProfileTab"
      component={SellerProfileScreen}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={User} label="Profile" />
        ),
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white || '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border || '#E2E8F0',
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 84 : 68,
    elevation: 12,
  },
  tabItem: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  tabIcon: {fontSize: 20, opacity: 0.6},
  tabIconActive: {opacity: 1},
  tabLabel: {fontSize: 11, color: Colors.textMuted || '#94A3B8', marginTop: 2, fontWeight: '500'},
  tabLabelActive: {color: Colors.primary || '#1E3A5F', fontWeight: '700'},
});

export default SellerNavigator;
