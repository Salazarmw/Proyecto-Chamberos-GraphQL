const mongoose = require('mongoose');

const chamberoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalRating: {
    type: Number,
    default: 0
  },
  gallery: [{
    imageUrl: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for location
chamberoSchema.index({ location: '2dsphere' });

// Update timestamp before saving
chamberoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating
chamberoSchema.methods.calculateRating = function() {
  if (this.totalReviews === 0) {
    this.rating = 0;
  } else {
    this.rating = this.totalRating / this.totalReviews;
  }
};

const Chambero = mongoose.model('Chambero', chamberoSchema);

module.exports = Chambero; 