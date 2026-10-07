const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Poster title is required'],
      trim: true,
    },
    customText: {
      type: String,
      default: '',
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    badgeText: {
      type: String,
      default: '',
      trim: true,
    },
    buttonText: {
      type: String,
      default: '',
      trim: true,
    },
    buttonLink: {
      type: String,
      default: '',
      trim: true,
    },
    linkType: {
      type: String,
      enum: ['product', 'category', 'project', 'search', 'url', 'screen', 'none'],
      default: 'none',
    },
    linkValue: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id to match JSON responses
posterSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Poster', posterSchema);
