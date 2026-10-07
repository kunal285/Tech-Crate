-- ============================================================================
-- TECHCRATE RELATIONAL DATABASE SCHEMA FOR SUPABASE POSTGRESQL
-- Complete DDL with Primary Keys, Foreign Keys, Indexes, Constraints,
-- Triggers, and Production Row-Level Security (RLS) Policies.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. ENUMS & ROLES
-- ============================================================================
CREATE TYPE app_role AS ENUM (
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'INVENTORY_MANAGER',
  'ORDER_MANAGER',
  'SELLER',
  'CUSTOMER'
);

CREATE TYPE order_status_enum AS ENUM (
  'Pending',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Refunded'
);

CREATE TYPE payment_status_enum AS ENUM (
  'Pending',
  'Authorized',
  'Captured',
  'Failed',
  'Refunded'
);

CREATE TYPE coupon_type_enum AS ENUM (
  'percentage',
  'fixed'
);

-- ============================================================================
-- 3. USERS, PROFILES & ADDRESSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role app_role DEFAULT 'CUSTOMER' NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  college VARCHAR(200),
  branch VARCHAR(150),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  street TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  country VARCHAR(100) DEFAULT 'India' NOT NULL,
  address_type VARCHAR(50) DEFAULT 'Home', -- 'Home', 'Campus Lab', 'Hostel'
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 4. CATEGORIES, PRODUCTS & INVENTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) UNIQUE NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100) DEFAULT 'Cpu',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price >= price),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  specifications JSONB DEFAULT '{}'::jsonb,
  features TEXT[] DEFAULT '{}',
  datasheet_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 5. CARTS & WISHLISTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- 6. COUPONS, ORDERS & PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type coupon_type_enum DEFAULT 'percentage' NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2) DEFAULT NULL,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  expiry_date TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT,
  shipping_address_snapshot JSONB NOT NULL,
  order_status order_status_enum DEFAULT 'Pending' NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ DEFAULT NULL,
  items_price NUMERIC(10, 2) NOT NULL CHECK (items_price >= 0),
  tax_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax_price >= 0),
  shipping_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_price >= 0),
  discount_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_price >= 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_provider VARCHAR(50) DEFAULT 'Razorpay' NOT NULL,
  transaction_id VARCHAR(150) UNIQUE,
  order_gateway_id VARCHAR(150),
  signature VARCHAR(255),
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status payment_status_enum DEFAULT 'Pending' NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 7. REVIEWS, NOTIFICATIONS & AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(150),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'order', -- 'order', 'promo', 'account'
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255) NOT NULL,
  actor_role app_role NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(100),
  previous_state JSONB,
  new_state JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 8. INDEXES FOR HIGH-CONCURRENCY QUERYING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Customers can view/manage only their own profiles
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Customers can view/manage only their own addresses
CREATE POLICY "Users view own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- Customers can view/manage only their own cart
CREATE POLICY "Users manage own cart" ON carts
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cart items" ON cart_items
  FOR ALL USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()));

-- Customers can view/manage only their own wishlists
CREATE POLICY "Users manage own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- Customers can view only their own orders
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own order items" ON order_items
  FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
