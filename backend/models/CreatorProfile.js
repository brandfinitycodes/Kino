const mongoose = require('mongoose');

const creatorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  profilePictureFileId: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  location: {
    type: String,
    default: ''
  },
  age: {
    type: Number,
    default: null
  },
  niche: {
    type: String, // e.g., 'Tech', 'Lifestyle', 'Fashion'
    default: null
  },
  socialLinks: [{
    platform: String,
    url: String,
    handle: String
  }],
  followerCount: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: String,
    default: '< 24h'
  },
  expertise: {
    type: [String],
    default: []
  },
  portfolioLink: {
    type: String,
    default: ''
  },
  pricing: {
    basic: {
      price: { type: Number, default: 0 },
      description: { type: String, default: '' },
      deliveryDays: { type: Number, default: 3 },
      revisions: { type: Number, default: 1 }
    },
    standard: {
      price: { type: Number, default: 0 },
      description: { type: String, default: '' },
      deliveryDays: { type: Number, default: 5 },
      revisions: { type: Number, default: 2 }
    },
    premium: {
      price: { type: Number, default: 0 },
      description: { type: String, default: '' },
      deliveryDays: { type: Number, default: 7 },
      revisions: { type: Number, default: 3 }
    }
  },
  portfolioVideos: [{
    url: String,
    title: String,
    fileId: String // For management/deletion via ImageKit
  }],
  payoutDetails: {
    method: {
      type: String,
      enum: ['bank', 'upi'],
      default: 'upi'
    },
    accountHolderName: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    upiId: { type: String, default: '' },
    isComplete: { type: Boolean, default: false }
  },
  instagramProfile: {
    connected: { type: Boolean, default: false },
    username: { type: String, default: null },
    fullName: { type: String, default: null },
    profilePicture: { type: String, default: null },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    audienceCountries: [{ country: String, percentage: Number }],
    audienceGenders: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    recentPosts: [{
      mediaUrl: String,
      permalink: String,
      likes: Number,
      comments: Number,
      caption: String,
      mediaType: String,
      timestamp: Date
    }]
  }
}, { timestamps: true });

creatorProfileSchema.index({ niche: 1 });
creatorProfileSchema.index({ userId: 1 });
creatorProfileSchema.index({ name: 'text', bio: 'text' });

module.exports = mongoose.model('CreatorProfile', creatorProfileSchema);
