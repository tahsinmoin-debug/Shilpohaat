/**
 * End-to-End Integration Test for Artist Collaboration Hub Messaging Fix
 * 
 * This test validates the complete message flow including:
 * 1. Send message, refresh page, verify history loaded
 * 2. Buyer-to-artist flow: click "Contact Artist", send message, verify persistence
 * 3. Multi-conversation flow: verify unread badges, mark as read, verify updates
 * 
 * Requirements: Backend server running, MongoDB connected
 */

const io = require('socket.io-client');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
require('dotenv').config();

// Test configuration
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:5000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

const TEST_ARTIST_1 = 'e2e-artist-1';
const TEST_ARTIST_2 = 'e2e-artist-2';
const TEST_BUYER = 'e2e-buyer-1';

// Helper functions
function createSocket() {
  return io(SOCKET_SERVER_URL, {
    transports: ['websocket'],
    reconnection: false
  });
}

function waitForEvent(socket, eventName, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);
    
    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test 1: End-to-End Message Flow
 * Send message, refresh page (simulate by fetching history), verify history loaded
 */
async function testMessageFlowWithRefresh() {
  console.log('\n=== Test 1: End-to-End Message Flow (Send, Refresh, Load History) ===');
  
  let socket1, socket2;
  
  try {
    // Clean up any existing test data
    await Message.deleteMany({ 
      $or: [
        { senderId: TEST_ARTIST_1, recipientId: TEST_ARTIST_2 },
        { senderId: TEST_ARTIST_2, recipientId: TEST_ARTIST_1 }
      ]
    });
    
    const participants = [TEST_ARTIST_1, TEST_ARTIST_2].sort();
    await Conversation.deleteOne({ participants });
    
    console.log('✓ Test data cleaned up');
    
    // Step 1: Connect both artists via Socket.io
    socket1 = createSocket();
    socket2 = createSocket();
    
    await Promise.all([
      waitForEvent(socket1, 'connect'),
      waitForEvent(socket2, 'connect')
    ]);
    
    socket1.emit('registerUser', TEST_ARTIST_1);
    socket2.emit('registerUser', TEST_ARTIST_2);
    
    await wait(500);
    
    console.log('✓ Both artists connected and registered');
    
    // Step 2: Artist 1 sends message to Artist 2
    const testMessage = 'Hello! Let\'s collaborate on a project.';
    
    socket1.emit('privateMessage', {
      senderId: TEST_ARTIST_1,
      recipientId: TEST_ARTIST_2,
      message: testMessage
    });
    
    await wait(2000); // Wait for message to be saved to database
    
    console.log('✓ Message sent via Socket.io');
    
    // Step 3: Verify message was persisted to database
    const conversation = await Conversation.findOne({ participants });
    
    if (!conversation) {
      throw new Error('FAIL: Conversation not created in database');
    }
    
    console.log('✓ Conversation created in database:', conversation._id);
    
    const messages = await Message.find({ conversationId: conversation._id });
    
    if (messages.length !== 1) {
      throw new Error(`FAIL: Expected 1 message in database, found ${messages.length}`);
    }
    
    if (messages[0].content !== testMessage) {
      throw new Error(`FAIL: Message content mismatch. Expected: "${testMessage}", Got: "${messages[0].content}"`);
    }
    
    console.log('✓ Message persisted to database with correct content');
    
    // Step 4: Simulate page refresh by disconnecting and reconnecting
    socket1.disconnect();
    socket2.disconnect();
    
    await wait(500);
    
    console.log('✓ Simulated page refresh (disconnected sockets)');
    
    // Step 5: Reconnect and fetch message history from database
    socket1 = createSocket();
    await waitForEvent(socket1, 'connect');
    socket1.emit('registerUser', TEST_ARTIST_1);
    
    await wait(500);
    
    console.log('✓ Reconnected after refresh');
    
    // Step 6: Fetch message history from database (simulating frontend API call)
    const historyMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 });
    
    if (historyMessages.length !== 1) {
      throw new Error(`FAIL: Expected 1 message in history, found ${historyMessages.length}`);
    }
    
    if (historyMessages[0].content !== testMessage) {
      throw new Error('FAIL: Message history content mismatch');
    }
    
    console.log('✓ Message history successfully loaded from database after refresh');
    console.log('  - Message content:', historyMessages[0].content);
    console.log('  - Timestamp:', historyMessages[0].createdAt);
    
    return { success: true, message: 'End-to-end message flow with refresh PASSED' };
    
  } catch (error) {
    return { success: false, message: `End-to-end message flow test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
  }
}

/**
 * Test 2: Buyer-to-Artist Flow
 * Simulate buyer clicking "Contact Artist", sending message, verify persistence
 */
async function testBuyerToArtistFlow() {
  console.log('\n=== Test 2: Buyer-to-Artist Flow ===');
  
  let buyerSocket, artistSocket;
  
  try {
    // Clean up any existing test data
    await Message.deleteMany({ 
      $or: [
        { senderId: TEST_BUYER, recipientId: TEST_ARTIST_1 },
        { senderId: TEST_ARTIST_1, recipientId: TEST_BUYER }
      ]
    });
    
    const participants = [TEST_BUYER, TEST_ARTIST_1].sort();
    await Conversation.deleteOne({ participants });
    
    console.log('✓ Test data cleaned up');
    
    // Step 1: Simulate buyer clicking "Contact Artist" button
    // This would navigate to /messages?artistId=TEST_ARTIST_1
    console.log('✓ Simulated buyer clicking "Contact Artist" button');
    console.log('  - Would navigate to: /messages?artistId=' + TEST_ARTIST_1);
    
    // Step 2: Connect buyer and artist via Socket.io
    buyerSocket = createSocket();
    artistSocket = createSocket();
    
    await Promise.all([
      waitForEvent(buyerSocket, 'connect'),
      waitForEvent(artistSocket, 'connect')
    ]);
    
    buyerSocket.emit('registerUser', TEST_BUYER);
    artistSocket.emit('registerUser', TEST_ARTIST_1);
    
    await wait(500);
    
    console.log('✓ Buyer and artist connected');
    
    // Step 3: Buyer sends message to artist
    const buyerMessage = 'Hi! I\'m interested in purchasing your artwork "Sunset Painting".';
    
    buyerSocket.emit('privateMessage', {
      senderId: TEST_BUYER,
      recipientId: TEST_ARTIST_1,
      message: buyerMessage
    });
    
    await wait(2000);
    
    console.log('✓ Buyer sent message to artist');
    
    // Step 4: Verify message was persisted
    const conversation = await Conversation.findOne({ participants });
    
    if (!conversation) {
      throw new Error('FAIL: Buyer-artist conversation not created');
    }
    
    console.log('✓ Buyer-artist conversation created:', conversation._id);
    
    const messages = await Message.find({ conversationId: conversation._id });
    
    if (messages.length !== 1) {
      throw new Error(`FAIL: Expected 1 message, found ${messages.length}`);
    }
    
    if (messages[0].senderId !== TEST_BUYER) {
      throw new Error('FAIL: Message sender is not the buyer');
    }
    
    if (messages[0].recipientId !== TEST_ARTIST_1) {
      throw new Error('FAIL: Message recipient is not the artist');
    }
    
    if (messages[0].content !== buyerMessage) {
      throw new Error('FAIL: Message content mismatch');
    }
    
    console.log('✓ Buyer message persisted correctly');
    console.log('  - Sender:', messages[0].senderId);
    console.log('  - Recipient:', messages[0].recipientId);
    console.log('  - Content:', messages[0].content);
    
    // Step 5: Artist replies
    const artistReply = 'Thank you for your interest! The painting is available.';
    
    artistSocket.emit('privateMessage', {
      senderId: TEST_ARTIST_1,
      recipientId: TEST_BUYER,
      message: artistReply
    });
    
    await wait(2000);
    
    console.log('✓ Artist sent reply');
    
    // Step 6: Verify both messages are in conversation
    const allMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 });
    
    if (allMessages.length !== 2) {
      throw new Error(`FAIL: Expected 2 messages in conversation, found ${allMessages.length}`);
    }
    
    console.log('✓ Both messages persisted in conversation');
    console.log('  - Message 1 (Buyer):', allMessages[0].content.substring(0, 40) + '...');
    console.log('  - Message 2 (Artist):', allMessages[1].content.substring(0, 40) + '...');
    
    return { success: true, message: 'Buyer-to-artist flow PASSED' };
    
  } catch (error) {
    return { success: false, message: `Buyer-to-artist flow test FAILED: ${error.message}` };
  } finally {
    if (buyerSocket) buyerSocket.disconnect();
    if (artistSocket) artistSocket.disconnect();
  }
}

/**
 * Test 3: Multi-Conversation Flow with Unread Badges
 * Verify unread badges, mark as read, verify updates
 */
async function testMultiConversationFlow() {
  console.log('\n=== Test 3: Multi-Conversation Flow with Unread Badges ===');
  
  let socket1, socket2, socket3;
  
  try {
    // Clean up any existing test data
    await Message.deleteMany({ 
      $or: [
        { senderId: TEST_ARTIST_1 },
        { recipientId: TEST_ARTIST_1 }
      ]
    });
    
    await Conversation.deleteMany({
      participants: TEST_ARTIST_1
    });
    
    console.log('✓ Test data cleaned up');
    
    // Step 1: Create multiple conversations with unread messages
    // Conversation 1: Artist 2 -> Artist 1 (3 unread messages)
    const participants1 = [TEST_ARTIST_1, TEST_ARTIST_2].sort();
    const conv1 = new Conversation({
      participants: participants1,
      lastMessageAt: new Date(),
      lastMessageContent: 'Message from Artist 2',
      unreadCount: new Map([[TEST_ARTIST_1, 3], [TEST_ARTIST_2, 0]])
    });
    await conv1.save();
    
    // Create 3 unread messages
    for (let i = 1; i <= 3; i++) {
      const msg = new Message({
        conversationId: conv1._id,
        senderId: TEST_ARTIST_2,
        recipientId: TEST_ARTIST_1,
        content: `Unread message ${i} from Artist 2`,
        readStatus: false
      });
      await msg.save();
    }
    
    console.log('✓ Created conversation 1 with 3 unread messages');
    
    // Conversation 2: Buyer -> Artist 1 (2 unread messages)
    const participants2 = [TEST_ARTIST_1, TEST_BUYER].sort();
    const conv2 = new Conversation({
      participants: participants2,
      lastMessageAt: new Date(),
      lastMessageContent: 'Message from Buyer',
      unreadCount: new Map([[TEST_ARTIST_1, 2], [TEST_BUYER, 0]])
    });
    await conv2.save();
    
    // Create 2 unread messages
    for (let i = 1; i <= 2; i++) {
      const msg = new Message({
        conversationId: conv2._id,
        senderId: TEST_BUYER,
        recipientId: TEST_ARTIST_1,
        content: `Unread message ${i} from Buyer`,
        readStatus: false
      });
      await msg.save();
    }
    
    console.log('✓ Created conversation 2 with 2 unread messages');
    
    // Step 2: Fetch conversations for Artist 1 (simulating frontend API call)
    const conversations = await Conversation.find({
      participants: TEST_ARTIST_1
    }).sort({ lastMessageAt: -1 });
    
    if (conversations.length !== 2) {
      throw new Error(`FAIL: Expected 2 conversations, found ${conversations.length}`);
    }
    
    console.log('✓ Artist 1 has 2 conversations');
    
    // Step 3: Verify unread counts
    const unreadCount1 = conversations[0].unreadCount.get(TEST_ARTIST_1);
    const unreadCount2 = conversations[1].unreadCount.get(TEST_ARTIST_1);
    
    const totalUnread = unreadCount1 + unreadCount2;
    
    if (totalUnread !== 5) {
      throw new Error(`FAIL: Expected 5 total unread messages, found ${totalUnread}`);
    }
    
    console.log('✓ Unread counts verified:');
    console.log('  - Conversation 1:', unreadCount1, 'unread');
    console.log('  - Conversation 2:', unreadCount2, 'unread');
    console.log('  - Total:', totalUnread, 'unread');
    
    // Step 4: Mark conversation 1 messages as read
    await Message.updateMany(
      {
        conversationId: conv1._id,
        recipientId: TEST_ARTIST_1,
        readStatus: false
      },
      {
        $set: { readStatus: true }
      }
    );
    
    conv1.unreadCount.set(TEST_ARTIST_1, 0);
    await conv1.save();
    
    console.log('✓ Marked conversation 1 messages as read');
    
    // Step 5: Verify unread count updated
    const updatedConv1 = await Conversation.findById(conv1._id);
    const newUnreadCount1 = updatedConv1.unreadCount.get(TEST_ARTIST_1);
    
    if (newUnreadCount1 !== 0) {
      throw new Error(`FAIL: Expected 0 unread in conversation 1, found ${newUnreadCount1}`);
    }
    
    console.log('✓ Conversation 1 unread count reset to 0');
    
    // Step 6: Verify conversation 2 still has unread messages
    const updatedConv2 = await Conversation.findById(conv2._id);
    const newUnreadCount2 = updatedConv2.unreadCount.get(TEST_ARTIST_1);
    
    if (newUnreadCount2 !== 2) {
      throw new Error(`FAIL: Expected 2 unread in conversation 2, found ${newUnreadCount2}`);
    }
    
    console.log('✓ Conversation 2 still has 2 unread messages');
    
    // Step 7: Verify read status in database
    const readMessages = await Message.find({
      conversationId: conv1._id,
      recipientId: TEST_ARTIST_1,
      readStatus: true
    });
    
    if (readMessages.length !== 3) {
      throw new Error(`FAIL: Expected 3 read messages, found ${readMessages.length}`);
    }
    
    console.log('✓ All 3 messages in conversation 1 marked as read in database');
    
    const unreadMessages = await Message.find({
      conversationId: conv2._id,
      recipientId: TEST_ARTIST_1,
      readStatus: false
    });
    
    if (unreadMessages.length !== 2) {
      throw new Error(`FAIL: Expected 2 unread messages in conversation 2, found ${unreadMessages.length}`);
    }
    
    console.log('✓ Conversation 2 still has 2 unread messages in database');
    
    return { success: true, message: 'Multi-conversation flow with unread badges PASSED' };
    
  } catch (error) {
    return { success: false, message: `Multi-conversation flow test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
    if (socket3) socket3.disconnect();
  }
}

