const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Microcontrollers',
        'Sensors',
        'Motors & Drivers',
        'Wireless & IoT',
        'Power & Battery',
        'Displays',
        'Components & Passives',
        'Project Kits',
        'Tools & Prototyping',
      ],
    },
    stock: {
      type: Number,
      required: true,
      default: 10,
    },
    images: [
      {
        type: String,
      },
    ],
    specifications: {
      operatingVoltage: { type: String, default: '5V DC' },
      pinCount: { type: String, default: 'N/A' },
      interface: { type: String, default: 'I2C / SPI / GPIO' },
      dimensions: { type: String, default: '' },
      weight: { type: String, default: '' },
    },
    compatibilityTags: [
      {
        type: String,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewCount: {
      type: Number,
      default: 12,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    datasheetUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
