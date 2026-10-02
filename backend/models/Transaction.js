const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'funds_secured_hold', 'funds_secured_release', 'pending_clearance_hold', 'payout_completed', 'platform_fee_deducted', 'coin_purchase', 'coin_withdrawal'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  description: {
    type: String,
    required: true
  },
  relatedDealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  referenceId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
