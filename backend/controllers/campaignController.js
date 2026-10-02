const Campaign = require('../models/Campaign');
const BrandProfile = require('../models/BrandProfile');

const createCampaign = async (req, res) => {
  const { title, description, niche, budget, requirements } = req.body;
  try {
    const brandProfile = await BrandProfile.findOne({ userId: req.user.id });
    if (!brandProfile) {
      return res.status(404).json({ message: 'Brand profile not found. Please create one first.' });
    }

    const campaign = new Campaign({
      brandId: brandProfile._id,
      title,
      description,
      niche,
      budget,
      requirements,
      status: 'active' // Immediately active, no admin approval needed
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.brandId) {
      const brandProf = await BrandProfile.findOne({
        $or: [{ _id: req.query.brandId }, { userId: req.query.brandId }]
      });
      filter.brandId = brandProf ? brandProf._id : req.query.brandId;
    }
    if (req.query.minBudget) {
      filter.budget = { $gte: Number(req.query.minBudget) };
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    } else if (!req.query.status) {
      if (req.user?.role !== 'admin') {
        filter.status = 'active';
      }
    }
    
    let sortOptions = { createdAt: -1 };
    if (req.query.sortBy === 'oldest') sortOptions = { createdAt: 1 };
    if (req.query.sortBy === 'highest_budget') sortOptions = { budget: -1 };

    let campaigns = await Campaign.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('brandId', 'businessName logo')
      .lean();

    const total = await Campaign.countDocuments(filter);

    if (req.query.match === 'true' && req.user?.role === 'creator') {
      const creatorProfile = await require('../models/CreatorProfile').findOne({ userId: req.user.id }).lean();
      if (creatorProfile && creatorProfile.niche) {
        const calculateMatchScore = (campaign) => {
          let score = 0;
          if (campaign.status === 'active') score += 100;
          if (campaign.niche && campaign.niche.toLowerCase() === creatorProfile.niche.toLowerCase()) score += 50;
          if (campaign.budget) score += Math.min(campaign.budget / 100, 20);
          return score;
        };

        campaigns = campaigns.map(c => ({
          ...c,
          matchScore: calculateMatchScore(c)
        })).sort((a, b) => b.matchScore - a.matchScore);
      }
    }

    res.json({
      data: campaigns,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('brandId', 'businessName website description logo');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyCampaigns = async (req, res) => {
  try {
    const brandProfile = await BrandProfile.findOne({ userId: req.user.id });
    if (!brandProfile) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }
    const campaigns = await Campaign.find({ brandId: brandProfile._id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCampaign, getAllCampaigns, getCampaignById, getMyCampaigns };
