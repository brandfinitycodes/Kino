const CreatorProfile = require('../models/CreatorProfile');
const { imagekit } = require('../middleware/uploadMiddleware');

const updateProfile = async (req, res) => {
  const { 
    name, age, bio, location, niche, expertise, 
    portfolioLink, pricing, followerCount, responseTime, portfolioVideos,
    payoutDetails, socialLinks
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

    if (pricing) {
      updateData.pricing = pricing;
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

const getCreatorById = async (req, res) => {
  try {
    const creator = await CreatorProfile.findById(req.params.id).populate('userId', 'email');
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    res.json(creator);
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
    res.json(creator);
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

    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `portfolio_${req.user.id}_${Date.now()}`,
      folder: '/portfolio_videos',
      useUniqueFileName: true
    });

    // Update the CreatorProfile in database
    const profile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    const newVideo = {
      url: result.url,
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
