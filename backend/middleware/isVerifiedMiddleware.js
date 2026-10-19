const KycProfile = require('../models/KycProfile');
const User = require('../models/User');

const isVerifiedMiddleware = async (req, res, next) => {
  try {
    // Admin roles bypass KYC checks
    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    if (req.user && adminRoles.includes(req.user.role)) {
      return next();
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (user && (user.isVerified || user.kycStatus === 'APPROVED')) {
      // Auto-update user isVerified flag and kycStatus if either was set
      if (!user.isVerified || user.kycStatus !== 'APPROVED') {
        user.isVerified = true;
        user.kycStatus = 'APPROVED';
        await user.save();
      }
      return next();
    }

    const kycProfile = await KycProfile.findOne({ userId });
    if (kycProfile && kycProfile.status === 'APPROVED') {
      // Auto-update user isVerified flag and kycStatus
      if (user) {
        user.isVerified = true;
        user.kycStatus = 'APPROVED';
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
