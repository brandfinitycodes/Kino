const BrandProfile = require('../models/BrandProfile');
const { imagekit } = require('../middleware/uploadMiddleware');

const mongoose = require('mongoose');

const updateProfile = async (req, res) => {
  const { 
    businessName, ownerName, location, businessType, industry, 
    operatingFrom, description, logo, website, preferences 
  } = req.body;
  try {
    const updateData = {
      businessName,
      ownerName,
      location,
      businessType,
      industry,
      operatingFrom,
      description,
      logo,
      website
    };

    if (preferences) {
      updateData.preferences = preferences;
    }

    const profile = await BrandProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(profile);
  } catch (error) {
    console.error('Brand Profile Update Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getBrandById = async (req, res) => {
  try {
    let brand = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      brand = await BrandProfile.findById(req.params.id).populate('userId', 'email name profilePicture');
      if (!brand) {
        brand = await BrandProfile.findOne({ userId: req.params.id }).populate('userId', 'email name profilePicture');
      }
    }
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrandProfileMe = async (req, res) => {
  try {
    let brand = await BrandProfile.findOne({ userId: req.user.id }).populate('userId', 'email');
    if (!brand) {
      // Lazy create on first login to avoid breaking dashboard and campaign links
      brand = new BrandProfile({
        userId: req.user.id,
        businessName: `Brand-${req.user.id.substring(req.user.id.length - 4)}`,
        description: null
      });
      await brand.save();
      brand = await BrandProfile.findOne({ userId: req.user.id }).populate('userId', 'email');
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    const profile = await BrandProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Brand profile not found' });
    
    // Automatically delete old logo file from ImageKit if it exists
    if (profile.logoFileId) {
      try {
        await imagekit.deleteFile(profile.logoFileId);
      } catch (err) {
        console.error('Failed to delete old logo from ImageKit:', err.message);
      }
    }

    const result = await imagekit.upload({
      file: req.file.buffer, // Buffer from multer.memoryStorage
      fileName: `logo_${req.user.id}_${Date.now()}`,
      folder: '/influencers_hub_profiles'
    });
    
    profile.logo = result.url;
    profile.logoFileId = result.fileId;
    await profile.save();
    
    res.json({ logo: profile.logo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLogo = async (req, res) => {
  try {
    const profile = await BrandProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Brand profile not found' });

    // Automatically delete logo file from ImageKit if it exists
    if (profile.logoFileId) {
      try {
        await imagekit.deleteFile(profile.logoFileId);
      } catch (err) {
        console.error('Failed to delete logo from ImageKit:', err.message);
      }
    }

    profile.logo = '';
    profile.logoFileId = null;
    await profile.save();

    res.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Delete Logo Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.industry && req.query.industry !== 'All') {
      filter.industry = req.query.industry;
    }
    if (req.query.search) {
      filter.businessName = { $regex: req.query.search, $options: 'i' };
    }

    const brands = await BrandProfile.find(filter)
      .populate('userId', 'email name profilePicture')
      .skip(skip)
      .limit(limit)
      .lean();
      
    const total = await BrandProfile.countDocuments(filter);

    res.json({
      data: brands,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProfile, getBrandById, getBrandProfileMe, uploadLogo, deleteLogo, getAllBrands };
