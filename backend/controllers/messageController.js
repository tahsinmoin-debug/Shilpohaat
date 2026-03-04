const Conversation = require('../models/Conversation');
const User = require('../models/User');

// 1. Send a message
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];

    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    // Find current user (sender)
    const sender = await User.findOne({ firebaseUID });
    if (!sender) return res.status(404).json({ message: 'Sender not found' });

    // Check if conversation already exists between these two participants
    let conversation = await Conversation.findOne({
      participants: { $all: [sender._id, recipientId] }
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({ 
        participants: [sender._id, recipientId], 
        messages: [] 
      });
    }

    // Create the message object
    const newMessage = { 
      sender: sender._id, 
      content, 
      isRead: false 
    };

    // Update conversation metadata
    conversation.messages.push(newMessage);
    conversation.lastMessage = content;
    conversation.lastMessageTime = Date.now();
    
    await conversation.save();

    // CRITICAL: Fetch the conversation again and populate the sender 
    // This prevents the frontend from crashing when it tries to read msg.sender.name
    const conversationData = await Conversation.findById(conversation._id)
      .populate({
        path: 'messages.sender',
        select: 'name email role'
      });
    
    const addedMessage = conversationData.messages[conversationData.messages.length - 1];

    return res.status(201).json({
      success: true,
      message: addedMessage,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const currentUser = await User.findOne({ firebaseUID });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate('participants', 'name email role firebaseUID')
      .populate({
        path: 'messages.sender',
        select: 'name email role',
      })
      .sort({ lastMessageTime: -1 });

    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== currentUser._id.toString()
      );

      const unreadCount = conv.messages.filter(
        (msg) =>
          msg.sender._id.toString() !== currentUser._id.toString() && !msg.isRead
      ).length;

      return {
        _id: conv._id,
        otherParticipant,
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount,
        createdAt: conv.createdAt,
      };
    });

    return res.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 3. Get messages in a specific conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];

    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const currentUser = await User.findOne({ firebaseUID });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email role')
      .populate('messages.sender', 'name email role');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === currentUser._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 4. Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];

    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const currentUser = await User.findOne({ firebaseUID });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.messages.forEach((msg) => {
      if (msg.sender.toString() !== currentUser._id.toString()) {
        msg.isRead = true;
      }
    });

    await conversation.save();

    return res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
};