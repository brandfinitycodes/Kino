const express = require('express');
const { applyToCampaign, getCreatorApplications, getBrandApplications, updateApplicationStatus, getAllApplications, nudgeBrand, withdrawApplication } = require('../controllers/applicationController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { requireKYC } = require('../middleware/kycMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllApplications);
router.get('/creator', authMiddleware, checkRole('creator'), getCreatorApplications);
router.get('/brand/:campaignId', authMiddleware, checkRole('brand'), getBrandApplications);
router.post('/', authMiddleware, checkRole('creator'), requireKYC, applyToCampaign);
router.put('/:id/status', authMiddleware, requireKYC, updateApplicationStatus); // Logic within controller handles role

router.post('/:id/nudge', authMiddleware, checkRole('creator'), requireKYC, nudgeBrand);
router.delete('/:id/withdraw', authMiddleware, checkRole('creator'), withdrawApplication);

module.exports = router;
