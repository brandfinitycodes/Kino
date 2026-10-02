const mongoose = require('mongoose');
const Deal = require('../models/Deal');
const Application = require('../models/Application');
const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');
const Campaign = require('../models/Campaign');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Helper to resolve brand User ObjectId for notifications
const getBrandUserId = async (brandIdOrUser, deal) => {
  let targetId = brandIdOrUser || deal?.brandId;
  if (!targetId && deal?.applicationId) {
    const app = await Application.findById(deal.applicationId).populate('campaignId');
    targetId = app?.campaignId?.brandId;
  }
  if (!targetId) return null;
  const brandProfile = await BrandProfile.findById(targetId);
  if (brandProfile && brandProfile.userId) {
    return brandProfile.userId;
  }
  return targetId;
};

// Helper to resolve creator User ObjectId for notifications
const getCreatorUserId = async (creatorIdOrUser, deal) => {
  let targetId = creatorIdOrUser || deal?.creatorId;
  if (!targetId && deal?.applicationId) {
    const app = await Application.findById(deal.applicationId);
    targetId = app?.creatorId;
  }
  if (!targetId) return null;
  const creatorProfile = await CreatorProfile.findById(targetId);
  if (creatorProfile && creatorProfile.userId) {
    return creatorProfile.userId;
  }
  return targetId;
};

// Helper to resolve deal title for notifications
const getDealTitle = async (deal) => {
  if (deal.title) return deal.title;
  if (deal.originType === 'package' || (!deal.campaignId && !deal.applicationId)) {
    const tier = deal.packageTier ? deal.packageTier.charAt(0).toUpperCase() + deal.packageTier.slice(1) : 'Custom';
    return `${tier} Tier Package Order`;
  }
  if (deal.applicationId) {
    const app = await Application.findById(deal.applicationId).populate('campaignId');
    if (app?.campaignId?.title) return app.campaignId.title;
  }
  return 'Campaign Deal';
};

