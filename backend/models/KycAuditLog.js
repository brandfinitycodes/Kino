const mongoose = require('mongoose');

const kycAuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  statusBefore: {
    type: String,
    required: true
  },
  statusAfter: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('KycAuditLog', kycAuditLogSchema);
