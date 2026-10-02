const mongoose = require('mongoose');

const kycProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  userType: {
    type: String,
    enum: ['creator', 'brand'],
    required: true
  },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'],
    default: 'NOT_STARTED'
  },
  verificationId: {
    type: String,
    unique: true,
    sparse: true
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Step 1: Personal/Business Information
  personalInfo: {
    // Creator specific
    fullName: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },

    // Brand specific
    companyName: { type: String, default: '' },
    businessType: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    contactPerson: { type: String, default: '' }
  },
  // Aadhaar OTP Verification
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  aadhaarNumber: {
    type: String,
    default: ''  // stored masked: XXXX XXXX 1234
  },
  aadhaarLinkedPhone: {
    type: String,
    default: ''  // stored masked: XXXXXX7890
  },
  // Step 3: Selfie Verification URL
  selfieUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('KycProfile', kycProfileSchema);
