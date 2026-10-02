const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  originType: {
    type: String,
    enum: ['campaign', 'package'],
    default: 'campaign'
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    sparse: true,
    unique: true
  },
  // Required for package deals to identify participants without an application
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrandProfile'
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreatorProfile'
  },
  packageTier: {
    type: String,
    enum: ['basic', 'standard', 'premium']
  },
  packageSnapshot: {
    type: Object // Cloned snapshot of deliverables, days, and price at checkout
  },
  status: {
    type: String,
    enum: ['pending_payment', 'in_progress', 'in_review', 'revision_requested', 'pending_clearance', 'completed', 'disputed'],
    default: 'pending_payment'
  },
  budget: {
    type: Number,
    required: true
  },
  contentUrl: {
    type: String, // Google Drive link or similar for creator deliverables
    default: ''
  },
  brandAssetsUrl: {
    type: String, // Google Drive link or similar for brand requirements & raw video data
    default: ''
  },
  submittedAt: {
    type: Date
  },
  disputedAt: {
    type: Date
  },
  disputeReason: {
    type: String
  },
  platformFeePercentage: {
    type: Number
  },
  platformFeeAmount: {
    type: Number
  },
  invoiceUrl: {
    type: String
  },
  paymentDetails: {
    status: {
      type: String,
      enum: ['pending', 'funds_secured_held', 'released', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
