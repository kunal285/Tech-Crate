const { z } = require('zod');

// ==========================================
// 1. Authentication Schemas
// ==========================================
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, 'Invalid phone number format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().max(150).optional(),
  branch: z.string().max(100).optional(),
});

const loginSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
  recoveryCode: z.string().optional(),
}).refine((data) => data.username || data.email || data.phone, {
  message: 'Email, username, or phone number is required for login',
});

const otpRequestSchema = z.object({
  phoneNumber: z.string().min(10, 'Valid phone number required'),
});

const otpVerifySchema = z.object({
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

// ==========================================
// 2. Product Schemas
// ==========================================
const createProductSchema = z.object({
  title: z.string().min(3, 'Product title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than zero'),
  originalPrice: z.number().positive().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().min(3, 'Valid SKU is required').optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  datasheetUrl: z.string().url('Invalid datasheet URL').optional().or(z.literal('')),
});

const updateProductSchema = createProductSchema.partial();

// ==========================================
// 3. Cart Schemas
// ==========================================
const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1').default(1),
  itemType: z.enum(['product', 'projectKit']).optional().default('product'),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

// ==========================================
// 4. Order & Checkout Schemas
// ==========================================
const createOrderSchema = z.object({
  orderItems: z.array(
    z.object({
      product: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be at least 1'),
      price: z.number().optional(), // Server overrides client price
    })
  ).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Recipient full name is required'),
    phone: z.string().min(10, 'Valid contact phone required'),
    street: z.string().min(3, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits'),
    country: z.string().default('India'),
  }),
  paymentMethod: z.enum(['UPI', 'Card', 'NetBanking', 'Razorpay', 'Cash on Delivery', 'COD']),
  couponCode: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    'Pending',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Refunded',
  ]),
  trackingNumber: z.string().optional(),
});

// ==========================================
// 5. Coupon Schema
// ==========================================
const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  discountValue: z.number().positive('Discount value must be greater than zero'),
  minOrder: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().default(100),
  expiryDate: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
});

// ==========================================
// 6. Poster / Banner Schema
// ==========================================
const createPosterSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  imageUrl: z.string().url('Valid image URL is required'),
  subtitle: z.string().optional().default(''),
  badgeText: z.string().optional().default(''),
  customText: z.string().optional().default(''),
  buttonText: z.string().optional().default('Shop Now'),
  linkType: z.enum(['product', 'category', 'project', 'search', 'url', 'screen', 'none']).default('none'),
  linkValue: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  createProductSchema,
  updateProductSchema,
  addToCartSchema,
  updateCartItemSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createCouponSchema,
  createPosterSchema,
};
