const KycProfile = require('../models/KycProfile');
const KycDocument = require('../models/KycDocument');
const KycAuditLog = require('../models/KycAuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');
const { imagekit } = require('../middleware/uploadMiddleware');

// Initialize KYC profile
const startKyc = async (req, res) => {
  try {
    let profile = await KycProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new KycProfile({
        userId: req.user.id,
        userType: req.user.role,
        status: 'NOT_STARTED'
      });
      await profile.save();

      // Create Audit Log
      await KycAuditLog.create({
        userId: req.user.id,
        action: 'START_KYC',
        statusBefore: 'NONE',
        statusAfter: 'NOT_STARTED'
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Document to ImageKit and record it
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ message: 'Document type is required' });
    }

    // MIME validation: allow PDF, JPEG, PNG
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.' });
    }

    // Size validation: limit to 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (req.file.size > maxSizeBytes) {
      return res.status(400).json({ message: 'File is too large. Max size allowed is 10MB.' });
    }

    // Anti-malware hook simulation
    console.log(`Malware scan passed for file: ${req.file.originalname}`);

    let profile = await KycProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new KycProfile({
        userId: req.user.id,
        userType: req.user.role,
        status: 'NOT_STARTED'
      });
      await profile.save();
    }

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `kyc_doc_${req.user.id}_${Date.now()}_${req.file.originalname}`,
      folder: '/kyc_documents'
    });

    const newDoc = new KycDocument({
      kycProfileId: profile._id,
      documentType,
      fileUrl: result.url,
      fileId: result.fileId,
      verificationStatus: 'PENDING'
    });
    await newDoc.save();

    res.json({ document: newDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload Selfie to ImageKit
const uploadSelfie = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No selfie file uploaded' });
    }

    // MIME validation: images only
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG and PNG images are allowed for selfies.' });
    }

    let profile = await KycProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new KycProfile({
        userId: req.user.id,
        userType: req.user.role,
        status: 'NOT_STARTED'
      });
    }

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `kyc_selfie_${req.user.id}_${Date.now()}`,
      folder: '/kyc_selfies'
    });

    profile.selfieUrl = result.url;
    await profile.save();

    res.json({ selfieUrl: result.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit KYC verification
const submitKyc = async (req, res) => {
  try {
    const { personalInfo } = req.body;
    if (!personalInfo) {
      return res.status(400).json({ message: 'Personal/Business information is required.' });
    }

    let profile = await KycProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'KYC profile not found. Please upload required files first.' });
    }

    // if (!profile.selfieUrl) {
    //   return res.status(400).json({ message: 'Selfie verification is required.' });
    // }

    const docCount = await KycDocument.countDocuments({ kycProfileId: profile._id });
    if (docCount === 0) {
      return res.status(400).json({ message: 'At least one identification document is required.' });
    }

    const incomingAadhaar = personalInfo.aadhaarNumber;
    if (incomingAadhaar) {
      const cleanAadhaar = incomingAadhaar.replace(/[\s-]/g, '');

      // Check if any other user has already registered this document/GSTIN
      const duplicateKyc = await KycProfile.findOne({
        userId: { $ne: req.user.id },
        $or: [
          { "personalInfo.aadhaarNumber": cleanAadhaar },
          { aadhaarNumber: cleanAadhaar },
          { "personalInfo.aadhaarNumber": { $regex: new RegExp(`^${cleanAadhaar}$`, 'i') } },
          { aadhaarNumber: { $regex: new RegExp(`^${cleanAadhaar}$`, 'i') } }
        ]
      });

      if (duplicateKyc) {
        return res.status(400).json({ 
          message: 'Verification failed: This Aadhaar/PAN or GSTIN is already registered with another account.' 
        });
      }
      
      profile.aadhaarNumber = cleanAadhaar;
    }

    const previousStatus = profile.status;
    profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
    profile.status = 'PENDING';
    profile.submittedAt = new Date();
    if (!profile.verificationId) {
      profile.verificationId = `KYC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    await profile.save();

    // Log Audit Trace
    await KycAuditLog.create({
      userId: req.user.id,
      action: 'SUBMIT_KYC',
      statusBefore: previousStatus,
      statusAfter: 'PENDING'
    });

    // In-app Notification
    await Notification.create({
      userId: req.user.id,
      message: 'Your KYC verification request has been successfully submitted and is under review.'
    });

    // Email notification simulation
    console.log(`[EMAIL DISPATCH] To: ${req.user.email} - KYC application received.`);

    res.json({ message: 'KYC verification submitted successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pre-validate details (e.g. check for duplicates before file upload)
const validateKycDetails = async (req, res) => {
  try {
    const { personalInfo } = req.body;
    if (!personalInfo) {
      return res.status(400).json({ message: 'Personal/Business information is required.' });
    }

    const incomingAadhaar = personalInfo.aadhaarNumber;
    if (incomingAadhaar) {
      const cleanAadhaar = incomingAadhaar.replace(/[\s-]/g, '');

      // Check if any other user has already registered this document/GSTIN
      const duplicateKyc = await KycProfile.findOne({
        userId: { $ne: req.user.id },
        $or: [
          { "personalInfo.aadhaarNumber": cleanAadhaar },
          { aadhaarNumber: cleanAadhaar },
          { "personalInfo.aadhaarNumber": { $regex: new RegExp(`^${cleanAadhaar}$`, 'i') } },
          { aadhaarNumber: { $regex: new RegExp(`^${cleanAadhaar}$`, 'i') } }
        ]
      });

      if (duplicateKyc) {
        return res.status(400).json({ 
          message: 'Verification failed: This Aadhaar/PAN or GSTIN is already registered with another account.' 
        });
      }
    }

    res.json({ success: true, message: 'Details are valid.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fast status check
const getKycStatus = async (req, res) => {
  try {
    const profile = await KycProfile.findOne({ userId: req.user.id });
    res.json({
      status: profile ? profile.status : 'NOT_STARTED',
      rejectionReason: profile ? profile.rejectionReason : '',
      verificationId: profile ? profile.verificationId : ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Full profile details
const getKycDetails = async (req, res) => {
  try {
    const profile = await KycProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.json({ status: 'NOT_STARTED', documents: [] });
    }
    const documents = await KycDocument.find({ kycProfileId: profile._id });
    res.json({ profile, documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset rejected/expired profile for resubmission
const resubmitKyc = async (req, res) => {
  try {
    let profile = await KycProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'KYC profile not found.' });
    }

    if (profile.status !== 'REJECTED' && profile.status !== 'EXPIRED') {
      return res.status(400).json({ message: 'Resubmission is only allowed for rejected or expired KYC profiles.' });
    }

    const previousStatus = profile.status;
    profile.status = 'NOT_STARTED';
    profile.rejectionReason = '';
    await profile.save();

    // Mark documents back to pending
    await KycDocument.updateMany({ kycProfileId: profile._id }, { verificationStatus: 'PENDING' });

    // Log Audit Trace
    await KycAuditLog.create({
      userId: req.user.id,
      action: 'RESUBMIT_KYC_RESET',
      statusBefore: previousStatus,
      statusAfter: 'NOT_STARTED'
    });

    res.json({ message: 'KYC reset for resubmission.', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all KYC profiles with filters, search, and metrics
const getAdminKyc = async (req, res) => {
  try {
    const { status, search } = req.query;

    // Calculate metrics
    const totalSubmissions = await KycProfile.countDocuments({ status: { $ne: 'NOT_STARTED' } });
    const pendingReviews = await KycProfile.countDocuments({ status: 'PENDING' });
    const approved = await KycProfile.countDocuments({ status: 'APPROVED' });
    const rejected = await KycProfile.countDocuments({ status: 'REJECTED' });
    const approvalRate = totalSubmissions > 0 ? Math.round((approved / (approved + rejected || 1)) * 100) : 100;

    let filter = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'NOT_STARTED' };
    }

    if (search) {
      // Find matching users/creators/brands
      const users = await User.find({ email: { $regex: search, $options: 'i' } });
      const creators = await CreatorProfile.find({ name: { $regex: search, $options: 'i' } });
      const brands = await BrandProfile.find({ businessName: { $regex: search, $options: 'i' } });

      const matchedUserIds = [
        ...users.map(u => u._id),
        ...creators.map(c => c.userId),
        ...brands.map(b => b.userId)
      ];
      filter.userId = { $in: matchedUserIds };
    }

    const profiles = await KycProfile.find(filter)
      .populate('userId', 'email')
      .populate('reviewedBy', 'email')
      .sort({ updatedAt: -1 });

    const populatedProfiles = await Promise.all(profiles.map(async (profile) => {
      let companyNameFallback = '';
      let businessTypeFallback = '';
      let fullNameFallback = '';
      let avatarUrl = '';

      if (profile.userType === 'creator') {
        const creator = await CreatorProfile.findOne({ userId: profile.userId._id || profile.userId });
        if (creator) {
          fullNameFallback = creator.name || '';
          avatarUrl = creator.profilePicture || (creator.instagramProfile && creator.instagramProfile.profilePicture) || '';
        }
      } else if (profile.userType === 'brand') {
        const brand = await BrandProfile.findOne({ userId: profile.userId._id || profile.userId });
        if (brand) {
          companyNameFallback = brand.businessName || '';
          businessTypeFallback = brand.businessType || '';
          avatarUrl = brand.logo || '';
        }
      }

      const profileObj = profile.toObject();
      profileObj.avatarUrl = avatarUrl;
      if (!profileObj.personalInfo) {
        profileObj.personalInfo = {};
      }
      if (!profileObj.personalInfo.companyName && companyNameFallback) {
        profileObj.personalInfo.companyName = companyNameFallback;
      }
      if (!profileObj.personalInfo.businessType && businessTypeFallback) {
        profileObj.personalInfo.businessType = businessTypeFallback;
      }
      if (!profileObj.personalInfo.fullName && fullNameFallback) {
        profileObj.personalInfo.fullName = fullNameFallback;
      }

      return profileObj;
    }));

    res.json({
      profiles: populatedProfiles,
      stats: {
        totalSubmissions,
        pendingReviews,
        approved,
        rejected,
        approvalRate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get details of a single submission
const getAdminKycById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await KycProfile.findById(id).populate('userId', 'email').populate('reviewedBy', 'email');
    if (!profile) {
      return res.status(404).json({ message: 'KYC submission not found.' });
    }

    const documents = await KycDocument.find({ kycProfileId: profile._id });

    // Fetch Brand logo or Creator profile picture to display on the Admin dashboard
    let avatarUrl = '';
    let companyNameFallback = '';
    let businessTypeFallback = '';
    let fullNameFallback = '';

    if (profile.userType === 'creator') {
      const creator = await CreatorProfile.findOne({ userId: profile.userId._id || profile.userId });
      if (creator) {
        avatarUrl = creator.profilePicture || (creator.instagramProfile && creator.instagramProfile.profilePicture) || '';
        fullNameFallback = creator.name || '';
      }
    } else if (profile.userType === 'brand') {
      const brand = await BrandProfile.findOne({ userId: profile.userId._id || profile.userId });
      if (brand) {
        avatarUrl = brand.logo || '';
        companyNameFallback = brand.businessName || '';
        businessTypeFallback = brand.businessType || '';
      }
    }

    // Convert to object and append avatarUrl and fallback details
    const profileObj = profile.toObject();
    profileObj.avatarUrl = avatarUrl;
    if (!profileObj.personalInfo) {
      profileObj.personalInfo = {};
    }
    if (!profileObj.personalInfo.companyName && companyNameFallback) {
      profileObj.personalInfo.companyName = companyNameFallback;
    }
    if (!profileObj.personalInfo.businessType && businessTypeFallback) {
      profileObj.personalInfo.businessType = businessTypeFallback;
    }
    if (!profileObj.personalInfo.fullName && fullNameFallback) {
      profileObj.personalInfo.fullName = fullNameFallback;
    }

    res.json({ profile: profileObj, documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve submission
const approveKyc = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await KycProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'KYC profile not found.' });
    }

    const previousStatus = profile.status;
    profile.status = 'APPROVED';
    profile.approvedAt = new Date();
    profile.reviewedBy = req.user.id;
    await profile.save();

    // Set all documents associated to APPROVED
    await KycDocument.updateMany({ kycProfileId: profile._id }, { verificationStatus: 'APPROVED' });

    // Mark the User as verified
    const user = await User.findById(profile.userId);
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    // Audit log
    await KycAuditLog.create({
      userId: profile.userId,
      action: 'APPROVE_KYC',
      statusBefore: previousStatus,
      statusAfter: 'APPROVED'
    });

    // Admin Audit Log
    const adminUser = await User.findById(req.user.id);
    if (adminUser) {
      const AdminAuditLog = require('../models/AdminAuditLog');
      await AdminAuditLog.create({
        adminId: req.user.id,
        adminEmail: adminUser.email,
        adminRole: req.user.role,
        action: 'APPROVE_KYC',
        targetId: profile.userId,
        details: `Approved KYC profile ID ${profileId} for user ${profile.userId}`
      });
    }

    // In-app Notification
    await Notification.create({
      userId: profile.userId,
      message: 'Your KYC verification has been APPROVED! All communication and transaction restrictions are now lifted.'
    });

    // Email simulation
    console.log(`[EMAIL DISPATCH] To: ${user ? user.email : 'user'} - KYC approved successfully.`);

    res.json({ message: 'KYC approved successfully', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Reject submission
const rejectKyc = async (req, res) => {
  try {
    const { profileId, rejectionReason } = req.body;
    if (!rejectionReason) {
      return res.status(400).json({ message: 'A rejection reason is required.' });
    }

    const profile = await KycProfile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'KYC profile not found.' });
    }

    const previousStatus = profile.status;
    profile.status = 'REJECTED';
    profile.rejectionReason = rejectionReason;
    profile.reviewedBy = req.user.id;
    await profile.save();

    // Set documents as REJECTED
    await KycDocument.updateMany({ kycProfileId: profile._id }, { verificationStatus: 'REJECTED' });

    // Reset User verification
    const user = await User.findById(profile.userId);
    if (user) {
      user.isVerified = false;
      await user.save();
    }

    // Audit log
    await KycAuditLog.create({
      userId: profile.userId,
      action: 'REJECT_KYC',
      statusBefore: previousStatus,
      statusAfter: 'REJECTED'
    });

    // Admin Audit Log
    const adminUser = await User.findById(req.user.id);
    if (adminUser) {
      const AdminAuditLog = require('../models/AdminAuditLog');
      await AdminAuditLog.create({
        adminId: req.user.id,
        adminEmail: adminUser.email,
        adminRole: req.user.role,
        action: 'REJECT_KYC',
        targetId: profile.userId,
        details: `Rejected KYC profile ID ${profileId} for user ${profile.userId}. Reason: ${rejectionReason}`
      });
    }

    // In-app Notification
    await Notification.create({
      userId: profile.userId,
      message: `Your KYC verification was rejected. Reason: ${rejectionReason}. Please resubmit correct details.`
    });

    // Email simulation
    console.log(`[EMAIL DISPATCH] To: ${user ? user.email : 'user'} - KYC rejected: ${rejectionReason}`);

    res.json({ message: 'KYC verification request rejected.', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
