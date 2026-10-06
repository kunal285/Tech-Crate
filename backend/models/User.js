const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
      index: true,
      sparse: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a mobile number'],
      trim: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    password: {
      type: String,
      required: false, // Optional for OTP Customers & Students; required for Admin
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'student', 'seller', 'admin'],
      default: 'customer',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    // Student & Academic Details
    college: {
      type: String,
      default: '',
    },
    branch: {
      type: String,
      default: '',
    },
    studentId: {
      type: String,
      default: '',
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
    },
    // Verification & Security
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorRecoveryCodes: {
      type: [
        {
          codeHash: { type: String, required: true },
          used: { type: Boolean, default: false },
        },
      ],
      select: false,
      default: [],
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual to check if account is currently locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);
