const { DataSource } = require('apollo-datasource');
const Review = require('../models/Review');
const AWS = require('aws-sdk');

class ReviewAPI extends DataSource {
  constructor() {
    super();
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }

  initialize(config) {
    this.context = config.context;
  }

  async getAllReviews() {
    return await Review.find()
      .populate('chambero')
      .populate('user');
  }

  async getReviewById(id) {
    return await Review.findById(id)
      .populate('chambero')
      .populate('user');
  }

  async getReviewsByChamberoId(chamberoId) {
    return await Review.find({ chambero: chamberoId })
      .populate('chambero')
      .populate('user')
      .sort({ createdAt: -1 });
  }

  async getReviewsByUserId(userId) {
    return await Review.find({ user: userId })
      .populate('chambero')
      .populate('user')
      .sort({ createdAt: -1 });
  }

  async createReview({ chamberoId, userId, rating, comment, images }) {
    // Check if user has already reviewed this chambero
    const existingReview = await Review.findOne({
      chambero: chamberoId,
      user: userId
    });

    if (existingReview) {
      throw new Error('You have already reviewed this chambero');
    }

    const review = new Review({
      chambero: chamberoId,
      user: userId,
      rating,
      comment
    });

    if (images && images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map(image => this.uploadImageToS3(image))
      );
      review.images = uploadedImages.map(url => ({ url }));
    }

    await review.save();
    return await this.getReviewById(review.id);
  }

  async updateReview(id, { rating, comment, images }) {
    const review = await Review.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    if (rating) {
      review.rating = rating;
    }

    if (comment) {
      review.comment = comment;
    }

    if (images && images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map(image => this.uploadImageToS3(image))
      );
      review.images = uploadedImages.map(url => ({ url }));
    }

    await review.save();
    return await this.getReviewById(review.id);
  }

  async deleteReview(id) {
    const review = await Review.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    await review.remove();
    return true;
  }

  async uploadImageToS3(image) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `reviews/${Date.now()}-${image.name}`,
      Body: image.buffer,
      ContentType: image.mimetype,
      ACL: 'public-read'
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  async getAverageRating(chamberoId) {
    const result = await Review.aggregate([
      { $match: { chambero: chamberoId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    return result[0] || { averageRating: 0, totalReviews: 0 };
  }
}

module.exports = ReviewAPI; 