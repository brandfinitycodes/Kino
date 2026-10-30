const path = require('path');
const CreatorProfile = require('../models/CreatorProfile');
const Deal = require('../models/Deal');
const Application = require('../models/Application');
const { imagekit } = require('../middleware/uploadMiddleware');

const updateProfile = async (req, res) => {
  const { 
    name, age, bio, location, niche, expertise, 
    portfolioLink, followerCount, responseTime, portfolioVideos,
    payoutDetails, socialLinks, shippingAddress, willNotPromote
  } = req.body;
  try {
    const updateData = {
      name,
      age,
      bio,
      location,
      niche,
      expertise,
      portfolioLink,
      followerCount,
      responseTime,
      portfolioVideos,
      socialLinks
    };

    if (shippingAddress) {
      updateData.shippingAddress = shippingAddress;
    }

    if (willNotPromote) {
      updateData.willNotPromote = willNotPromote;
    }

    if (payoutDetails) {
      updateData.payoutDetails = payoutDetails;
      if (payoutDetails.method === 'upi' && payoutDetails.upiId) {
        updateData.payoutDetails.isComplete = true;
      } else if (payoutDetails.method === 'bank' && payoutDetails.accountHolderName && payoutDetails.bankAccountNumber && payoutDetails.ifscCode) {
        updateData.payoutDetails.isComplete = true;
      } else {
        updateData.payoutDetails.isComplete = false;
      }
    }

    const profile = await CreatorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(profile);
  } catch (error) {
    console.error('Creator Profile Update Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllCreators = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.niche && req.query.niche !== 'All') {
      filter.niche = req.query.niche;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const creators = await CreatorProfile.find(filter)
      .populate('userId', 'email')
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await CreatorProfile.countDocuments(filter);

    res.json({
      data: creators,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const normalizePortfolioVideoUrl = (url) => {
  if (!url) return url;
  if (url.includes('ik.imagekit.io') && !/\.(mp4|webm|mov|mkv|m4v)($|\?)/i.test(url) && !url.endsWith('/ik-video.mp4')) {
    return url.replace(/\/?$/, '/ik-video.mp4');
  }
  return url;
};

const getCreatorById = async (req, res) => {
  try {
    const creator = await CreatorProfile.findById(req.params.id).populate('userId', 'email');
    if (!creator) return res.status(404).json({ message: 'Creator not found' });

    if (creator.portfolioVideos && creator.portfolioVideos.length > 0) {
      let changed = false;
      const updatedVideos = creator.portfolioVideos.map(v => {
        const item = v.toObject ? v.toObject() : { ...v };
        if (item.url) {
          const normalized = normalizePortfolioVideoUrl(item.url);
          if (normalized !== item.url) {
            item.url = normalized;
            changed = true;
          }
        }
        return item;
      });
      if (changed) {
        creator.portfolioVideos = updatedVideos;
        await CreatorProfile.updateOne({ _id: creator._id }, { portfolioVideos: updatedVideos });
      }
    }

    // Fetch real completed deals and platform stats
    const possibleCreatorIds = [creator._id];
    if (creator.userId?._id || creator.userId) {
      possibleCreatorIds.push(creator.userId._id || creator.userId);
    }

    const applications = await Application.find({ creatorId: { $in: possibleCreatorIds } }).select('_id').lean();
    const applicationIds = applications.map(a => a._id);

    const dealQuery = {
      $or: [
        { creatorId: { $in: possibleCreatorIds } },
        ...(applicationIds.length > 0 ? [{ applicationId: { $in: applicationIds } }] : [])
      ]
    };

    const completedDeals = await Deal.find({
      ...dealQuery,
      status: 'completed'
    })
      .sort({ updatedAt: -1 })
      .populate('brandId', 'businessName logo')
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'campaignId', populate: { path: 'brandId', select: 'businessName logo' } }
        ]
      })
      .lean();

    const totalDealsCount = await Deal.countDocuments(dealQuery);

    const verifiedWork = completedDeals.map(d => {
      const brand = d.brandId || d.applicationId?.campaignId?.brandId;
      const title = d.title || d.applicationId?.campaignId?.title || (d.packageTier ? `${d.packageTier.charAt(0).toUpperCase() + d.packageTier.slice(1)} Tier Package Collaboration` : 'Campaign Deal');
      return {
        _id: d._id,
        title,
        brandName: brand?.businessName || 'Verified Brand',
        brandLogo: brand?.logo || null,
        budget: d.budget || d.applicationId?.campaignId?.budget || 0,
        completedAt: d.updatedAt || d.createdAt,
        originType: d.originType || 'campaign'
      };
    });

    const creatorObj = creator.toObject ? creator.toObject() : { ...creator };
    creatorObj.verifiedWork = verifiedWork;
    creatorObj.platformStats = {
      completedDealsCount: verifiedWork.length,
      totalDealsCount,
      completionRate: totalDealsCount > 0 ? Math.round((verifiedWork.length / totalDealsCount) * 100) : 100,
      isNewCreator: verifiedWork.length === 0
    };

    res.json(creatorObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCreatorProfileMe = async (req, res) => {
  try {
    let creator = await CreatorProfile.findOne({ userId: req.user.id }).populate('userId', 'email');
    if (!creator) {
      creator = new CreatorProfile({
        userId: req.user.id,
        name: `Creator-${req.user.id.substring(req.user.id.length - 4)}`
      });
      await creator.save();
      creator = await CreatorProfile.findOne({ userId: req.user.id }).populate('userId', 'email');
    }

    if (creator && creator.portfolioVideos && creator.portfolioVideos.length > 0) {
      let changed = false;
      const updatedVideos = creator.portfolioVideos.map(v => {
        const item = v.toObject ? v.toObject() : { ...v };
        if (item.url) {
          const normalized = normalizePortfolioVideoUrl(item.url);
          if (normalized !== item.url) {
            item.url = normalized;
            changed = true;
          }
        }
        return item;
      });
      if (changed) {
        creator.portfolioVideos = updatedVideos;
        await CreatorProfile.updateOne({ _id: creator._id }, { portfolioVideos: updatedVideos });
      }
    }

    const possibleCreatorIds = [creator._id, req.user.id];
    const applications = await Application.find({ creatorId: { $in: possibleCreatorIds } }).select('_id').lean();
    const applicationIds = applications.map(a => a._id);

    const dealQuery = {
      $or: [
        { creatorId: { $in: possibleCreatorIds } },
        ...(applicationIds.length > 0 ? [{ applicationId: { $in: applicationIds } }] : [])
      ]
    };

    const completedDeals = await Deal.find({
      ...dealQuery,
      status: 'completed'
    })
      .sort({ updatedAt: -1 })
      .populate('brandId', 'businessName logo')
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'campaignId', populate: { path: 'brandId', select: 'businessName logo' } }
        ]
      })
      .lean();

    const totalDealsCount = await Deal.countDocuments(dealQuery);

    const verifiedWork = completedDeals.map(d => {
      const brand = d.brandId || d.applicationId?.campaignId?.brandId;
      const title = d.title || d.applicationId?.campaignId?.title || (d.packageTier ? `${d.packageTier.charAt(0).toUpperCase() + d.packageTier.slice(1)} Tier Package Collaboration` : 'Campaign Deal');
      return {
        _id: d._id,
        title,
        brandName: brand?.businessName || 'Verified Brand',
        brandLogo: brand?.logo || null,
        budget: d.budget || d.applicationId?.campaignId?.budget || 0,
        completedAt: d.updatedAt || d.createdAt,
        originType: d.originType || 'campaign'
      };
    });

    const creatorObj = creator.toObject ? creator.toObject() : { ...creator };
    creatorObj.verifiedWork = verifiedWork;
    creatorObj.platformStats = {
      completedDealsCount: verifiedWork.length,
      totalDealsCount,
      completionRate: totalDealsCount > 0 ? Math.round((verifiedWork.length / totalDealsCount) * 100) : 100,
      isNewCreator: verifiedWork.length === 0
    };

    res.json(creatorObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    const profile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' });
    
    // Automatically delete old avatar file from ImageKit if it exists
    if (profile.profilePictureFileId) {
      try {
        await imagekit.deleteFile(profile.profilePictureFileId);
      } catch (err) {
        console.error('Failed to delete old avatar from ImageKit:', err.message);
      }
    }

    const result = await imagekit.upload({
      file: req.file.buffer, // Buffer from multer.memoryStorage
      fileName: `avatar_${req.user.id}_${Date.now()}`,
      folder: '/influencers_hub_profiles'
    });
    
    profile.profilePicture = result.url;
    profile.profilePictureFileId = result.fileId;
    await profile.save();
    
    res.json({ profilePicture: profile.profilePicture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' });

    // Automatically delete avatar file from ImageKit if it exists
    if (profile.profilePictureFileId) {
      try {
        await imagekit.deleteFile(profile.profilePictureFileId);
      } catch (err) {
        console.error('Failed to delete avatar from ImageKit:', err.message);
      }
    }

    profile.profilePicture = '';
    profile.profilePictureFileId = null;
    await profile.save();

    res.json({ message: 'Avatar deleted successfully' });
  } catch (error) {
    console.error('Delete Avatar Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const uploadPortfolioVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const ext = req.file.originalname ? path.extname(req.file.originalname) : '.mp4';
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `portfolio_${req.user.id}_${Date.now()}${ext || '.mp4'}`,
      folder: '/portfolio_videos',
      useUniqueFileName: true
    });

    // Update the CreatorProfile in database
    const profile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    const newVideo = {
      url: normalizePortfolioVideoUrl(result.url),
      fileId: result.fileId,
      title: 'Untitled Work'
    };

    profile.portfolioVideos.push(newVideo);
    await profile.save();

    res.json(newVideo);
  } catch (error) {
    console.error('Portfolio Video Upload Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deletePortfolioVideo = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!fileId) return res.status(400).json({ message: 'File ID is required' });

    await imagekit.deleteFile(fileId);

    // Remove from Database
    const profile = await CreatorProfile.findOne({ userId: req.user.id });
    if (profile) {
      profile.portfolioVideos = profile.portfolioVideos.filter(v => v.fileId !== fileId);
      await profile.save();
    }

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Portfolio Video Delete Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  updateProfile, 
  getAllCreators, 
  getCreatorById, 
  getCreatorProfileMe, 
  uploadAvatar,
  deleteAvatar,
  uploadPortfolioVideo,
  deletePortfolioVideo
};
