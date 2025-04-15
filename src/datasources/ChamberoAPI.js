const { DataSource } = require('apollo-datasource');
const Chambero = require('../models/Chambero');
const AWS = require('aws-sdk');

class ChamberoAPI extends DataSource {
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

  async getAllChamberos() {
    return await Chambero.find().populate('user');
  }

  async getChamberoById(id) {
    return await Chambero.findById(id).populate('user');
  }

  async getChamberoByUserId(userId) {
    return await Chambero.findOne({ user: userId }).populate('user');
  }

  async createChambero({ userId, skills }) {
    const chambero = new Chambero({
      user: userId,
      skills
    });

    await chambero.save();
    return await this.getChamberoById(chambero.id);
  }

  async updateChambero(id, { skills, isAvailable, location }) {
    const chambero = await Chambero.findById(id);
    if (!chambero) {
      throw new Error('Chambero not found');
    }

    if (skills) {
      chambero.skills = skills;
    }

    if (isAvailable !== undefined) {
      chambero.isAvailable = isAvailable;
    }

    if (location) {
      chambero.location = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
    }

    await chambero.save();
    return await this.getChamberoById(chambero.id);
  }

  async addGalleryImage(chamberoId, { image, description }) {
    const chambero = await Chambero.findById(chamberoId);
    if (!chambero) {
      throw new Error('Chambero not found');
    }

    // Upload image to S3
    const imageUrl = await this.uploadImageToS3(image);

    chambero.gallery.push({
      imageUrl,
      description
    });

    await chambero.save();
    return await this.getChamberoById(chambero.id);
  }

  async uploadImageToS3(image) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `gallery/${Date.now()}-${image.name}`,
      Body: image.buffer,
      ContentType: image.mimetype,
      ACL: 'public-read'
    };

    const { Location } = await this.s3.upload(params).promise();
    return Location;
  }

  async searchChamberos({ skills, location, radius, minRating }) {
    let query = {};

    if (skills && skills.length > 0) {
      query.skills = { $all: skills };
    }

    if (minRating) {
      query.rating = { $gte: minRating };
    }

    if (location && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    return await Chambero.find(query)
      .populate('user')
      .sort({ rating: -1 });
  }
}

module.exports = ChamberoAPI; 