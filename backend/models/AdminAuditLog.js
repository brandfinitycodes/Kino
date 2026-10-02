const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  adminRole: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true // e.g. 'SUSPEND_USER', 'APPROVE_KYC', 'RESOLVE_DISPUTE'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  details: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
