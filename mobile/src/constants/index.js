import {Platform} from 'react-native';

// API Configuration
const rawApiUrl =
  (typeof process !== 'undefined' && process.env && (process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL)) ||
  null;

const normalizeApiUrl = (url) => {
  if (!url) return null;
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

// Backend URL resolution
const getLocalBackendUrl = () => {
  // In production builds / release APK, fall back to persistent hosted backend
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return 'https://tech-crate.onrender.com/api';
  }
  // In Android emulator, 10.0.2.2 maps to the computer's localhost:5000
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL =
  normalizeApiUrl(rawApiUrl) || getLocalBackendUrl();

export const API_TIMEOUT = 45000;

// App Constants
export const APP_NAME = 'Tech Crate';
export const APP_TAGLINE = 'Everything You Need to Build.';
export const APP_VERSION = '0.1.2';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@techcrate/auth_token',
  REFRESH_TOKEN: '@techcrate/refresh_token',
  DEVICE_TOKEN: '@techcrate/device_token',
  USER_DATA: '@techcrate/user_data',
  CART_DATA: '@techcrate/cart_data',
  WISHLIST_DATA: '@techcrate/wishlist_data',
  ONBOARDING_DONE: '@techcrate/onboarding_done',
  SEARCH_HISTORY: '@techcrate/search_history',
  NOTIFICATIONS: '@techcrate/notifications',
  PRODUCTS_CACHE: '@techcrate/products_cache',
  PROJECTS_CACHE: '@techcrate/projects_cache',
  POSTERS_CACHE: '@techcrate/posters_cache',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STUDENT: 'student',
  SELLER: 'seller',
  ADMIN: 'admin',
};

// Order Status
export const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Methods (UPI & Cash on Delivery)
export const PAYMENT_METHODS = {
  UPI: 'upi',
  COD: 'cod',
};

// Merchant UPI Configuration for Direct Google Pay / UPI Checkout
const envUpiVpa =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.EXPO_PUBLIC_MERCHANT_UPI_VPA ||
      process.env.MERCHANT_UPI_VPA ||
      process.env.UPI_VPA)) ||
  null;

export const MERCHANT_CONFIG = {
  UPI_VPA: envUpiVpa || '8329276568@ptyes',
  PAYEE_NAME: 'Tech Crate',
  MERCHANT_CODE: '5411',
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  REJECTED: 'rejected',
  OUT_OF_STOCK: 'out_of_stock',
};

// Seller Status
export const SELLER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

// Review Sort Options
export const REVIEW_SORT = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  HIGHEST: 'highest',
  LOWEST: 'lowest',
  HELPFUL: 'helpful',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PRODUCTS_LIMIT: 20,
  REVIEWS_LIMIT: 10,
  ORDERS_LIMIT: 10,
  SEARCH_LIMIT: 20,
};

// Image Sizes
export const IMAGE_SIZES = {
  THUMBNAIL: 80,
  CARD: 200,
  BANNER: 400,
  PRODUCT_DETAIL: 800,
};

// Max file sizes (bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  CODE: 2 * 1024 * 1024, // 2MB
};

// Delivery Types
export const DELIVERY_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
};

// Delivery Fees
export const DELIVERY_FEES = {
  STANDARD: 49,
  EXPRESS: 99,
  FREE_ABOVE: 499,
};

// Tax Rate
export const TAX_RATE = 0.18; // 18% GST

// Categories
export const CATEGORIES = [
  {id: 'arduino', name: 'Arduino', icon: 'microchip', color: '#009FAF'},
  {id: 'esp32', name: 'ESP32', icon: 'wifi', color: '#E7322A'},
  {id: 'esp8266', name: 'ESP8266', icon: 'wifi', color: '#E7322A'},
  {id: 'raspberry-pi', name: 'Raspberry Pi', icon: 'raspberry-pi', color: '#C51A4A'},
  {id: 'sensors', name: 'Sensors', icon: 'eye', color: '#6366F1'},
  {id: 'robotics', name: 'Robotics', icon: 'robot', color: '#8B5CF6'},
  {id: 'iot', name: 'IoT', icon: 'cloud', color: '#06B6D4'},
  {id: 'embedded', name: 'Embedded', icon: 'cpu', color: '#F59E0B'},
  {id: 'motors', name: 'Motors', icon: 'settings', color: '#10B981'},
  {id: 'displays', name: 'Displays', icon: 'monitor', color: '#3B82F6'},
  {id: 'communication', name: 'Communication', icon: 'radio', color: '#EC4899'},
  {id: 'dev-boards', name: 'Dev Boards', icon: 'cpu', color: '#7C3AED'},
  {id: 'pcbs', name: 'PCBs', icon: 'git-merge', color: '#059669'},
  {id: 'power', name: 'Power Supply', icon: 'zap', color: '#EF4444'},
  {id: 'components', name: 'Components', icon: 'box', color: '#F97316'},
  {id: 'project-kits', name: 'Project Kits', icon: 'package', color: '#8B5CF6'},
  {id: 'diy-kits', name: 'DIY Kits', icon: 'tool', color: '#0EA5E9'},
  {id: 'tools', name: 'Tools', icon: 'tool', color: '#64748B'},
  {id: 'modules', name: 'Modules', icon: 'layers', color: '#14B8A6'},
  {id: 'accessories', name: 'Accessories', icon: 'paperclip', color: '#A78BFA'},
];

// Project Categories
export const PROJECT_CATEGORIES = [
  'IoT',
  'Robotics',
  'AI & ML',
  'Embedded Systems',
  'Automation',
  'Smart Agriculture',
  'Smart Home',
  'Healthcare',
  'Security',
  'Energy',
  'Transportation',
  'Education',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PRODUCT_BACK_IN_STOCK: 'product_back_in_stock',
  NEW_PROJECT_KIT: 'new_project_kit',
  SPECIAL_OFFER: 'special_offer',
  SELLER_APPROVED: 'seller_approved',
  SELLER_REJECTED: 'seller_rejected',
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  APP_NAME,
  APP_TAGLINE,
  STORAGE_KEYS,
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  DIFFICULTY_LEVELS,
  PRODUCT_STATUS,
  SELLER_STATUS,
  PAGINATION,
  DELIVERY_FEES,
  TAX_RATE,
  CATEGORIES,
  PROJECT_CATEGORIES,
};
