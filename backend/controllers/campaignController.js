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

const Application = require('../models/Application');

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('brandId', 'businessName website description logo')
      .lean();
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const applications = await Application.find({ campaignId: campaign._id })
      .populate('creatorId', 'name profilePicture')
      .lean();

    const acceptedApp = applications.find(a => a.status === 'accepted');
    const confirmedApp = applications.find(a => a.status === 'confirmed_by_creator');

    let stage = 'open';
    if (confirmedApp) {
      stage = 'confirmed';
    } else if (acceptedApp) {
      stage = 'awaiting_reassurance';
    }

    const campObj = campaign;
    res.json({
      ...campObj,
      applicationsCount: applications.length,
      hasAwaitingReassurance: Boolean(acceptedApp),
      acceptedCreatorName: acceptedApp?.creatorId?.name || null,
      confirmedCreatorName: confirmedApp?.creatorId?.name || null,
      stage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyCampaigns = async (req, res) => {
  try {
    const brandProfile = await BrandProfile.findOne({ userId: req.user.id }).lean();
    if (!brandProfile) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }
    const campaigns = await Campaign.find({ brandId: brandProfile._id }).sort({ createdAt: -1 }).lean();
    const campaignIds = campaigns.map(c => c._id);

    const applications = await Application.find({ campaignId: { $in: campaignIds } })
      .populate('creatorId', 'name profilePicture')
      .lean();

    const campaignsWithStats = campaigns.map(camp => {
      const campApps = applications.filter(a => a.campaignId.toString() === camp._id.toString());
      const acceptedApp = campApps.find(a => a.status === 'accepted');
      const confirmedApp = campApps.find(a => a.status === 'confirmed_by_creator');

      let stage = 'open';
      if (confirmedApp) {
        stage = 'confirmed';
      } else if (acceptedApp) {
        stage = 'awaiting_reassurance';
      }

      return {
        ...camp,
        applicationsCount: campApps.length,
        hasAwaitingReassurance: Boolean(acceptedApp),
        acceptedCreatorName: acceptedApp?.creatorId?.name || null,
        confirmedCreatorName: confirmedApp?.creatorId?.name || null,
        stage
      };
    });

    res.json(campaignsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCampaign = async (req, res) => {
  const { id } = req.params;
  const { title, description, niche, budget, requirements, status } = req.body;

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);

    if (!isAdmin) {
      const brandProfile = await BrandProfile.findOne({ userId: req.user.id });
      if (!brandProfile || !campaign.brandId.equals(brandProfile._id)) {
        return res.status(403).json({ message: 'You are not authorized to edit this campaign' });
      }
    }

    if (title !== undefined) campaign.title = title.trim();
    if (description !== undefined) campaign.description = description.trim();
    if (niche !== undefined) campaign.niche = niche;
    if (budget !== undefined) campaign.budget = Number(budget);
    if (requirements !== undefined) {
      campaign.requirements = Array.isArray(requirements)
        ? requirements.filter(r => typeof r === 'string' && r.trim().length > 0)
        : requirements.split(',').map(r => r.trim()).filter(Boolean);
    }
    if (status !== undefined) {
      const validStatuses = ['active', 'paused', 'inactive', 'completed'];
      if (validStatuses.includes(status)) {
        campaign.status = status;
      }
    }

    await campaign.save();
    res.json({ message: 'Campaign updated successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleCampaignStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);

    if (!isAdmin) {
      const brandProfile = await BrandProfile.findOne({ userId: req.user.id });
      if (!brandProfile || !campaign.brandId.equals(brandProfile._id)) {
        return res.status(403).json({ message: 'You are not authorized to change the status of this campaign' });
      }
    }

    const validStatuses = ['active', 'paused', 'inactive', 'completed'];
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      campaign.status = status;
    } else {
      // Toggle between active and paused
      campaign.status = campaign.status === 'active' ? 'paused' : 'active';
    }

    await campaign.save();
    res.json({ message: `Campaign status updated to ${campaign.status}`, campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);

    if (!isAdmin) {
      const brandProfile = await BrandProfile.findOne({ userId: req.user.id });
      if (!brandProfile || !campaign.brandId.equals(brandProfile._id)) {
        return res.status(403).json({ message: 'You are not authorized to delete this campaign' });
      }
    }

    // Check if there are active deals associated with this campaign's applications
    const Application = require('../models/Application');
    const Deal = require('../models/Deal');

    const applications = await Application.find({ campaignId: campaign._id });
    const appIds = applications.map(a => a._id);

    if (appIds.length > 0) {
      const activeDeals = await Deal.find({
        applicationId: { $in: appIds },
        status: { $in: ['pending_payment', 'in_progress', 'in_review', 'revision_requested', 'pending_clearance'] }
      });

      if (activeDeals.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete campaign with active deals in progress. Please pause or deactivate the campaign instead.'
        });
      }

      // Safe to clean up remaining applications
      await Application.deleteMany({ campaignId: campaign._id });
    }

    await Campaign.findByIdAndDelete(campaign._id);
    res.json({ message: 'Campaign deleted successfully', deletedId: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  getMyCampaigns,
  updateCampaign,
  toggleCampaignStatus,
  deleteCampaign
};
