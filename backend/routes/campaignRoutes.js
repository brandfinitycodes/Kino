const express = require('express');
const { 
  createCampaign, 
  getAllCampaigns, 
  getCampaignById, 
  getMyCampaigns,
  updateCampaign,
  toggleCampaignStatus,
  deleteCampaign
} = require('../controllers/campaignController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { isVerifiedMiddleware } = require('../middleware/isVerifiedMiddleware');

const router = express.Router();

router.get('/mine', authMiddleware, checkRole('brand'), getMyCampaigns);
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);

// Requires Authentication and Brand Role
router.post('/', authMiddleware, checkRole('brand'), isVerifiedMiddleware, createCampaign);
router.put('/:id', authMiddleware, updateCampaign);
router.patch('/:id/status', authMiddleware, toggleCampaignStatus);
router.delete('/:id', authMiddleware, deleteCampaign);

module.exports = router;
