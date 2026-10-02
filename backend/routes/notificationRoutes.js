const express = require('express');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getMyNotifications);
router.put('/:id/read', authMiddleware, markAsRead);

module.exports = router;
