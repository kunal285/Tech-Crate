import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {LayoutDashboard, Users, Package, ShoppingBag, Tag} from 'lucide-react-native';
import {Colors, Typography, Spacing} from '../theme';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminSellersScreen from '../screens/admin/AdminSellersScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminCouponsScreen from '../screens/admin/AdminCouponsScreen';
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
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
    <Stack.Screen name="AdminDashboardMain" component={AdminDashboardScreen} />
    <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const UsersStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminUsersMain" component={AdminUsersScreen} />
    <Stack.Screen name="AdminSellers" component={AdminSellersScreen} />
  </Stack.Navigator>
);

const ProductsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminProductsMain" component={AdminProductsScreen} />
    <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminOrdersMain" component={AdminOrdersScreen} />
  </Stack.Navigator>
);

const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarShowLabel: false,
    }}>
    <Tab.Screen
      name="AdminDashboard"
      component={DashboardStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={LayoutDashboard} label="Dashboard" />
        ),
      }}
    />
    <Tab.Screen
      name="AdminUsers"
      component={UsersStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={Users} label="Users" />
        ),
      }}
    />
    <Tab.Screen
      name="AdminProducts"
      component={ProductsStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={Package} label="Products" />
        ),
      }}
    />
    <Tab.Screen
      name="AdminOrders"
      component={OrdersStack}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={ShoppingBag} label="Orders" />
        ),
      }}
    />
    <Tab.Screen
      name="AdminCoupons"
      component={AdminCouponsScreen}
      options={{
        tabBarIcon: ({focused}) => (
          <TabIcon focused={focused} IconComponent={Tag} label="Coupons" />
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

export default AdminNavigator;
