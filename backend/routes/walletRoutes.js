const express = require('express');
const router = express.Router();
const { getMyWallet, getMyTransactions, requestWithdrawal, addFunds } = require('../controllers/walletController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { isVerifiedMiddleware } = require('../middleware/isVerifiedMiddleware');

router.get('/my-wallet', authMiddleware, getMyWallet);
router.get('/transactions', authMiddleware, getMyTransactions);
router.post('/withdraw', authMiddleware, isVerifiedMiddleware, requestWithdrawal);
router.post('/add-funds', authMiddleware, checkRole('brand'), isVerifiedMiddleware, addFunds);

module.exports = router;
