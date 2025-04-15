const { DataSource } = require('apollo-datasource');
const Quote = require('../models/Quote');
const AWS = require('aws-sdk');

class QuoteAPI extends DataSource {
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

  async getAllQuotes() {
    return await Quote.find()
      .populate('chambero')
      .populate('user');
  }

  async getQuoteById(id) {
    return await Quote.findById(id)
      .populate('chambero')
      .populate('user');
  }

  async getQuotesByChamberoId(chamberoId) {
    return await Quote.find({ chambero: chamberoId })
      .populate('chambero')
      .populate('user');
  }

  async getQuotesByUserId(userId) {
    return await Quote.find({ user: userId })
      .populate('chambero')
      .populate('user');
  }

  async createQuote({ chamberoId, userId, description, price, scheduledDate, images }) {
    const quote = new Quote({
      chambero: chamberoId,
      user: userId,
      description,
      price,
      scheduledDate
    });

    if (images && images.length > 0) {
      const uploadedImages = await Promise.all(
        images.map(image => this.uploadImageToS3(image))
      );
      quote.images = uploadedImages.map(url => ({ url }));
    }

    await quote.save();
    return await this.getQuoteById(quote.id);
  }

  async updateQuoteStatus(id, status) {
    const quote = await Quote.findById(id);
    if (!quote) {
      throw new Error('Quote not found');
    }

    quote.status = status;
    await quote.save();
    return await this.getQuoteById(quote.id);
  }

  async addCounterOffer(id, { price, note, date }) {
    const quote = await Quote.findById(id);
    if (!quote) {
      throw new Error('Quote not found');
    }

    quote.counterOffers.push({
      price,
      note,
      date
    });

    quote.status = 'counter-offer';
    await quote.save();
    return await this.getQuoteById(quote.id);
  }

  async uploadImageToS3(image) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `quotes/${Date.now()}-${image.name}`,
      Body: image.buffer,
      ContentType: image.mimetype,
      ACL: 'public-read'
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  async getQuotesByStatus(status) {
    return await Quote.find({ status })
      .populate('chambero')
      .populate('user');
  }

  async getQuotesByDateRange(startDate, endDate) {
    return await Quote.find({
      scheduledDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('chambero')
    .populate('user');
  }
}

module.exports = QuoteAPI; 