const KycProfile = require('../models/KycProfile');

const requireKYC = async (req, res, next) => {
  try {
    // Admin roles bypass KYC checks
    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    if (req.user && adminRoles.includes(req.user.role)) {
      return next();
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const kycProfile = await KycProfile.findOne({ userId: req.user.id });
    if (kycProfile && kycProfile.status === 'APPROVED') {
      return next();
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (user && (user.kycStatus === 'APPROVED' || user.isVerified)) {
      return next();
    }

    return res.status(403).json({ message: 'KYC verification required' });
  } catch (error) {
    console.error('requireKYC Middleware Error:', error);
    res.status(500).json({ message: 'Internal server error during KYC validation' });
  }
};

module.exports = { requireKYC };
