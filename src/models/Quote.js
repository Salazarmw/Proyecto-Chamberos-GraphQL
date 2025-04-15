const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  chambero: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chambero',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'counter-offer', 'completed'],
    default: 'pending'
  },
  counterOffers: [{
    price: {
      type: Number,
      required: true
    },
    note: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  scheduledDate: {
    type: Date
  },
  images: [{
    url: String,
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
quoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote; 