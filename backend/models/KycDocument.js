const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  kycProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KycProfile',
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    default: ''
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('KycDocument', kycDocumentSchema);
