/**
 * Direct Socket.io Test - Verify message persistence
 */

const io = require('socket.io-client');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
require('dotenv').config();

const SOCKET_SERVER_URL = 'http://localhost:5000';
const TEST_SENDER = 'direct-test-sender';
const TEST_RECIPIENT = 'direct-test-recipient';

async function testDirectSocketIO() {
  console.log('=== Direct Socket.io Message Persistence Test ===\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Clean up
    await Message.deleteMany({ 
      $or: [
        { senderId: TEST_SENDER, recipientId: TEST_RECIPIENT },
        { senderId: TEST_RECIPIENT, recipientId: TEST_SENDER }
      ]
    });
    const participants = [TEST_SENDER, TEST_RECIPIENT].sort();
    await Conversation.deleteOne({ participants });
    console.log('✓ Cleaned up test data\n');
    
    // Create socket connections
    const socket1 = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnection: false
    });
    
    const socket2 = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnection: false
    });
    
    // Wait for connections
    await new Promise((resolve) => {
      let connected = 0;
      socket1.on('connect', () => {
        console.log('✓ Socket 1 connected');
        connected++;
        if (connected === 2) resolve();
      });
      socket2.on('connect', () => {
        console.log('✓ Socket 2 connected');
        connected++;
        if (connected === 2) resolve();
      });
    });
    
    // Register users
    socket1.emit('registerUser', TEST_SENDER);
    socket2.emit('registerUser', TEST_RECIPIENT);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✓ Users registered\n');
    
    // Send message
    console.log('Sending message via Socket.io...');
    socket1.emit('privateMessage', {
      senderId: TEST_SENDER,
      recipientId: TEST_RECIPIENT,
      message: 'Test message for direct persistence check'
    });
    
    // Wait for database save
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✓ Waited for database save\n');
    
    // Check database
    console.log('Checking database...');
    const conversation = await Conversation.findOne({ participants });
    
    if (!conversation) {
      console.log('✗ FAIL: Conversation not found in database');
      console.log('\nDebugging info:');
      console.log('- Participants:', participants);
      
      // Check if any conversations exist
      const allConvs = await Conversation.find({});
      console.log('- Total conversations in DB:', allConvs.length);
      
      if (allConvs.length > 0) {
        console.log('- Sample conversation:', JSON.stringify(allConvs[0], null, 2));
      }
    } else {
      console.log('✓ Conversation found:', conversation._id);
      
      const messages = await Message.find({ conversationId: conversation._id });
      console.log('✓ Messages found:', messages.length);
      
      if (messages.length > 0) {
        console.log('✓ Message content:', messages[0].content);
        console.log('✓ SUCCESS: Message persisted correctly!');
      } else {
        console.log('✗ FAIL: No messages found in conversation');
      }
    }
    
    // Cleanup
    socket1.disconnect();
    socket2.disconnect();
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

testDirectSocketIO();
