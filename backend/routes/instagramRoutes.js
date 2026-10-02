const express = require('express');
const router = express.Router();
const { connectInstagram, disconnectInstagram } = require('../controllers/instagramController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/connect', authMiddleware, connectInstagram);
router.post('/disconnect', authMiddleware, disconnectInstagram);

module.exports = router;
