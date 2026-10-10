const express = require('express');
const { getMessagesByDeal, sendMessage } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { isVerifiedMiddleware } = require('../middleware/isVerifiedMiddleware');

const router = express.Router();

router.get('/:dealId', authMiddleware, isVerifiedMiddleware, getMessagesByDeal);
router.post('/:dealId', authMiddleware, isVerifiedMiddleware, sendMessage);

module.exports = router;
