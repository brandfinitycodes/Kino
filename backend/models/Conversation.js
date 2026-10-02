const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true,
    unique: true // One chat per deal
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'participantModel'
  }],
  participantModel: {
    type: String,
    required: true,
    enum: ['User'] // Adjust if you use separate models for Brand/Creator
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
