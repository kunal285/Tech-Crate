const mongoose = require('mongoose');

const checkoutSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [
    {
      title: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      projectKit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectKit',
      },
      itemType: {
        type: String,
        enum: ['product', 'kit'],
        default: 'product',
      },
    },
  ],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Card', 'NetBanking', 'COD', 'Razorpay'],
    default: 'UPI',
  },
  currency: { type: String, default: 'INR' },
  itemsPrice: { type: Number, required: true },
  taxPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  itemsPricePaise: { type: Number },
  taxPricePaise: { type: Number },
  shippingPricePaise: { type: Number },
  totalPricePaise: { type: Number },
  discountApplied: { type: Number, default: 0 },
  coupon: { type: String },
  order_id: { type: String },
  
  sessionStatus: {
    type: String,
    enum: ['Active', 'Completed', 'Failed', 'Expired'],
    default: 'Active',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  payment_id: { type: String },
  payment_url: { type: String },
  
  // Track reserved inventory to restore on failure
  reservedInventory: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number },
    }
  ]
}, { timestamps: true });

// TTL index to automatically expire sessions after 15 minutes if not completed
// Note: Document deletion won't trigger our inventory restoration hook automatically in all cases,
// so a cron job or explicit check is usually better for inventory release, but TTL helps cleanup.
checkoutSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CheckoutSession', checkoutSessionSchema);
