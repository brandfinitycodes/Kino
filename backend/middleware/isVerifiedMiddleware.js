const KycProfile = require('../models/KycProfile');
const User = require('../models/User');

const isVerifiedMiddleware = async (req, res, next) => {
  try {
    // Admin roles bypass KYC checks
    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    if (req.user && adminRoles.includes(req.user.role)) {
      return next();
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (user && user.isVerified) {
      return next();
    }

    const kycProfile = await KycProfile.findOne({ userId: req.user.id });
    if (kycProfile && kycProfile.status === 'APPROVED') {
      // Auto-update user isVerified flag if not already set
      if (user && !user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      return next();
    }

    return res.status(403).json({ message: 'Action denied. Your account is not verified. Please complete your KYC verification and ensure it is APPROVED before proceeding.' });
  } catch (error) {
    console.error('isVerifiedMiddleware Error:', error);
    res.status(500).json({ message: 'Internal server error during verification check' });
  }
};

module.exports = { isVerifiedMiddleware };
