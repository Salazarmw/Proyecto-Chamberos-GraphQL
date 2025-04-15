const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
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
reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update chambero's rating after review is saved
reviewSchema.post('save', async function() {
  const Chambero = mongoose.model('Chambero');
  const chambero = await Chambero.findById(this.chambero);
  
  if (chambero) {
    chambero.totalReviews += 1;
    chambero.totalRating += this.rating;
    chambero.calculateRating();
    await chambero.save();
  }
});

// Update chambero's rating after review is deleted
reviewSchema.post('remove', async function() {
  const Chambero = mongoose.model('Chambero');
  const chambero = await Chambero.findById(this.chambero);
  
  if (chambero) {
    chambero.totalReviews -= 1;
    chambero.totalRating -= this.rating;
    chambero.calculateRating();
    await chambero.save();
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 