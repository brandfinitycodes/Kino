const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Deal = require('../models/Deal');
const CreatorProfile = require('../models/CreatorProfile');
const BrandProfile = require('../models/BrandProfile');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// Helper to resolve brand User ObjectId
const getBrandUserId = async (deal) => {
  if (deal?.brandId) {
    const brand = await BrandProfile.findById(deal.brandId);
    if (brand?.userId) return brand.userId;
  }
  if (deal?.applicationId) {
    const app = await Application.findById(deal.applicationId).populate({
      path: 'campaignId',
      populate: { path: 'brandId' }
    });
    if (app?.campaignId?.brandId?.userId) return app.campaignId.brandId.userId;
  }
  return null;
};

// Helper to resolve creator User ObjectId
const getCreatorUserId = async (deal) => {
  if (deal?.creatorId) {
    const creator = await CreatorProfile.findById(deal.creatorId);
    if (creator?.userId) return creator.userId;
  }
  if (deal?.applicationId) {
    const app = await Application.findById(deal.applicationId).populate('creatorId');
    if (app?.creatorId?.userId) return app.creatorId.userId;
  }
  return null;
};

// Fetch messages for a specific deal
const getMessagesByDeal = async (req, res) => {
  const { dealId } = req.params;
  try {
    const conversation = await Conversation.findOne({ dealId });
    if (!conversation) return res.json([]); // No chat yet

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name role email profilePicture')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  const { dealId } = req.params;
  const { content } = req.body;
  const senderId = req.user?.id || req.user?._id;

  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    // Check if deal is completed (read-only)
    if (deal.status === 'completed') {
      return res.status(403).json({ message: 'Chat is read-only for completed deals.' });
    }

    const adminRoles = ['superadmin', 'admin', 'moderator', 'support'];
    const isAdmin = req.user && adminRoles.includes(req.user.role);

    // If an admin sends a message, verify that the deal is disputed (or superadmin)
    if (isAdmin && deal.status !== 'disputed' && !deal.disputeReason && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Admin can only participate in chats for disputed deals.' });
    }

    let conversation = await Conversation.findOne({ dealId });
    
    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = new Conversation({
        dealId,
        participants: [deal.brandId, deal.creatorId].filter(Boolean),
        participantModel: 'User'
      });
      await conversation.save();
    }

    // Add admin to participants if mediating
    if (isAdmin && !conversation.participants.some(p => String(p) === String(senderId))) {
      conversation.participants.push(senderId);
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      content
    });

    await newMessage.save();
    await newMessage.populate('senderId', 'name role email profilePicture');

    // Emit via socket
    const io = req.app.get('socketio');
    if (io) {
      io.to(dealId).emit('receive_message', newMessage);
    }

    // If admin is sending a message in a disputed deal, notify both parties
    if (isAdmin) {
      try {
        const [brandUserId, creatorUserId] = await Promise.all([
          getBrandUserId(deal),
          getCreatorUserId(deal)
        ]);

        const adminName = req.user?.name || 'Platform Arbitrator';
        const notifText = `🛡️ ${adminName} posted a message in the dispute resolution chat for Deal #${String(deal._id).slice(-6)}.`;

        if (brandUserId && String(brandUserId) !== String(senderId)) {
          await Notification.create({ userId: brandUserId, message: notifText });
        }
        if (creatorUserId && String(creatorUserId) !== String(senderId)) {
          await Notification.create({ userId: creatorUserId, message: notifText });
        }
      } catch (notifErr) {
        console.error('Admin dispute chat notification error:', notifErr.message);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessagesByDeal, sendMessage };
