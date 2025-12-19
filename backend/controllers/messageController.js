const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    // Find current user
    const currentUser = await User.findOne({ firebaseUID });
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
      .populate('participants', 'name email role firebaseUID')
      .populate({
        path: 'messages.sender',
        select: 'name email role',
      })
      .sort({ lastMessageTime: -1 });

    // Format response with other participant info
    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== currentUser._id.toString()
      );

      // Count unread messages
      const unreadCount = conv.messages.filter(
        (msg) =>
          msg.sender.toString() !== currentUser._id.toString() && !msg.isRead
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

// Get messages in a specific conversation
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

    // Check if user is participant
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

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];

    if (!firebaseUID || !recipientId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find sender
    const sender = await User.findOne({ firebaseUID });
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // Find recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [sender._id, recipient._id] },
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [sender._id, recipient._id],
        messages: [],
      });
    }

    // Add message
    const newMessage = {
      sender: sender._id,
      content: content.trim(),
      isRead: false,
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = content.trim();
    conversation.lastMessageTime = new Date();

    await conversation.save();

    // Populate the conversation for response
    await conversation.populate('participants', 'name email role');
    await conversation.populate('messages.sender', 'name email role');

    // Get the newly added message with populated data
    const addedMessage =
      conversation.messages[conversation.messages.length - 1];

    return res.status(201).json({
      success: true,
      message: addedMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Mark messages as read
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

    // Mark all messages from other user as read
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
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
};