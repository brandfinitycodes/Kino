const express = require('express');
const router = express.Router();
const { 
  getPendingWithdrawals, 
  approveWithdrawal, 
  rejectWithdrawal, 
  getAdminStats,
  getAdminUsers,
  toggleUserSuspension,
  toggleUserVerification,
  getAdminCampaigns,
  moderateCampaign,
  getAdminDeals,
  resolveDisputedDeal,
  getAdminTransactions,
  getAdminAuditLogs,
  getAdminSocialMonitor,
  getClearanceQueue,
  markPayoutPaid
} = require('../controllers/adminController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Define Role Collections
const superAndAdmin = ['superadmin', 'admin'];
const superAdminAndMod = ['superadmin', 'admin', 'moderator'];
const superAdminAndSupport = ['superadmin', 'admin', 'support'];
const allAdmins = ['superadmin', 'admin', 'moderator', 'support'];
const superOnly = ['superadmin'];

router.get('/stats', authMiddleware, checkRole(allAdmins), getAdminStats);
router.get('/withdrawals', authMiddleware, checkRole(superAndAdmin), getPendingWithdrawals);
router.post('/withdrawals/:id/approve', authMiddleware, checkRole(superAndAdmin), approveWithdrawal);
router.post('/withdrawals/:id/reject', authMiddleware, checkRole(superAndAdmin), rejectWithdrawal);

// User Management
router.get('/users', authMiddleware, checkRole(superAndAdmin), getAdminUsers);
router.post('/users/:id/suspend', authMiddleware, checkRole(superAndAdmin), toggleUserSuspension);
router.post('/users/:id/verify', authMiddleware, checkRole(superAndAdmin), toggleUserVerification);

// Campaign Moderation
router.get('/campaigns', authMiddleware, checkRole(superAdminAndMod), getAdminCampaigns);
router.post('/campaigns/:id/moderate', authMiddleware, checkRole(superAdminAndMod), moderateCampaign);

// Deal Arbitration
router.get('/deals', authMiddleware, checkRole(superAdminAndSupport), getAdminDeals);
router.post('/deals/:id/resolve', authMiddleware, checkRole(superAdminAndSupport), resolveDisputedDeal);

// Financial Audits / Ledger
router.get('/transactions', authMiddleware, checkRole(superAndAdmin), getAdminTransactions);
router.get('/clearance-queue', authMiddleware, checkRole(superAndAdmin), getClearanceQueue);
router.post('/clearance-queue/:id/pay', authMiddleware, checkRole(superAndAdmin), markPayoutPaid);

// Social Media Monitoring
router.get('/social-monitor', authMiddleware, checkRole(allAdmins), getAdminSocialMonitor);

// Audit Logs
router.get('/audit-logs', authMiddleware, checkRole(superOnly), getAdminAuditLogs);

module.exports = router;


