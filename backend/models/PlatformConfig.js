const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
  platformFeePercentage: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
