const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreatorProfile',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'confirmed_by_creator'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
