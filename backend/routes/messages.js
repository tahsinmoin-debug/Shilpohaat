const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Get conversation partners (users with existing message history)
router.get('/partners', messageController.getConversationPartners);

// Get all conversations for current user
router.get('/conversations', messageController.getConversations);

// Get or create conversation with specific user (returns conversation object only)
router.post('/conversation/:userId', messageController.getOrCreateConversation);

// Get messages with a specific user (returns messages array)
router.get('/conversation/:userId', messageController.getMessagesByUserId);

// Get all messages in a conversation
router.get('/:conversationId', messageController.getMessages);

// Mark messages as read
router.post('/:conversationId/mark-read', messageController.markMessagesAsRead);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
