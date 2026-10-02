const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Deal = require('../models/Deal');

// Fetch messages for a specific deal
const getMessagesByDeal = async (req, res) => {
  const { dealId } = req.params;
  try {
    const conversation = await Conversation.findOne({ dealId });
    if (!conversation) return res.json([]); // No chat yet

    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  const { dealId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  try {
    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    // Check if deal is completed (read-only)
    if (deal.status === 'completed') {
      return res.status(403).json({ message: 'Chat is read-only for completed deals.' });
    }

    let conversation = await Conversation.findOne({ dealId });
    
    // If conversation doesn't exist, create it (though verifyPayment should have done it)
    if (!conversation) {
      conversation = new Conversation({
        dealId,
        participants: [deal.brandId, deal.creatorId],
        participantModel: 'User'
      });
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      content
    });

    await newMessage.save();

    // Emit via socket
    const io = req.app.get('socketio');
    io.to(dealId).emit('receive_message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessagesByDeal, sendMessage };
