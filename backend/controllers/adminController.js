const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const CreatorProfile = require('../models/CreatorProfile');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Deal = require('../models/Deal');
const BrandProfile = require('../models/BrandProfile');
const Application = require('../models/Application');
const AdminAuditLog = require('../models/AdminAuditLog');

const getPendingWithdrawals = async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: { $in: ['debit', 'coin_withdrawal'] }, status: 'pending' })
      .populate('userId', 'email name')
      .sort({ createdAt: -1 });

    const userIds = transactions.map(t => t.userId ? t.userId._id : null).filter(Boolean);
    const creatorProfiles = await CreatorProfile.find({ userId: { $in: userIds } });
    const brandProfiles = await BrandProfile.find({ userId: { $in: userIds } });

    const creatorMap = {};
    creatorProfiles.forEach(profile => {
      creatorMap[profile.userId.toString()] = profile;
    });

    const brandMap = {};
    brandProfiles.forEach(profile => {
      brandMap[profile.userId.toString()] = profile;
    });

    const withdrawals = transactions.map(t => {
      const uId = t.userId ? t.userId._id.toString() : null;
      const creatorProfile = uId ? creatorMap[uId] : null;
      const brandProfile = uId ? brandMap[uId] : null;

      let payoutDetails = creatorProfile?.payoutDetails || null;

      // Fallback: Parse payout details from description if profile payoutDetails is missing
      if (!payoutDetails || (!payoutDetails.upiId && !payoutDetails.bankAccountNumber)) {
        if (t.description?.includes('UPI: ')) {
          const upiMatch = t.description.match(/UPI:\s*([^\s]+)/i);
          if (upiMatch) {
            payoutDetails = { method: 'upi', upiId: upiMatch[1], isComplete: true };
          }
        } else if (t.description?.includes('Bank: ')) {
          const bankMatch = t.description.match(/Bank:\s*([^\s()]+)(?:\s*\(IFSC:\s*([^\s()]+)\))?/i);
          if (bankMatch) {
            payoutDetails = { method: 'bank', bankAccountNumber: bankMatch[1], ifscCode: bankMatch[2] || '', isComplete: true };
          }
        }
      }

      const userName = creatorProfile?.name || brandProfile?.businessName || brandProfile?.ownerName || t.userId?.name || 'Unknown User';

      const amount = Math.abs(t.amount);
      const platformFee = Math.round(amount * 0.05);
      const netPayout = amount - platformFee;

      return {
        _id: t._id,
        amount: amount,
        platformFee,
        netPayout,
        status: t.status,
        description: t.description,
        createdAt: t.createdAt,
        user: {
          id: uId,
          email: t.userId ? t.userId.email : 'Deleted User',
          name: userName,
          payoutDetails: payoutDetails
        }
      };
    });

    res.json(withdrawals);
  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    res.status(500).json({ message: error.message });
  }
};

const approveWithdrawal = async (req, res) => {
  const { id } = req.params;
  const { referenceId } = req.body || {};
  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Withdrawal request transaction not found.' });
    }
    if (!['debit', 'coin_withdrawal'].includes(transaction.type) || transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid or already processed withdrawal request.' });
    }

    transaction.status = 'completed';
    if (referenceId !== undefined) {
      transaction.referenceId = referenceId;
    }
    await transaction.save();

    // Audit log
    if (req.user?.id) {
      const adminUser = await User.findById(req.user.id);
      if (adminUser) {
        await AdminAuditLog.create({
          adminId: req.user.id,
          adminEmail: adminUser.email,
          adminRole: req.user.role,
          action: 'APPROVE_WITHDRAWAL',
          targetId: transaction.userId,
          details: `Approved withdrawal transaction ID ${transaction._id} of amount 🪙${Math.abs(transaction.amount)} for user ${transaction.userId}. Ref: ${referenceId || 'N/A'}`
        });
      }
    }

    res.json({ message: 'Withdrawal approved successfully.', transaction });
  } catch (error) {
    console.error('Error approving withdrawal:', error);
    res.status(500).json({ message: error.message });
  }
};