const createDeal = async (req, res) => {
  const { applicationId } = req.body;
  try {
    const application = await Application.findById(applicationId).populate('campaignId creatorId');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.status !== 'confirmed_by_creator' && application.status !== 'accepted') {
      return res.status(400).json({ message: 'Creator must confirm or brand must accept the application before creating a deal.' });
    }

    const existingDeal = await Deal.findOne({ applicationId });
    if (existingDeal) return res.status(200).json(existingDeal);

    const deal = new Deal({ 
      applicationId,
      brandId: application.campaignId?.brandId,
      creatorId: application.creatorId?._id || application.creatorId,
      budget: application.campaignId?.budget || 0,
      status: 'pending_payment',
      paymentDetails: { status: 'pending' }
    });
    await deal.save();

    // Mark campaign as inactive if applicable
    if (application.campaignId && application.campaignId._id) {
      await Campaign.findByIdAndUpdate(application.campaignId._id, { status: 'inactive' });
    }

    // In-app Notification to Brand
    try {
      const brandProf = await BrandProfile.findById(application.campaignId?.brandId);
      if (brandProf?.userId) {
        const title = application.campaignId?.title || 'Campaign Deal';
        await Notification.create({
          userId: brandProf.userId,
          message: `Application accepted for "${title}". Payment is required to start work.`
        });
      }
    } catch (notifErr) {
      console.error('Notification Error (non-critical):', notifErr.message);
    }

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPackageCheckout = async (req, res) => {
  try {
    const { creatorId, packageTier } = req.body;
    
    if (req.user.role !== 'brand') {
      return res.status(403).json({ message: 'Only brands can purchase packages.' });
    }

    const brandProfile = await BrandProfile.findOne({ userId: req.user.id });
    if (!brandProfile) return res.status(404).json({ message: 'Brand profile not found.' });

    const creator = await CreatorProfile.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    let pkg = creator.pricing && creator.pricing[packageTier] ? creator.pricing[packageTier] : null;
    if (!pkg || !pkg.price || pkg.price <= 0) {
      pkg = {
        price: packageTier === 'premium' ? 10000 : (packageTier === 'standard' ? 5000 : 2500),
        description: `Mock ${packageTier} package deliverables for testing.`,
        deliveryDays: 5,
        revisions: 2
      };
    }

    const existingDeal = await Deal.findOne({
      originType: 'package',
      brandId: brandProfile._id,
      creatorId: creator._id,
      packageTier,
      status: { $nin: ['completed', 'disputed'] }
    });

    if (existingDeal) {
      return res.status(409).json({ message: 'You already have an active order for this package.' });
    }

    const deal = new Deal({
      originType: 'package',
      applicationId: new mongoose.Types.ObjectId(),
      brandId: brandProfile._id,
      creatorId: creator._id,
      packageTier,
      packageSnapshot: pkg,
      budget: pkg.price,
      status: 'pending_payment',
      paymentDetails: { status: 'pending' }
    });

    await deal.save();

    // In-app Notification to Creator
    try {
      const tierName = packageTier ? packageTier.charAt(0).toUpperCase() + packageTier.slice(1) : 'Custom';
      await Notification.create({
        userId: creator.userId,
        message: `New ${tierName} Tier Package Order created! Awaiting brand payment.`
      });
    } catch (notifErr) {
      console.error('Notification Error (non-critical):', notifErr.message);
    }

    res.status(201).json(deal);
  } catch (error) {
    console.error("Package Checkout Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const fundDeal = async (req, res) => {
  const { id } = req.params;
  const { brandAssetsUrl } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const deal = await Deal.findById(id).session(session);
    if (!deal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (brandAssetsUrl) {
      deal.brandAssetsUrl = brandAssetsUrl;
    }
    
    // 2. Identify Participants
    let creatorUserId, brandUserId;
    if (deal.brandId) {
      const brand = await BrandProfile.findById(deal.brandId).session(session);
      brandUserId = brand?.userId;
    }
    if (deal.creatorId) {
      const creator = await CreatorProfile.findById(deal.creatorId).session(session);
      creatorUserId = creator?.userId;
    }
    if ((!creatorUserId || !brandUserId) && deal.applicationId) {
      const app = await Application.findById(deal.applicationId).populate('creatorId campaignId').session(session);
      if (app) {
        if (!creatorUserId && app.creatorId) {
          const creator = await CreatorProfile.findById(app.creatorId._id || app.creatorId).session(session);
          creatorUserId = creator?.userId;
        }
        if (!brandUserId && app.campaignId) {
          const campaign = await Campaign.findById(app.campaignId._id || app.campaignId).session(session);
          if (campaign?.brandId) {
            const brand = await BrandProfile.findById(campaign.brandId).session(session);
            brandUserId = brand?.userId;
          }
        }
      }
    }

    if (!brandUserId) brandUserId = req.user.id;

    // 2.5 Wallet Check and Deduct for Brand
    let brandWallet = await Wallet.findOne({ userId: brandUserId }).session(session);
    if (!brandWallet) {
      brandWallet = new Wallet({ userId: brandUserId });
    }

    // 2.5 Calculate 5% Platform Charge for Brand
    const platformFeeRate = 0.05; // 5% platform fee
    const platformFee = Math.round(deal.budget * platformFeeRate);
    const totalDeduction = deal.budget + platformFee;

    if (brandWallet.balance < totalDeduction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: `Insufficient Coins. Required: 🪙${totalDeduction.toLocaleString()} (🪙${deal.budget.toLocaleString()} deal budget + 🪙${platformFee.toLocaleString()} 5% platform charge).` 
      });
    }

    // Deduct totalDeduction from balance, add deal.budget to fundsSecured
    brandWallet.balance -= totalDeduction;
    brandWallet.fundsSecured += deal.budget;
    await brandWallet.save({ session });

    // 3. Update Deal Status
    deal.status = 'in_progress';
    deal.paymentDetails.status = 'funds_secured_held';
    await deal.save({ session });

    // 4. Wallet Update for Creator
    if (creatorUserId) {
      let creatorWallet = await Wallet.findOne({ userId: creatorUserId }).session(session);
      if (!creatorWallet) creatorWallet = new Wallet({ userId: creatorUserId });
      creatorWallet.fundsSecured += deal.budget;
      await creatorWallet.save({ session });

      const creatorTx = new Transaction({
        userId: creatorUserId,
        amount: deal.budget,
        type: 'funds_secured_hold',
        status: 'completed',
        description: `Funds-secured hold for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await creatorTx.save({ session });
    }

    // 5. Create Brand Transaction Records (Budget Hold + 5% Fee)
    const brandTx = new Transaction({
      userId: brandUserId,
      amount: -deal.budget,
      type: 'funds_secured_hold',
      status: 'completed',
      description: `Funds-secured hold for Deal #${deal._id}`,
      relatedDealId: deal._id
    });
    await brandTx.save({ session });

    if (platformFee > 0) {
      const feeTx = new Transaction({
        userId: brandUserId,
        amount: -platformFee,
        type: 'platform_fee_deducted',
        status: 'completed',
        description: `5% Platform charge for funding Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await feeTx.save({ session });
    }

    // 6. Trigger Chat Creation
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');

    const existingConversation = await Conversation.findOne({ dealId: deal._id }).session(session);
    if (!existingConversation && creatorUserId && brandUserId) {
      const conversation = new Conversation({
        dealId: deal._id,
        participants: [brandUserId, creatorUserId],
        participantModel: 'User'
      });
      await conversation.save({ session });

      const welcome = new Message({
        conversationId: conversation._id,
        senderId: brandUserId,
        content: "Payment secured. Chat is now active for this collaboration."
      });
      await welcome.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // 7. Send Notifications (after transaction commit)
    try {
      const dealTitle = await getDealTitle(deal);
      if (creatorUserId) {
        await Notification.create({
          userId: creatorUserId,
          message: `Payment of 🪙${deal.budget.toLocaleString()} secured for deal "${dealTitle}". You can now begin work!`
        });
      }
      if (brandUserId) {
        await Notification.create({
          userId: brandUserId,
          message: `Payment of 🪙${deal.budget.toLocaleString()} locked in escrow for deal "${dealTitle}". Deal is now in progress.`
        });
      }
    } catch (notifErr) {
      console.error("Notification Error (non-critical):", notifErr.message);
    }

    res.json({ message: 'Payment simulated. Wallet updated.', deal });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Payment Simulation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const submitContent = async (req, res) => {
  const { id } = req.params;
  const { contentUrl } = req.body;
  try {
    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.status !== 'in_progress' && deal.status !== 'revision_requested') {
      return res.status(400).json({ message: 'Cannot submit content at this stage.' });
    }

    deal.contentUrl = contentUrl;
    deal.status = 'in_review';
    deal.submittedAt = new Date();
    await deal.save();

    // Send Notification to Brand
    try {
      const brandUserId = await getBrandUserId(deal.brandId, deal);
      if (brandUserId) {
        const dealTitle = await getDealTitle(deal);
        await Notification.create({
          userId: brandUserId,
          message: `Deliverables submitted for deal "${dealTitle}". Click to review submission.`
        });
      }
    } catch (notifErr) {
      console.error("Notification Error (non-critical):", notifErr.message);
    }

    res.json({ message: 'Content submitted for review.', deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reviewContent = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deal = await Deal.findById(id).session(session);
    if (!deal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    if (deal.status !== 'in_review') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Deal is not waiting for review.' });
    }

    let creatorUserId, brandUserId;
    if (deal.brandId) {
      const brand = await BrandProfile.findById(deal.brandId).session(session);
      brandUserId = brand?.userId;
    }
    if (deal.creatorId) {
      const creator = await CreatorProfile.findById(deal.creatorId).session(session);
      creatorUserId = creator?.userId;
    }
    if ((!creatorUserId || !brandUserId) && deal.applicationId) {
      const app = await Application.findById(deal.applicationId).populate('creatorId campaignId').session(session);
      if (app) {
        if (!creatorUserId && app.creatorId) {
          const creator = await CreatorProfile.findById(app.creatorId._id || app.creatorId).session(session);
          creatorUserId = creator?.userId;
        }
        if (!brandUserId && app.campaignId) {
          const campaign = await Campaign.findById(app.campaignId._id || app.campaignId).session(session);
          if (campaign?.brandId) {
            const brand = await BrandProfile.findById(campaign.brandId).session(session);
            brandUserId = brand?.userId;
          }
        }
      }
    }

    if (action === 'approve') {
      deal.status = 'completed';
      deal.paymentDetails.status = 'released';

      const PlatformConfig = require('../models/PlatformConfig');
      let config = await PlatformConfig.findOne().session(session);
      let feePercentage = config ? (config.platformFeePercentage || 0) : 0;
      const platformFeeAmount = (deal.budget * feePercentage) / 100;
      const finalPayoutAmount = deal.budget - platformFeeAmount;

      deal.platformFeePercentage = feePercentage;
      deal.platformFeeAmount = platformFeeAmount;

      if (creatorUserId) {
        let creatorWallet = await Wallet.findOne({ userId: creatorUserId }).session(session);
        if (!creatorWallet) creatorWallet = new Wallet({ userId: creatorUserId });

        creatorWallet.fundsSecured = Math.max(0, (creatorWallet.fundsSecured || 0) - deal.budget);
        creatorWallet.balance = (creatorWallet.balance || 0) + finalPayoutAmount;
        creatorWallet.totalEarned = (creatorWallet.totalEarned || 0) + finalPayoutAmount;
        await creatorWallet.save({ session });

        const payoutTx = new Transaction({
          userId: creatorUserId,
          amount: finalPayoutAmount,
          type: 'credit',
          status: 'completed',
          description: `Payout released upon brand approval for Deal #${deal._id}`,
          relatedDealId: deal._id
        });
        await payoutTx.save({ session });
      }

      if (brandUserId) {
        let brandWallet = await Wallet.findOne({ userId: brandUserId }).session(session);
        if (brandWallet) {
          brandWallet.fundsSecured = Math.max(0, (brandWallet.fundsSecured || 0) - deal.budget);
          await brandWallet.save({ session });

          const releaseTx = new Transaction({
            userId: brandUserId,
            amount: deal.budget,
            type: 'funds_secured_release',
            status: 'completed',
            description: `Funds-secured released to Creator for Deal #${deal._id}`,
            relatedDealId: deal._id
          });
          await releaseTx.save({ session });
        }
      }
    } else if (action === 'reject') {
      deal.status = 'revision_requested';
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid action.' });
    }

    await deal.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Send Notifications (after transaction commit)
    try {
      const dealTitle = await getDealTitle(deal);
      const cUserId = creatorUserId || (await getCreatorUserId(deal.creatorId, deal));
      const bUserId = brandUserId || (await getBrandUserId(deal.brandId, deal));

      if (action === 'approve') {
        if (cUserId) {
          await Notification.create({
            userId: cUserId,
            message: `Congratulations! Deliverables for deal "${dealTitle}" were approved and 🪙${deal.budget.toLocaleString()} Coins have been credited to your wallet!`
          });
        }
        if (bUserId) {
          await Notification.create({
            userId: bUserId,
            message: `You approved deliverables for deal "${dealTitle}". 🪙${deal.budget.toLocaleString()} released to creator.`
          });
        }
      } else if (action === 'reject') {
        if (creatorUserId) {
          await Notification.create({
            userId: creatorUserId,
            message: `Revisions requested for deal "${dealTitle}". Please check requirements and re-submit.`
          });
        }
      }
    } catch (notifErr) {
      console.error("Notification Error (non-critical):", notifErr.message);
    }

    res.json({ message: `Content ${action}ed successfully.`, deal });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Review Content Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUserDeals = async (req, res) => {
  try {
    let queryConditions = [];

    if (req.user.role === 'creator') {
      const creatorProfile = await CreatorProfile.findOne({ userId: req.user.id });
      const possibleCreatorIds = [req.user.id];
      if (creatorProfile) {
        possibleCreatorIds.push(creatorProfile._id);
      }
      queryConditions.push({ creatorId: { $in: possibleCreatorIds } });
      const applications = await Application.find({ creatorId: { $in: possibleCreatorIds } });
      const applicationIds = applications.map(a => a._id);
      if (applicationIds.length > 0) {
        queryConditions.push({ applicationId: { $in: applicationIds } });
      }
    } else {
      const brandProfiles = await BrandProfile.find({ userId: req.user.id });
      const brandProfileIds = brandProfiles.map(b => b._id);
      const possibleBrandIds = [...brandProfileIds, req.user.id];

      queryConditions.push({ brandId: { $in: possibleBrandIds } });

      const campaigns = await Campaign.find({ brandId: { $in: possibleBrandIds } });
      const campaignIds = campaigns.map(c => c._id);
      const applications = await Application.find({ campaignId: { $in: campaignIds } });
      const applicationIds = applications.map(a => a._id);
      if (applicationIds.length > 0) {
        queryConditions.push({ applicationId: { $in: applicationIds } });
      }
    }

    if (queryConditions.length === 0) return res.json([]);

    const deals = await Deal.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .populate({
        path: 'applicationId',
        populate: [
          { path: 'campaignId' },
          { path: 'creatorId', populate: { path: 'userId', select: 'name email profilePicture' } }
        ]
      })
      .populate({
        path: 'creatorId',
        populate: { path: 'userId', select: 'name email profilePicture' }
      })
      .populate({
        path: 'brandId',
        populate: { path: 'userId', select: 'name email profilePicture' }
      });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDealStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    deal.status = status;
    await deal.save();

    try {
      let creatorUserId, brandUserId;
      if (deal.originType === 'package') {
        const creator = await CreatorProfile.findById(deal.creatorId);
        const brand = await BrandProfile.findById(deal.brandId);
        creatorUserId = creator?.userId;
        brandUserId = brand?.userId;
      } else if (deal.applicationId) {
        const app = await Application.findById(deal.applicationId).populate('creatorId campaignId');
        if (app) {
          const creator = await CreatorProfile.findById(app.creatorId?._id || app.creatorId);
          const brand = await BrandProfile.findById(app.campaignId?.brandId);
          creatorUserId = creator?.userId;
          brandUserId = brand?.userId;
        }
      }
      const dealTitle = await getDealTitle(deal);
      const readableStatus = status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      if (creatorUserId) {
        await Notification.create({
          userId: creatorUserId,
          message: `Deal status for "${dealTitle}" updated to ${readableStatus}.`
        });
      }
      if (brandUserId) {
        await Notification.create({
          userId: brandUserId,
          message: `Deal status for "${dealTitle}" updated to ${readableStatus}.`
        });
      }
    } catch (notifErr) {
      console.error("Notification Error (non-critical):", notifErr.message);
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitDeliverables = async (req, res) => {
  const { id } = req.params;
  const { link } = req.body;
  try {
    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    deal.contentUrl = link;
    await deal.save();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fileDispute = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    if (deal.status === 'completed' || deal.status === 'disputed') {
      return res.status(400).json({ message: 'Deal cannot be disputed at this stage.' });
    }
    deal.status = 'disputed';
    deal.disputeReason = reason;
    deal.disputedAt = new Date();
    await deal.save();

    try {
      let creatorUserId, brandUserId;
      if (deal.originType === 'package') {
        const creator = await CreatorProfile.findById(deal.creatorId);
        const brand = await BrandProfile.findById(deal.brandId);
        creatorUserId = creator?.userId;
        brandUserId = brand?.userId;
      } else if (deal.applicationId) {
        const app = await Application.findById(deal.applicationId).populate('creatorId campaignId');
        if (app) {
          const creator = await CreatorProfile.findById(app.creatorId?._id || app.creatorId);
          const brand = await BrandProfile.findById(app.campaignId?.brandId);
          creatorUserId = creator?.userId;
          brandUserId = brand?.userId;
        }
      }

      const dealTitle = await getDealTitle(deal);
      const recipientId = req.user.id.toString() === creatorUserId?.toString() ? brandUserId : creatorUserId;
      if (recipientId) {
        await Notification.create({
          userId: recipientId,
          message: `A dispute has been filed for deal "${dealTitle}". Reason: ${reason}`
        });
      }
    } catch (notifErr) {
      console.error("Notification Error (non-critical):", notifErr.message);
    }

    res.json({ message: 'Dispute filed successfully.', deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDeal, createPackageCheckout, getUserDeals, fundDeal, submitContent, reviewContent, updateDealStatus, submitDeliverables, fileDispute };
