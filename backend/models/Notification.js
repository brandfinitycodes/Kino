const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  },
  actionLabel: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
