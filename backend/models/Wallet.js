const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0, // Withdrawable funds (completed deals)
    min: 0
  },
  fundsSecured: {
    type: Number,
    default: 0, // Funds locked in active deals
    min: 0
  },
  pendingClearance: {
    type: Number,
    default: 0, // Funds approved by brand, waiting for Admin payout
    min: 0
  },
  settlingBalance: {
    type: Number,
    default: 0, // Funds in transit to bank
    min: 0
  },
  currency: {
    type: String,
    default: 'COIN'
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
