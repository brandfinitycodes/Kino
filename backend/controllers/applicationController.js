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

// Helper to resolve creator User ObjectId for notifications
const resolveCreatorUserId = async (creatorIdOrProfile) => {
  if (!creatorIdOrProfile) return null;
  if (typeof creatorIdOrProfile === 'object' && creatorIdOrProfile.userId) {
    return creatorIdOrProfile.userId;
  }
  const creatorProf = await CreatorProfile.findById(creatorIdOrProfile);
  if (creatorProf && creatorProf.userId) {
    return creatorProf.userId;
  }
  return creatorIdOrProfile;
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
      const creatorProfile = await CreatorProfile.findOne({ userId: req.user.id }).select('_id').lean();
      if (creatorProfile) {
        applications = await Application.find({ creatorId: creatorProfile._id }).populate('campaignId').lean();
      }
    } else if (req.user.role === 'brand') {
      const brandProfile = await BrandProfile.findOne({ userId: req.user.id }).select('_id').lean();
      if (brandProfile) {
        const campaigns = await Campaign.find({ brandId: brandProfile._id }).select('_id').lean();
        const campaignIds = campaigns.map(c => c._id);
        applications = await Application.find({ campaignId: { $in: campaignIds } }).populate('creatorId campaignId').lean();
      }
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'shortlisted', 'accepted', 'rejected', 'confirmed_by_creator', 'rejected_by_creator'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'campaignId', populate: { path: 'brandId' } })
      .populate('creatorId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Step 1: Only a brand can shortlist, un-shortlist (to pending), accept, or reject
    if (status === 'shortlisted' || status === 'pending') {
      if (req.user.role !== 'brand') {
        return res.status(403).json({ message: 'Only brands can change candidate shortlist status.' });
      }
      if (!['pending', 'shortlisted'].includes(application.status)) {
        return res.status(400).json({ message: 'Only pending or shortlisted applications can be modified.' });
      }
    }

    if (status === 'accepted' || status === 'rejected') {
      if (req.user.role !== 'brand') {
        return res.status(403).json({ message: 'Only brands can accept or reject applications.' });
      }
      if (!['pending', 'shortlisted'].includes(application.status)) {
        return res.status(400).json({ message: 'Only pending or shortlisted applications can be accepted or rejected.' });
      }
    }

    // Step 2: Only a creator can confirm or reject after brand has accepted
    if (status === 'confirmed_by_creator' || status === 'rejected_by_creator') {
      if (req.user.role !== 'creator') {
        return res.status(403).json({ message: 'Only creators can confirm or reject applications.' });
      }
      if (application.status !== 'accepted') {
        return res.status(400).json({ message: 'Application must be accepted by the brand first.' });
      }
    }

    application.status = status;
    await application.save();

    // Update Campaign Status based on the Application Status
    const Campaign = require('../models/Campaign');
    const campaignId = application.campaignId?._id || application.campaignId;
    if (campaignId) {
      if (status === 'accepted') {
        await Campaign.findByIdAndUpdate(campaignId, { status: 'inactive' });
      } else if (status === 'rejected_by_creator') {
        await Campaign.findByIdAndUpdate(campaignId, { status: 'active' });
      }
    }

    // Auto-create deal ONLY when creator confirms reassurance
    if (status === 'confirmed_by_creator') {
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

    // Send notifications & real-time events (non-blocking)
    try {
      const campaignTitle = application.campaignId?.title || 'a campaign';
      const creatorUserId = await resolveCreatorUserId(application.creatorId);
      const brandUserId = await resolveBrandUserId(application.campaignId?.brandId);
      const creatorName = application.creatorId?.name || 'Creator';
      const io = req.app.get('socketio');

      if (status === 'shortlisted') {
        if (creatorUserId) {
          await Notification.create({
            userId: creatorUserId,
            message: `⭐ Great news! You have been Shortlisted for "${campaignTitle}". The brand is reviewing top candidates!`,
            link: '/creator-dashboard?tab=applications',
            actionLabel: 'View Application'
          });
          if (io) io.to(String(creatorUserId)).emit('notification', { message: `Shortlisted for "${campaignTitle}"` });
        }
      } else if (status === 'accepted') {
        if (creatorUserId) {
          await Notification.create({
            userId: creatorUserId,
            message: `🎉 Great news! Brand accepted your application for "${campaignTitle}". Please review & confirm your collaboration commitment (Reassurance) in Applications.`,
            link: '/creator-dashboard?tab=applications',
            actionLabel: 'Confirm Collaboration'
          });
          if (io) {
            io.to(String(creatorUserId)).emit('notification', { message: `Accepted for "${campaignTitle}" - Reassurance Required` });
            io.to(String(creatorUserId)).emit('application_status_changed', { applicationId: application._id, status: 'accepted', campaignId });
          }
        }
        if (brandUserId) {
          await Notification.create({
            userId: brandUserId,
            message: `Candidate @${creatorName} accepted for "${campaignTitle}". Stage: Waiting for creator reassurance & confirmation before milestone escrow funding begins.`,
            link: `/campaigns/${campaignId}`,
            actionLabel: 'View Candidate'
          });
          if (io) {
            io.to(String(brandUserId)).emit('notification', { message: `Awaiting reassurance for "${campaignTitle}"` });
            io.to(String(brandUserId)).emit('application_status_changed', { applicationId: application._id, status: 'accepted', campaignId });
          }
        }
      } else if (status === 'rejected') {
        if (creatorUserId) {
          await Notification.create({
            userId: creatorUserId,
            message: `Your application for "${campaignTitle}" was not selected by the brand.`,
            link: '/creator-dashboard?tab=applications',
            actionLabel: 'View Applications'
          });
          if (io) io.to(String(creatorUserId)).emit('notification', { message: `Application update for "${campaignTitle}"` });
        }
      } else if (status === 'confirmed_by_creator') {
        if (brandUserId) {
          await Notification.create({
            userId: brandUserId,
            message: `🚀 @${creatorName} has confirmed reassurance for "${campaignTitle}"! Deal is ready in Active Deals — fund Milestone Coins into escrow to start work.`,
            link: '/brand-dashboard?tab=deals',
            actionLabel: 'Fund Deal'
          });
          if (io) {
            io.to(String(brandUserId)).emit('notification', { message: `@${creatorName} confirmed reassurance for "${campaignTitle}"!` });
            io.to(String(brandUserId)).emit('application_status_changed', { applicationId: application._id, status: 'confirmed_by_creator', campaignId });
          }
        }
        if (creatorUserId) {
          await Notification.create({
            userId: creatorUserId,
            message: `Collaboration confirmed for "${campaignTitle}"! The deal is initiated. Waiting for brand to secure Milestone Coins in escrow.`,
            link: '/creator-dashboard?tab=deals',
            actionLabel: 'View Deal'
          });
          if (io) {
            io.to(String(creatorUserId)).emit('notification', { message: `Deal initiated for "${campaignTitle}"` });
            io.to(String(creatorUserId)).emit('application_status_changed', { applicationId: application._id, status: 'confirmed_by_creator', campaignId });
          }
        }
      } else if (status === 'rejected_by_creator') {
        if (brandUserId) {
          await Notification.create({
            userId: brandUserId,
            message: `@${creatorName} declined the collaboration for "${campaignTitle}". Campaign has been reactivated for other applicants.`,
            link: `/campaigns/${campaignId}`,
            actionLabel: 'View Campaign'
          });
          if (io) {
            io.to(String(brandUserId)).emit('notification', { message: `Collaboration declined for "${campaignTitle}"` });
            io.to(String(brandUserId)).emit('application_status_changed', { applicationId: application._id, status: 'rejected_by_creator', campaignId });
          }
        }
      }
    } catch (notifError) {
      console.error('Notification creation failed (non-critical):', notifError.message);
    }

    const populatedApp = await Application.findById(application._id)
      .populate({ path: 'campaignId', populate: { path: 'brandId' } })
      .populate('creatorId');

    res.json(populatedApp || application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const nudgeCreator = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'campaignId', populate: { path: 'brandId' } })
      .populate('creatorId');

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted applications awaiting confirmation can be nudged' });
    }

    const creatorUserId = await resolveCreatorUserId(application.creatorId);
    const campaignTitle = application.campaignId?.title || 'a campaign';

    if (creatorUserId) {
      await Notification.create({
        userId: creatorUserId,
        message: `🔔 Reminder: Brand is waiting for your reassurance confirmation for "${campaignTitle}". Please confirm in Applications to activate the deal!`,
        link: '/creator-dashboard?tab=applications',
        actionLabel: 'Confirm Collaboration'
      });

      const io = req.app.get('socketio');
      if (io) {
        io.to(String(creatorUserId)).emit('notification', {
          message: `Reminder for "${campaignTitle}".`
        });
      }
    }

    res.json({ message: 'Creator nudged successfully.' });
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
    if (!['pending', 'shortlisted'].includes(application.status)) {
      return res.status(400).json({ message: 'Only pending or shortlisted applications can be nudged' });
    }

    // Send a notification to the brand
    try {
      const brandUserId = application.campaignId?.brandId?.userId;
      const creatorName = application.creatorId?.name || 'A creator';
      if (brandUserId) {
        await Notification.create({
          userId: brandUserId,
          message: `${creatorName} nudged you about their application for "${application.campaignId?.title}".`
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
    if (!['pending', 'shortlisted'].includes(application.status)) {
      return res.status(400).json({ message: 'Only pending or shortlisted applications can be withdrawn' });
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editApplicationProposal = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Proposal pitch message cannot be empty.' });
  }

  try {
    const creatorProfile = await CreatorProfile.findOne({ userId: req.user.id });
    if (!creatorProfile) {
      return res.status(404).json({ message: 'Creator profile not found.' });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const creatorId = application.creatorId?._id || application.creatorId;
    if (creatorId.toString() !== creatorProfile._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this application.' });
    }

    if (!['pending', 'shortlisted'].includes(application.status)) {
      return res.status(400).json({ 
        message: `Cannot edit proposal once application has been ${application.status}.` 
      });
    }

    application.message = message.trim();
    await application.save();

    res.json({ message: 'Proposal updated successfully.', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  applyToCampaign, 
  getCreatorApplications, 
  getBrandApplications, 
  updateApplicationStatus, 
  getAllApplications, 
  nudgeBrand, 
  nudgeCreator,
  withdrawApplication,
  editApplicationProposal
};
