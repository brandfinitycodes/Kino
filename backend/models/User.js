const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['creator', 'brand', 'superadmin', 'admin', 'moderator', 'support'],
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    enum: ['NOT_STARTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'],
    default: 'NOT_STARTED'
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
