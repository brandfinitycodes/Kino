const Application = require('../models/Application');
const CreatorProfile = require('../models/CreatorProfile');
const Campaign = require('../models/Campaign');
const BrandProfile = require('../models/BrandProfile');
const Notification = require('../models/Notification');

// Helper to resolve brand User ObjectId for notifications
const resolveBrandUserId = async (brandIdOrProfile) => {
  if (!brandIdOrProfile) return null;
  if (typeof brandIdOrProfile === 'object' && brandIdOrProfile.userId) {
    return brandIdOrProfile.userId;
  }
  const brandProf = await BrandProfile.findById(brandIdOrProfile);
  if (brandProf && brandProf.userId) {
    return brandProf.userId;
  }
  return brandIdOrProfile;
};

const applyToCampaign = async (req, res) => {
  const { campaignId, message } = req.body;
  try {
    const creatorProfile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!creatorProfile) {
      return res.status(404).json({ message: 'Creator profile not found. Please create one first.' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== 'active') {
      return res.status(400).json({ message: 'This campaign is no longer active and cannot accept new applications.' });
    }

    const existingApplication = await Application.findOne({ campaignId, creatorId: creatorProfile._id });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this campaign.' });
    }

    const application = new Application({
      campaignId,
      creatorId: creatorProfile._id,
      message
    });
    await application.save();

    // Notify the brand that a new application was received (non-blocking)
    try {
      const brandUserId = await resolveBrandUserId(campaign.brandId);
      if (brandUserId) {
        await Notification.create({
          userId: brandUserId,
          message: `${creatorProfile.name || 'A creator'} applied to your campaign "${campaign.title}".`
        });
      }
    } catch (notifError) {
      console.error('Notification creation failed (non-critical):', notifError.message);
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCreatorApplications = async (req, res) => {
  try {
    const creatorProfile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!creatorProfile) return res.status(404).json({ message: 'Creator not found' });

    const applications = await Application.find({ creatorId: creatorProfile._id }).populate('campaignId');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrandApplications = async (req, res) => {
  try {
    const applications = await Application.find({ campaignId: req.params.campaignId }).populate('creatorId');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    let applications = [];
    if (req.user.role === 'creator') {
      const creatorProfile = await CreatorProfile.findOne({ userId: req.user.id });
      if (creatorProfile) {
        applications = await Application.find({ creatorId: creatorProfile._id }).populate('campaignId');
      }
    } else if (req.user.role === 'brand') {
      const brandProfile = await BrandProfile.findOne({ userId: req.user.id });
      if (brandProfile) {
        const campaigns = await Campaign.find({ brandId: brandProfile._id });
        const campaignIds = campaigns.map(c => c._id);
        applications = await Application.find({ campaignId: { $in: campaignIds } }).populate('creatorId campaignId');
      }
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['accepted', 'rejected', 'confirmed_by_creator'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'campaignId', populate: { path: 'brandId' } })
      .populate('creatorId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Step 1: Only a brand can accept or reject an application
    if (status === 'accepted' || status === 'rejected') {
      if (req.user.role !== 'brand') {
        return res.status(403).json({ message: 'Only brands can accept or reject applications.' });
      }
      if (application.status !== 'pending') {
        return res.status(400).json({ message: 'Only pending applications can be accepted or rejected.' });
      }
    }

    // Step 2: Only a creator can confirm, and only after brand has accepted
    if (status === 'confirmed_by_creator') {
      if (req.user.role !== 'creator') {
        return res.status(403).json({ message: 'Only creators can confirm applications.' });
      }
      if (application.status !== 'accepted') {
        return res.status(400).json({ message: 'Application must be accepted by the brand first.' });
      }
    }

    application.status = status;
    await application.save();

    // Auto-create deal if brand accepts the application or creator confirms
    if (status === 'accepted' || status === 'confirmed_by_creator') {
      const Deal = require('../models/Deal');
      const existingDeal = await Deal.findOne({ applicationId: application._id });
      if (!existingDeal) {
        await application.populate('campaignId');
        const deal = new Deal({
          applicationId: application._id,
          brandId: application.campaignId?.brandId,
          creatorId: application.creatorId?._id || application.creatorId,
          budget: application.campaignId?.budget || 0,
          status: 'pending_payment',
          paymentDetails: { status: 'pending' }
        });
        await deal.save();
      }
    }

    // Send notifications (non-blocking)
    try {
      const campaignTitle = application.campaignId?.title || 'a campaign';
      if (status === 'accepted' || status === 'rejected') {
        let creatorUserId = application.creatorId?.userId;
        if (!creatorUserId && application.creatorId) {
          const CreatorProfile = require('../models/CreatorProfile');
          const creatorProf = await CreatorProfile.findById(application.creatorId);
          creatorUserId = creatorProf?.userId;
        }
        if (creatorUserId) {
          await Notification.create({
            userId: creatorUserId,
            message: `Your application for "${campaignTitle}" has been ${status}. ${status === 'accepted' ? 'Please check Active Deals to view requirement details.' : ''}`
          });
        }
      } else if (status === 'confirmed_by_creator') {
        let brandUserId = application.campaignId?.brandId?.userId;
        if (!brandUserId && application.campaignId?.brandId) {
          const BrandProfile = require('../models/BrandProfile');
          const brandProf = await BrandProfile.findById(application.campaignId.brandId);
          brandUserId = brandProf?.userId || application.campaignId.brandId;
        }
        if (brandUserId) {
          await Notification.create({
            userId: brandUserId,
            message: `A creator has confirmed their collaboration for "${campaignTitle}". A deal is ready to be created.`
          });
        }
      }
    } catch (notifError) {
      console.error('Notification creation failed (non-critical):', notifError.message);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const nudgeBrand = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'campaignId', populate: { path: 'brandId' } })
      .populate('creatorId');

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'pending') return res.status(400).json({ message: 'Only pending applications can be nudged' });

    // Send a notification to the brand
    try {
      const brandUserId = application.campaignId?.brandId?.userId;
      const creatorName = application.creatorId?.name || 'A creator';
      if (brandUserId) {
        await Notification.create({
          userId: brandUserId,
          message: `${creatorName} nudged you about their pending application for "${application.campaignId?.title}".`
        });
      }
    } catch (notifError) {
      console.error('Notification creation failed (non-critical):', notifError.message);
    }

    res.json({ message: 'Nudge sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'pending') return res.status(400).json({ message: 'Only pending applications can be withdrawn' });

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyToCampaign, getCreatorApplications, getBrandApplications, updateApplicationStatus, getAllApplications, nudgeBrand, withdrawApplication };
