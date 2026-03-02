const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: {
    type: [String], // Array of 2 Firebase UIDs
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2;
      },
      message: 'Conversation must have exactly 2 participants'
    }
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastMessageContent: {
    type: String,
    maxlength: 200
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, { 
  timestamps: true 
});

// Ensure unique conversation per pair (sorted to avoid duplicates)
ConversationSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
