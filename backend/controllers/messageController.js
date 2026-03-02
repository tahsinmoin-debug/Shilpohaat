/**
 * Get all users who have had conversations with the current user
 * Returns only users with existing message history
 */
exports.getConversationPartners = async (req, res) => {
    try {
        const firebaseUID = req.headers['x-firebase-uid'];
        if (!firebaseUID) {
            return res.status(400).json({ message: 'Firebase UID is required' });
        }

        // Find all messages where user is sender or recipient
        const messages = await Message.find({
            $or: [
                { senderId: firebaseUID },
                { recipientId: firebaseUID }
            ]
        }).select('senderId recipientId').lean();

        // Extract unique partner IDs
        const partnerIds = new Set();
        messages.forEach(msg => {
            if (msg.senderId !== firebaseUID) {
                partnerIds.add(msg.senderId);
            }
            if (msg.recipientId !== firebaseUID) {
                partnerIds.add(msg.recipientId);
            }
        });

        // Get user details for all partners
        const partners = await User.find({
            firebaseUID: { $in: Array.from(partnerIds) }
        }).select('firebaseUID name email role').lean();

        const partnerList = partners.map(user => ({
            id: user.firebaseUID,
            name: user.name || user.email?.split('@')[0] || 'User',
            role: user.role || 'buyer'
        }));

        res.json(partnerList);
    } catch (error) {
        console.error('Get conversation partners error:', error);
        res.status(500).json({ message: 'Failed to retrieve conversation partners.' });
    }
};
const User = require('../models/User');

// Get all conversations for current user with unread counts
exports.getConversations = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: firebaseUID
    }).sort({ lastMessageAt: -1 });

    // Populate participant details
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participants.find(p => p !== firebaseUID);
        const otherUser = await User.findOne({ firebaseUID: otherUserId });
        
        return {
          _id: conv._id,
          participants: conv.participants,
          otherUser: otherUser ? {
            firebaseUID: otherUser.firebaseUID,
            name: otherUser.name,
            email: otherUser.email,
            role: otherUser.role
          } : null,
          lastMessageAt: conv.lastMessageAt,
          lastMessageContent: conv.lastMessageContent,
          unreadCount: conv.unreadCount.get(firebaseUID) || 0
        };
      })
    );

    res.json({ success: true, conversations: enrichedConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get or create conversation with specific user
exports.getOrCreateConversation = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    const { userId } = req.params; // Other user's Firebase UID
    
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    if (firebaseUID === userId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Sort participants to ensure consistent ordering
    const participants = [firebaseUID, userId].sort();

    // Find or create conversation
    let conversation = await Conversation.findOne({ participants });

    if (!conversation) {
      conversation = new Conversation({
        participants,
        unreadCount: new Map([[firebaseUID, 0], [userId, 0]])
      });
      await conversation.save();
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages in a conversation (paginated)
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    res.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    const { conversationId } = req.params;
    
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    // Update all unread messages where current user is recipient
    await Message.updateMany(
      {
        conversationId,
        recipientId: firebaseUID,
        readStatus: false
      },
      {
        $set: { readStatus: true }
      }
    );

    // Reset unread count in conversation
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCount.set(firebaseUID, 0);
      await conversation.save();
    }

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    const { messageId } = req.params;
    
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.senderId !== firebaseUID) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get messages with a specific user (by userId, not conversationId)
exports.getMessagesByUserId = async (req, res) => {
  try {
    const firebaseUID = req.query.firebaseUID || req.headers['x-firebase-uid'];
    const { userId } = req.params; // Other user's Firebase UID
    
    if (!firebaseUID) {
      return res.status(400).json({ message: 'firebaseUID is required' });
    }

    // Sort participants to ensure consistent ordering
    const participants = [firebaseUID, userId].sort();

    // Find conversation
    const conversation = await Conversation.findOne({ participants });

    if (!conversation) {
      // No conversation exists yet, return empty messages
      return res.json({ success: true, messages: [], conversation: null });
    }

    // Get all messages in this conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 });

    res.json({ success: true, messages, conversation });
  } catch (error) {
    console.error('Get messages by userId error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
