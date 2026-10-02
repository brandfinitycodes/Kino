const express = require('express');
const router = express.Router();
const {
  startKyc,
  uploadDocument,
  uploadSelfie,
  submitKyc,
  validateKycDetails,
  getKycStatus,
  getKycDetails,
  resubmitKyc,
  getAdminKyc,
  getAdminKycById,
  approveKyc,
  rejectKyc
} = require('../controllers/kycController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Client-facing KYC routes
router.post('/start', authMiddleware, startKyc);
router.post('/upload-document', authMiddleware, upload.single('document'), uploadDocument);
router.post('/upload-selfie', authMiddleware, upload.single('selfie'), uploadSelfie);
router.post('/validate-details', authMiddleware, validateKycDetails);
router.post('/submit', authMiddleware, submitKyc);
router.get('/status', authMiddleware, getKycStatus);
router.get('/details', authMiddleware, getKycDetails);
router.put('/resubmit', authMiddleware, resubmitKyc);

// DEVELOPMENT ONLY: Reset KYC status for testing
router.get('/dev-reset', authMiddleware, async (req, res) => {
  try {
    const KycProfile = require('../models/KycProfile');
    const User = require('../models/User');
    
    await KycProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { status: 'NOT_STARTED', documents: [], aadhaarVerified: false } }
    );
    await User.findByIdAndUpdate(req.user._id, { $set: { kycStatus: 'NOT_STARTED' } });
    
    res.json({ message: 'KYC status reset to NOT_STARTED. You can now test the form again.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Admin-facing KYC routes
router.get('/admin', authMiddleware, checkRole('superadmin', 'admin', 'moderator', 'support'), getAdminKyc);
router.get('/admin/:id', authMiddleware, checkRole('superadmin', 'admin', 'moderator', 'support'), getAdminKycById);
router.put('/admin/approve', authMiddleware, checkRole('superadmin', 'admin', 'moderator', 'support'), approveKyc);
router.put('/admin/reject', authMiddleware, checkRole('superadmin', 'admin', 'moderator', 'support'), rejectKyc);

module.exports = router;
