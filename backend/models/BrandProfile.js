const mongoose = require('mongoose');

const brandProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  businessType: {
    type: String,
    enum: ['Service', 'Local', 'Online'],
    default: 'Online'
  },
  industry: {
    type: String,
    default: ''
  },
  operatingFrom: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: null
  },
  logo: {
    type: String,
    default: ''
  },
  logoFileId: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: ''
  },
  preferences: {
    targetGender: {
      type: String,
      enum: ['Male', 'Female', 'Both'],
      default: 'Both'
    },
    targetAgeGroup: {
      type: String,
      default: 'Any'
    },
    targetLocality: {
      type: String,
      default: 'Anywhere'
    },
    brandPriority: {
      type: String,
      enum: ['Followers', 'Reach', 'Video Content Only'],
      default: 'Reach'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('BrandProfile', brandProfileSchema);
