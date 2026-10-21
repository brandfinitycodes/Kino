const express = require('express');
const { getMessagesByDeal, sendMessage } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { isVerifiedMiddleware } = require('../middleware/isVerifiedMiddleware');
const Deal = require('../models/Deal');

const router = express.Router();

// Middleware to authorize deal chat access: participants, verified users, or admins
const canAccessDealChat = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { dealId } = req.params;
    if (dealId) {
      const deal = await Deal.findById(dealId)
        .populate('brandId')
        .populate('creatorId')
        .populate({
          path: 'applicationId',
          populate: [
            { path: 'creatorId' },
            { path: 'campaignId', populate: { path: 'brandId' } }
          ]
        });

      if (deal) {
        // Admins are granted access to deals where a dispute has been raised (or superadmins)
        const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
        const isAdmin = req.user && adminRoles.includes(req.user.role);
        if (isAdmin) {
          const isDisputed = deal.status === 'disputed' || Boolean(deal.disputeReason);
          if (isDisputed || req.user.role === 'superadmin') {
            return next();
          }
          return res.status(403).json({ 
            message: 'Admin chat access is only available for deals where a dispute has been raised.' 
          });
        }
        const brandUserId = String(
          deal.brandId?.userId?._id || deal.brandId?.userId || 
          deal.applicationId?.campaignId?.brandId?.userId?._id || deal.applicationId?.campaignId?.brandId?.userId || ''
        );
        const creatorUserId = String(
          deal.creatorId?.userId?._id || deal.creatorId?.userId || 
          deal.applicationId?.creatorId?.userId?._id || deal.applicationId?.creatorId?.userId || ''
        );
        const currentIdStr = String(userId);

        if ((brandUserId && brandUserId === currentIdStr) || (creatorUserId && creatorUserId === currentIdStr)) {
          return next();
        }
      }
    }

    // Fallback to standard verification check
    return isVerifiedMiddleware(req, res, next);
  } catch (err) {
    console.error('canAccessDealChat error:', err);
    return isVerifiedMiddleware(req, res, next);
  }
};

router.get('/:dealId', authMiddleware, canAccessDealChat, getMessagesByDeal);
router.post('/:dealId', authMiddleware, canAccessDealChat, sendMessage);

module.exports = router;
