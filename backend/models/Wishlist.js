const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Dynamic ref Path
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['Campaign', 'CreatorProfile'],
    required: true
  },
  folder: {
    type: String,
    default: 'Saved'
  },
  note: {
    type: String,
    default: '',
    maxLength: 500
  }
}, { timestamps: true });

// Ensure a user can only wishlist a specific target once
wishlistSchema.index({ userId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