const rejectWithdrawal = async (req, res) => {
  const { id } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Withdrawal request transaction not found.' });
    }
    if (!['debit', 'coin_withdrawal'].includes(transaction.type) || transaction.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid or already processed withdrawal request.' });
    }

    // Find the wallet and refund the balance
    const wallet = await Wallet.findOne({ userId: transaction.userId }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Wallet not found for the creator.' });
    }

    const refundAmount = Math.abs(transaction.amount);
    wallet.balance += refundAmount;
    await wallet.save({ session });

    // Update transaction status to failed
    transaction.status = 'failed';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Audit log
    if (req.user?.id) {
      const adminUser = await User.findById(req.user.id);
      if (adminUser) {
        await AdminAuditLog.create({
          adminId: req.user.id,
          adminEmail: adminUser.email,
          adminRole: req.user.role,
          action: 'REJECT_WITHDRAWAL',
          targetId: transaction.userId,
          details: `Rejected withdrawal transaction ID ${transaction._id} of amount 🪙${Math.abs(transaction.amount)} for user ${transaction.userId}. Funds refunded.`
        });
      }
    }

    res.json({
      message: 'Withdrawal request rejected and funds refunded to creator.',
      transaction,
      newBalance: wallet.balance
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Error rejecting withdrawal:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCreators = await User.countDocuments({ role: 'creator' });
    const totalBrands = await User.countDocuments({ role: 'brand' });
    const totalCampaigns = await Campaign.countDocuments();
    const totalDeals = await Deal.countDocuments();

    // Calculate total platform transaction volume (completed credits)
    const completedCredits = await Transaction.aggregate([
      { $match: { type: 'credit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalVolume = completedCredits.length > 0 ? completedCredits[0].total : 0;

    // Pending withdrawals info
    const pendingWithdrawalsCount = await Transaction.countDocuments({ type: { $in: ['debit', 'coin_withdrawal'] }, status: 'pending' });
    const pendingWithdrawalsResult = await Transaction.aggregate([
      { $match: { type: { $in: ['debit', 'coin_withdrawal'] }, status: 'pending' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const pendingWithdrawalsAmount = pendingWithdrawalsResult.length > 0 ? Math.abs(pendingWithdrawalsResult[0].total) : 0;

    res.json({
      totalUsers,
      totalCreators,
      totalBrands,
      totalCampaigns,
      totalDeals,
      totalVolume,
      pendingWithdrawalsCount,
      pendingWithdrawalsAmount
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 }).lean();
    const userIds = users.map(u => u._id);

    const creators = await CreatorProfile.find({ userId: { $in: userIds } }).lean();
    const brands = await BrandProfile.find({ userId: { $in: userIds } }).lean();
    const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();

    const creatorMap = {};
    creators.forEach(c => { creatorMap[c.userId.toString()] = c; });

    const brandMap = {};
    brands.forEach(b => { brandMap[b.userId.toString()] = b; });

    const walletMap = {};
    wallets.forEach(w => { walletMap[w.userId.toString()] = w; });

    const userList = users.map(u => ({
      ...u,
      profile: u.role === 'creator' ? creatorMap[u._id.toString()] : brandMap[u._id.toString()],
      wallet: walletMap[u._id.toString()] || { balance: 0, fundsSecured: 0 }
    }));

    res.json(userList);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: error.message });
  }
};

const toggleUserSuspension = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend admin accounts.' });
    }
    user.isSuspended = !user.isSuspended;
    await user.save();

    // Audit log
    const adminUser = await User.findById(req.user.id);
    if (adminUser) {
      await AdminAuditLog.create({
        adminId: req.user.id,
        adminEmail: adminUser.email,
        adminRole: req.user.role,
        action: user.isSuspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
        targetId: user._id,
        details: `${user.isSuspended ? 'Suspended' : 'Unsuspended'} user account ${user.email} (${user.role})`
      });
    }

    res.json({ message: `User account is now ${user.isSuspended ? 'suspended' : 'active'}.`, user });
  } catch (error) {
    console.error('Error toggling suspension:', error);
    res.status(500).json({ message: error.message });
  }
};

const toggleUserVerification = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isVerified = !user.isVerified;
    await user.save();

    // Audit log
    const adminUser = await User.findById(req.user.id);
    if (adminUser) {
      await AdminAuditLog.create({
        adminId: req.user.id,
        adminEmail: adminUser.email,
        adminRole: req.user.role,
        action: user.isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER',
        targetId: user._id,
        details: `${user.isVerified ? 'Verified' : 'Unverified'} user account ${user.email}`
      });
    }

    res.json({ message: `User account is now ${user.isVerified ? 'verified' : 'unverified'}.`, user });
  } catch (error) {
    console.error('Error toggling verification:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).populate('brandId');
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching admin campaigns:', error);
    res.status(500).json({ message: error.message });
  }
};

const moderateCampaign = async (req, res) => {
  const { id } = req.params;
  const { status, moderationFeedback } = req.body;
  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    campaign.status = status;
    if (moderationFeedback !== undefined) {
      campaign.moderationFeedback = moderationFeedback;
    }
    await campaign.save();

    // Audit log
    const adminUser = await User.findById(req.user.id);
    if (adminUser) {
      await AdminAuditLog.create({
        adminId: req.user.id,
        adminEmail: adminUser.email,
        adminRole: req.user.role,
        action: 'MODERATE_CAMPAIGN',
        targetId: campaign._id,
        details: `Set campaign status of "${campaign.title}" to "${status}". Feedback: "${moderationFeedback || 'N/A'}"`
      });
    }

    res.json({ message: `Campaign status updated to ${status}.`, campaign });
  } catch (error) {
    console.error('Error moderating campaign:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminDeals = async (req, res) => {
  try {
    const deals = await Deal.find({})
      .sort({ updatedAt: -1 })
      .populate({
        path: 'applicationId',
        populate: [
          {
            path: 'campaignId',
            populate: { path: 'brandId' }
          },
          {
            path: 'creatorId'
          }
        ]
      })
      .populate('creatorId')
      .populate('brandId');
    res.json(deals);
  } catch (error) {
    console.error('Error fetching admin deals:', error);
    res.status(500).json({ message: error.message });
  }
};

const resolveDisputedDeal = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'release', 'refund', or 'split'

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deal = await Deal.findById(id).session(session);
    if (!deal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Deal not found' });
    }

    if (deal.status !== 'disputed') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Only disputed deals can be resolved by arbitrator.' });
    }

    // Identify Participants
    let creatorUserId, brandUserId;
    if (deal.originType === 'package') {
      const creator = await CreatorProfile.findById(deal.creatorId).session(session);
      const brand = await BrandProfile.findById(deal.brandId).session(session);
      if (!creator || !brand) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Creator or Brand profile not found for this package deal.' });
      }
      creatorUserId = creator.userId;
      brandUserId = brand.userId;
    } else {
      const app = await Application.findById(deal.applicationId).populate('creatorId').session(session);
      if (!app) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Application not found for this campaign deal.' });
      }
      const campaign = await Campaign.findById(app.campaignId).session(session);
      if (!campaign) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Campaign not found for this deal.' });
      }
      const brand = await BrandProfile.findById(campaign.brandId).session(session);
      if (!brand) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Brand profile not found for this campaign.' });
      }
      if (!app.creatorId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: 'Creator profile not found on application.' });
      }
      creatorUserId = app.creatorId.userId;
      brandUserId = brand.userId;
    }

    let creatorWallet = await Wallet.findOne({ userId: creatorUserId }).session(session);
    let brandWallet = await Wallet.findOne({ userId: brandUserId }).session(session);

    if (!creatorWallet) creatorWallet = new Wallet({ userId: creatorUserId });
    if (!brandWallet) brandWallet = new Wallet({ userId: brandUserId });

    if (action === 'release') {
      deal.status = 'completed';
      deal.paymentDetails.status = 'released';

      creatorWallet.fundsSecured = Math.max(0, creatorWallet.fundsSecured - deal.budget);
      brandWallet.fundsSecured = Math.max(0, brandWallet.fundsSecured - deal.budget);
      creatorWallet.balance += deal.budget;

      const releaseBrandTx = new Transaction({
        userId: brandUserId,
        amount: deal.budget,
        type: 'funds_secured_release',
        status: 'completed',
        description: `Funds-secured released to Creator (dispute resolved) for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await releaseBrandTx.save({ session });

      const releaseCreatorTx = new Transaction({
        userId: creatorUserId,
        amount: -deal.budget,
        type: 'funds_secured_release',
        status: 'completed',
        description: `Funds-secured release (dispute resolved) for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await releaseCreatorTx.save({ session });

      const creditCreatorTx = new Transaction({
        userId: creatorUserId,
        amount: deal.budget,
        type: 'credit',
        status: 'completed',
        description: `Payment received (dispute resolved) for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await creditCreatorTx.save({ session });

    } else if (action === 'refund') {
      deal.status = 'completed';
      deal.paymentDetails.status = 'refunded';

      creatorWallet.fundsSecured = Math.max(0, creatorWallet.fundsSecured - deal.budget);
      brandWallet.fundsSecured = Math.max(0, brandWallet.fundsSecured - deal.budget);
      brandWallet.balance += deal.budget;

      const refundBrandTx = new Transaction({
        userId: brandUserId,
        amount: deal.budget,
        type: 'credit',
        status: 'completed',
        description: `Funds-secured refunded (dispute resolved) for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await refundBrandTx.save({ session });

      const releaseBrandTx = new Transaction({
        userId: brandUserId,
        amount: deal.budget,
        type: 'funds_secured_release',
        status: 'completed',
        description: `Funds-secured release (refund processed) for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await releaseBrandTx.save({ session });

      const releaseCreatorTx = new Transaction({
        userId: creatorUserId,
        amount: -deal.budget,
        type: 'funds_secured_release',
        status: 'completed',
        description: `Funds-secured release (refund processed) for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await releaseCreatorTx.save({ session });
    } else if (action === 'split') {
      const { creatorAmount, brandAmount } = req.body;
      if (typeof creatorAmount !== 'number' || typeof brandAmount !== 'number') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid split amounts specified.' });
      }
      if (Math.abs(creatorAmount + brandAmount - deal.budget) > 0.01) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Split amounts (🪙${creatorAmount} and 🪙${brandAmount}) must sum up to the total deal budget (🪙${deal.budget}).` });
      }

      deal.status = 'completed';
      deal.paymentDetails.status = 'released';

      creatorWallet.fundsSecured = Math.max(0, creatorWallet.fundsSecured - deal.budget);
      brandWallet.fundsSecured = Math.max(0, brandWallet.fundsSecured - deal.budget);
      creatorWallet.balance += creatorAmount;
      brandWallet.balance += brandAmount;

      const releaseBrandTx = new Transaction({
        userId: brandUserId,
        amount: deal.budget,
        type: 'funds_secured_release',
        status: 'completed',
        description: `Funds-secured split release for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await releaseBrandTx.save({ session });

      const releaseCreatorTx = new Transaction({
        userId: creatorUserId,
        amount: -deal.budget,
        type: 'funds_secured_release',
        status: 'completed',
        description: `Funds-secured split release for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await releaseCreatorTx.save({ session });

      if (creatorAmount > 0) {
        const creditCreatorTx = new Transaction({
          userId: creatorUserId,
          amount: creatorAmount,
          type: 'credit',
          status: 'completed',
          description: `Split payment received (dispute resolved) for Deal #${deal._id}`,
          relatedDealId: deal._id
        });
        await creditCreatorTx.save({ session });
      }

      if (brandAmount > 0) {
        const creditBrandTx = new Transaction({
          userId: brandUserId,
          amount: brandAmount,
          type: 'credit',
          status: 'completed',
          description: `Split refund received (dispute resolved) for Deal #${deal._id}`,
          relatedDealId: deal._id
        });
        await creditBrandTx.save({ session });
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid resolution action.' });
    }

    await creatorWallet.save({ session });
    await brandWallet.save({ session });
    await deal.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Audit log
    const adminUser = await User.findById(req.user.id);
    if (adminUser) {
      await AdminAuditLog.create({
        adminId: req.user.id,
        adminEmail: adminUser.email,
        adminRole: req.user.role,
        action: 'RESOLVE_DISPUTE',
        targetId: deal._id,
        details: `Resolved disputed deal ID ${deal._id} with action: "${action}". Budget: 🪙${deal.budget}`
      });
    }

    res.json({ message: `Dispute resolved with action: ${action}. Wallets updated.`, deal });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Resolve Dispute Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('userId', 'email role')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminAuditLogs = async (req, res) => {
  try {
    const logs = await AdminAuditLog.find({})
      .sort({ createdAt: -1 })
      .populate('adminId', 'email role');
    res.json(logs);
  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAdminSocialMonitor = async (req, res) => {
  try {
    const creators = await CreatorProfile.find({})
      .populate('userId', 'email')
      .select('name userId instagramProfile socialLinks followerCount')
      .lean();
    res.json(creators);
  } catch (error) {
    console.error('Error fetching admin social monitoring:', error);
    res.status(500).json({ message: error.message });
  }
};

const getClearanceQueue = async (req, res) => {
  try {
    const deals = await Deal.find({ status: { $in: ['disputed', 'pending_clearance'] } })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'applicationId',
        populate: [
          {
            path: 'campaignId',
            populate: { path: 'brandId' }
          },
          {
            path: 'creatorId'
          }
        ]
      })
      .populate('creatorId')
      .populate('brandId');
    res.json(deals);
  } catch (error) {
    console.error('Error fetching clearance queue:', error);
    res.status(500).json({ message: error.message });
  }
};

const markPayoutPaid = async (req, res) => {
  const { id } = req.params;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deal = await Deal.findById(id).session(session);
    if (!deal) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    if (deal.status !== 'pending_clearance' && deal.status !== 'disputed') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Deal is not in pending clearance or disputed state.' });
    }

    // Get Platform Fee Configuration
    const PlatformConfig = require('../models/PlatformConfig');
    let config = await PlatformConfig.findOne().session(session);
    let feePercentage = config ? config.platformFeePercentage : 10; // default 10%

    // Calculate payouts
    const platformFeeAmount = (deal.budget * feePercentage) / 100;
    const finalPayoutAmount = deal.budget - platformFeeAmount;

    deal.platformFeePercentage = feePercentage;
    deal.platformFeeAmount = platformFeeAmount;
    deal.status = 'completed';
    deal.paymentDetails.status = 'released';
    await deal.save({ session });

    // Identify Creator User ID
    let creatorUserId;
    if (deal.originType === 'package') {
      const creator = await CreatorProfile.findById(deal.creatorId).session(session);
      creatorUserId = creator.userId;
    } else {
      const app = await Application.findById(deal.applicationId).populate('creatorId').session(session);
      creatorUserId = app.creatorId.userId;
    }

    // Update Creator Wallet: deduct from pendingClearance
    let creatorWallet = await Wallet.findOne({ userId: creatorUserId }).session(session);
    if (creatorWallet) {
      creatorWallet.pendingClearance = Math.max(0, (creatorWallet.pendingClearance || 0) - deal.budget);
      creatorWallet.balance += finalPayoutAmount; // Add to available balance
      await creatorWallet.save({ session });

      // Transactions
      const payoutTx = new Transaction({
        userId: creatorUserId,
        amount: deal.budget, // Credit the full deal budget (gross)
        type: 'credit', // Use 'credit' type for wallet additions
        status: 'completed',
        description: `Funds cleared to Wallet for Deal #${deal._id}`,
        relatedDealId: deal._id
      });
      await payoutTx.save({ session });
      
      if (platformFeeAmount > 0) {
        const feeTx = new Transaction({
          userId: creatorUserId,
          amount: -platformFeeAmount,
          type: 'platform_fee_deducted',
          status: 'completed',
          description: `Platform fee deduction (${feePercentage}%) for Deal #${deal._id}`,
          relatedDealId: deal._id
        });
        await feeTx.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Audit log
    const adminUser = await User.findById(req.user.id);
    if (adminUser) {
      await AdminAuditLog.create({
        adminId: req.user.id,
        adminEmail: adminUser.email,
        adminRole: req.user.role,
        action: 'MARK_PAYOUT_PAID',
        targetId: deal._id,
        details: `Marked payout as paid for Deal ${deal._id}. Payout: 🪙${finalPayoutAmount}, Fee: 🪙${platformFeeAmount}`
      });
    }

    res.json({ message: 'Payout marked as paid successfully.', deal });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Mark Payout Paid Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPendingDeposits = async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: 'coin_purchase', status: 'pending' })
      .populate('userId', 'email name')
      .sort({ createdAt: -1 });

    const userIds = transactions.map(t => t.userId ? t.userId._id : null).filter(Boolean);
    const brandProfiles = await BrandProfile.find({ userId: { $in: userIds } });

    const brandMap = {};
    brandProfiles.forEach(profile => {
      brandMap[profile.userId.toString()] = profile;
    });

    const deposits = transactions.map(t => {
      const uId = t.userId ? t.userId._id.toString() : null;
      const brandProfile = uId ? brandMap[uId] : null;
      const userName = brandProfile?.businessName || brandProfile?.ownerName || t.userId?.name || 'Unknown User';

      return {
        _id: t._id,
        amount: t.amount,
        status: t.status,
        description: t.description,
        referenceId: t.referenceId,
        createdAt: t.createdAt,
        user: {
          id: uId,
          email: t.userId ? t.userId.email : 'Deleted User',
          name: userName,
        }
      };
    });

    res.json(deposits);
  } catch (error) {
    console.error('Error fetching pending deposits:', error);
    res.status(500).json({ message: error.message });
  }
};

const approveDeposit = async (req, res) => {
  const { id } = req.params;
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findById(id).session(session);
    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Deposit request transaction not found.' });
    }
    if (transaction.type !== 'coin_purchase' || transaction.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid or already processed deposit request.' });
    }

    let wallet = await Wallet.findOne({ userId: transaction.userId }).session(session);
    if (!wallet) {
      wallet = new Wallet({ userId: transaction.userId, balance: 0 });
    }

    // Add funds to wallet
    wallet.balance += transaction.amount;
    await wallet.save({ session });

    // Mark as completed
    transaction.status = 'completed';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Audit log
    if (req.user?.id) {
      const adminUser = await User.findById(req.user.id);
      if (adminUser) {
        await AdminAuditLog.create({
          adminId: req.user.id,
          adminEmail: adminUser.email,
          adminRole: req.user.role,
          action: 'APPROVE_DEPOSIT',
          targetId: transaction.userId,
          details: `Approved deposit transaction ID ${transaction._id} of amount 🪙${transaction.amount} for user ${transaction.userId}.`
        });
      }
    }

    res.json({ message: 'Deposit approved successfully.', transaction, newBalance: wallet.balance });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Error approving deposit:', error);
    res.status(500).json({ message: error.message });
  }
};

const rejectDeposit = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Deposit request transaction not found.' });
    }
    if (transaction.type !== 'coin_purchase' || transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid or already processed deposit request.' });
    }

    transaction.status = 'failed';
    transaction.description += ' (Rejected by Admin)';
    await transaction.save();

    // Audit log
    if (req.user?.id) {
      const adminUser = await User.findById(req.user.id);
      if (adminUser) {
        await AdminAuditLog.create({
          adminId: req.user.id,
          adminEmail: adminUser.email,
          adminRole: req.user.role,
          action: 'REJECT_DEPOSIT',
          targetId: transaction.userId,
          details: `Rejected deposit transaction ID ${transaction._id} of amount 🪙${transaction.amount} for user ${transaction.userId}.`
        });
      }
    }

    res.json({ message: 'Deposit request rejected.', transaction });
  } catch (error) {
    console.error('Error rejecting deposit:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getAdminStats,
  getAdminUsers,
  toggleUserSuspension,
  toggleUserVerification,
  getAdminCampaigns,
  moderateCampaign,
  getAdminDeals,
  resolveDisputedDeal,
  getAdminTransactions,
  getAdminAuditLogs,
  getAdminSocialMonitor,
  getClearanceQueue,
  markPayoutPaid,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit
};


