const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      index: true,
    },
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
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      emailAddress: String,
    },
    currency: { type: String, default: 'INR' },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: Date,
    orderStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'FAILED'],
      default: 'Pending',
    },
    deliveredAt: Date,
    trackingNumber: {
      type: String,
      default: function () {
        return 'PK' + Math.floor(10000000 + Math.random() * 90000000);
      },
    },
  },
  { timestamps: true }
);

// Performance Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ trackingNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