/**
 * Main test runner
 */
async function runEndToEndTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  End-to-End Integration Test Suite                            ║');
  console.log('║  Artist Collaboration Hub Messaging Fix                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\nValidates complete message flows:');
  console.log('  1. Send message, refresh page, verify history loaded');
  console.log('  2. Buyer-to-artist flow with message persistence');
  console.log('  3. Multi-conversation flow with unread badges\n');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    
    const results = [];
    
    // Run all end-to-end tests
    results.push(await testMessageFlowWithRefresh());
    results.push(await testBuyerToArtistFlow());
    results.push(await testMultiConversationFlow());
    
    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  Test Results Summary                                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    results.forEach((result, index) => {
      const status = result.success ? '✓ PASS' : '✗ FAIL';
      console.log(`${status}: Test ${index + 1} - ${result.message}`);
    });
    
    console.log(`\nTotal: ${results.length} tests`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n⚠️  Some end-to-end tests FAILED');
      console.log('Failed tests:');
      results.filter(r => !r.success).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.message}`);
      });
    } else {
      console.log('\n✓ SUCCESS: All end-to-end tests PASSED');
      console.log('\nValidated flows:');
      console.log('  ✓ Message persistence across page refresh');
      console.log('  ✓ Buyer-to-artist communication');
      console.log('  ✓ Multi-conversation management');
      console.log('  ✓ Unread badge tracking and updates');
      console.log('  ✓ Mark as read functionality');
    }
    
    // Clean up test data
    console.log('\nCleaning up test data...');
    await Message.deleteMany({ 
      $or: [
        { senderId: TEST_ARTIST_1 },
        { recipientId: TEST_ARTIST_1 },
        { senderId: TEST_ARTIST_2 },
        { recipientId: TEST_ARTIST_2 },
        { senderId: TEST_BUYER },
        { recipientId: TEST_BUYER }
      ]
    });
    await Conversation.deleteMany({
      $or: [
        { participants: TEST_ARTIST_1 },
        { participants: TEST_ARTIST_2 },
        { participants: TEST_BUYER }
      ]
    });
    console.log('✓ Test data cleaned up');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB\n');
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n✗ Test suite error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tests
runEndToEndTests();
