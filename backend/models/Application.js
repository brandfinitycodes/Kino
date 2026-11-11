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
    enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn', 'confirmed_by_creator', 'rejected_by_creator'],
    default: 'pending'
  }
}, { timestamps: true });

applicationSchema.index({ campaignId: 1, status: 1 });
applicationSchema.index({ creatorId: 1, status: 1 });
applicationSchema.index({ campaignId: 1, creatorId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
