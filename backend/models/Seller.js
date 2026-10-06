const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    storeDescription: {
      type: String,
      default: '',
    },
    gstNumber: {
      type: String,
      default: '',
    },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolder: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Seller', sellerSchema);
