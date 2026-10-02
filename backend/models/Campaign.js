const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrandProfile',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  niche: {
    type: String,
    enum: ['Tech', 'Lifestyle', 'Fashion', 'Food', 'Travel', 'Gaming', 'Beauty', 'Finance', 'Health', 'Other'],
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'completed', 'inactive'],
    default: 'active'
  },
  moderationFeedback: {
    type: String,
    default: ''
  },

  requirements: [{
    type: String
  }]
}, { timestamps: true });

campaignSchema.index({ status: 1 });
campaignSchema.index({ brandId: 1 });
campaignSchema.index({ niche: 1 });
campaignSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Campaign', campaignSchema);
