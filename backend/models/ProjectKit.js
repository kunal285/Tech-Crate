const mongoose = require('mongoose');

const projectKitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Robotics', 'IoT', 'Embedded Systems', 'Automation', 'Sensors & AI', 'Wearables'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    estimatedTimeHours: {
      type: Number,
      default: 4,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    componentsRequired: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        unitPrice: { type: Number, default: 0 },
      },
    ],
    circuitDiagramUrl: {
      type: String,
      default: '',
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    stepByStepGuide: [
      {
        stepNumber: Number,
        title: String,
        content: String,
        imageUrl: String,
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
    },
    buildCount: {
      type: Number,
      default: 45,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProjectKit', projectKitSchema);
