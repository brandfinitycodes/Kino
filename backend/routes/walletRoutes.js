const express = require('express');
const router = express.Router();
const { getMyWallet, getMyTransactions, requestWithdrawal, addFunds } = require('../controllers/walletController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { requireKYC } = require('../middleware/kycMiddleware');

router.get('/my-wallet', authMiddleware, getMyWallet);
router.get('/transactions', authMiddleware, getMyTransactions);
router.post('/withdraw', authMiddleware, requireKYC, requestWithdrawal);
router.post('/add-funds', authMiddleware, checkRole('brand'), addFunds);

module.exports = router;
