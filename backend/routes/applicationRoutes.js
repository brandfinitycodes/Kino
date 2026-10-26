const express = require('express');
const { 
  applyToCampaign, 
  getCreatorApplications, 
  getBrandApplications, 
  updateApplicationStatus, 
  getAllApplications, 
  nudgeBrand, 
  nudgeCreator,
  withdrawApplication,
  editApplicationProposal
} = require('../controllers/applicationController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { isVerifiedMiddleware } = require('../middleware/isVerifiedMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllApplications);
router.get('/creator', authMiddleware, checkRole('creator'), getCreatorApplications);
router.get('/brand/:campaignId', authMiddleware, checkRole('brand'), getBrandApplications);
router.post('/', authMiddleware, checkRole('creator'), isVerifiedMiddleware, applyToCampaign);
router.put('/:id', authMiddleware, checkRole('creator'), isVerifiedMiddleware, editApplicationProposal);
router.put('/:id/status', authMiddleware, isVerifiedMiddleware, updateApplicationStatus); // Logic within controller handles role

router.post('/:id/nudge', authMiddleware, checkRole('creator'), isVerifiedMiddleware, nudgeBrand);
router.post('/:id/nudge-creator', authMiddleware, checkRole('brand'), isVerifiedMiddleware, nudgeCreator);
router.delete('/:id/withdraw', authMiddleware, checkRole('creator'), withdrawApplication);

module.exports = router;
