const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController');

// GET /api/messages/conversations - Get all conversations for user
router.get('/conversations', getConversations);

// GET /api/messages/:conversationId - Get messages in a conversation
router.get('/:conversationId', getMessages);

// POST /api/messages/send - Send a message
router.post('/send', sendMessage);

// PATCH /api/messages/:conversationId/read - Mark messages as read
router.patch('/:conversationId/read', markAsRead);

module.exports = router;