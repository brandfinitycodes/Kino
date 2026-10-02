const express = require('express');
const { createCampaign, getAllCampaigns, getCampaignById, getMyCampaigns } = require('../controllers/campaignController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { requireKYC } = require('../middleware/kycMiddleware');

const router = express.Router();

router.get('/mine', authMiddleware, checkRole('brand'), getMyCampaigns);
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);

// Requires Authentication and Brand Role
router.post('/', authMiddleware, checkRole('brand'), requireKYC, createCampaign);

module.exports = router;
