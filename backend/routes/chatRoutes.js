const express = require('express');
const { getMessagesByDeal, sendMessage } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireKYC } = require('../middleware/kycMiddleware');

const router = express.Router();

router.get('/:dealId', authMiddleware, requireKYC, getMessagesByDeal);
router.post('/:dealId', authMiddleware, requireKYC, sendMessage);

module.exports = router;
