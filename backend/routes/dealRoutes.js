const express = require('express');
const { createDeal, createPackageCheckout, getUserDeals, fundDeal, submitContent, reviewContent, updateDealStatus, submitDeliverables, fileDispute } = require('../controllers/dealController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { requireKYC } = require('../middleware/kycMiddleware');

const router = express.Router();

router.get('/user', authMiddleware, getUserDeals);
router.post('/', authMiddleware, requireKYC, createDeal);
router.post('/package-checkout', authMiddleware, requireKYC, createPackageCheckout);

// Payment & Lifecycle endpoints
router.post('/:id/pay', authMiddleware, checkRole('brand'), requireKYC, fundDeal);
router.post('/:id/submit-content', authMiddleware, checkRole('creator'), requireKYC, submitContent);
router.post('/:id/review', authMiddleware, checkRole('brand'), requireKYC, reviewContent);

router.put('/:id/status', authMiddleware, requireKYC, updateDealStatus);
router.post('/:id/deliverables', authMiddleware, requireKYC, submitDeliverables);
router.post('/:id/dispute', authMiddleware, requireKYC, fileDispute);

module.exports = router;
