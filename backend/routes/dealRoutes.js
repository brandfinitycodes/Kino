const express = require('express');
const { 
  createDeal, 
  createPackageCheckout, 
  getUserDeals, 
  fundDeal, 
  submitContent, 
  reviewContent, 
  updateDealStatus, 
  submitDeliverables, 
  fileDispute,
  pauseDeal,
  resumeDeal,
  cancelDeal,
  editDealDetails
} = require('../controllers/dealController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { isVerifiedMiddleware } = require('../middleware/isVerifiedMiddleware');

const router = express.Router();

router.get('/user', authMiddleware, getUserDeals);
router.post('/', authMiddleware, isVerifiedMiddleware, createDeal);
router.post('/package-checkout', authMiddleware, isVerifiedMiddleware, createPackageCheckout);

// Payment & Lifecycle endpoints
router.post('/:id/pay', authMiddleware, checkRole('brand'), isVerifiedMiddleware, fundDeal);
router.post('/:id/submit-content', authMiddleware, checkRole('creator'), isVerifiedMiddleware, submitContent);
router.post('/:id/review', authMiddleware, checkRole('brand'), isVerifiedMiddleware, reviewContent);

// State Management & Actions (Pause, Resume, Cancel, Edit)
router.post('/:id/pause', authMiddleware, isVerifiedMiddleware, pauseDeal);
router.post('/:id/resume', authMiddleware, isVerifiedMiddleware, resumeDeal);
router.post('/:id/cancel', authMiddleware, isVerifiedMiddleware, cancelDeal);
router.put('/:id/details', authMiddleware, isVerifiedMiddleware, editDealDetails);

router.put('/:id/status', authMiddleware, isVerifiedMiddleware, updateDealStatus);
router.post('/:id/deliverables', authMiddleware, isVerifiedMiddleware, submitDeliverables);
router.post('/:id/dispute', authMiddleware, isVerifiedMiddleware, fileDispute);

module.exports = router;
