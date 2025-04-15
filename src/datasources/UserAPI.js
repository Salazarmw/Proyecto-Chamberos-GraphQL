const { DataSource } = require('apollo-datasource');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class UserAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {
    this.context = config.context;
  }

  async getAllUsers() {
    return await User.find();
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  async getUserByPhone(phone) {
    return await User.findOne({ phone });
  }

  async createUser({ name, email, phone, password }) {
    // Check if email already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await this.getUserByPhone(phone);
      if (existingPhone) {
        throw new Error('Phone number already in use');
      }
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email,
      phone,
      password,
      verificationToken
    });

    await user.save();
    return user;
  }

  async updateUser(id, { name, email, phone }) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (email && email !== user.email) {
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
      user.email = email;
      user.isVerified = false;
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await this.getUserByPhone(phone);
      if (existingPhone) {
        throw new Error('Phone number already in use');
      }
      user.phone = phone;
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    return user;
  }

  async verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    return user;
  }

  async login(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user
    };
  }

  async socialLogin(provider, profile) {
    let user = await User.findOne({ [`socialAuth.${provider}.id`]: profile.id });

    if (!user) {
      // Check if user exists with the same email
      user = await this.getUserByEmail(profile.email);
      if (user) {
        // Link social account to existing user
        user.socialAuth[provider] = {
          id: profile.id,
          token: profile.token
        };
        await user.save();
      } else {
        // Create new user
        user = new User({
          name: profile.name,
          email: profile.email,
          isVerified: true,
          socialAuth: {
            [provider]: {
              id: profile.id,
              token: profile.token
            }
          }
        });
        await user.save();
      }
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user
    };
  }
}

module.exports = UserAPI; 