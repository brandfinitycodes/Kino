const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead };
