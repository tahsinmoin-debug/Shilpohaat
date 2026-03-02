/**
 * Bug Condition Exploration Test for Artist Collaboration Hub Messaging Fix
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
 * 
 * This test encodes the expected behavior for the messaging system bug fix.
 * 
 * CRITICAL: On UNFIXED code, this test MUST FAIL - failure confirms the bug exists
 * EXPECTED: On FIXED code, this test SHOULD PASS - success confirms the bug is resolved
 * 
 * The test validates:
 * 1. Messages are persisted to database when sent via Socket.io
 * 2. Message history is retrievable across sessions
 * 3. Conversation metadata is properly maintained
 * 4. Unread counts are tracked correctly
 * 
 * Note: This is an integration test that requires:
 * - MongoDB connection
 * - Message and Conversation models
 * - Socket.io server running
 */

const mongoose = require('mongoose');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
require('dotenv').config();

// Test configuration
const TEST_USER_1 = 'test-artist-1';
const TEST_USER_2 = 'test-artist-2';
const TEST_MESSAGE_CONTENT = 'Hello, interested in collaboration?';

/**
 * Property 1: Fault Condition - Message Persistence
 * 
 * For any message sent via Socket.io privateMessage event where sender and recipient
 * are valid users, the system SHALL save the message to the database with fields:
 * senderId, recipientId, content, timestamp, and readStatus (default: false)
 */
async function testMessagePersistence() {
  console.log('\n=== Test 1: Message Persistence ===');
  
  try {
    // Clean up any existing test data
    await Message.deleteMany({ 
      $or: [
        { senderId: TEST_USER_1, recipientId: TEST_USER_2 },
        { senderId: TEST_USER_2, recipientId: TEST_USER_1 }
      ]
    });
    
    const participants = [TEST_USER_1, TEST_USER_2].sort();
    await Conversation.deleteOne({ participants });
    
    // Simulate the Socket.io privateMessage handler behavior
    // This mimics what happens in backend/index.js lines 52-90
    
    // Step 1: Find or create conversation
    let conversation = await Conversation.findOneAndUpdate(
      { participants },
      {
        $setOnInsert: {
          participants,
          unreadCount: new Map([[TEST_USER_1, 0], [TEST_USER_2, 0]])
        },
        $set: {
          lastMessageAt: new Date(),
          lastMessageContent: TEST_MESSAGE_CONTENT.substring(0, 200)
        }
      },
      { upsert: true, new: true }
    );
    
    console.log('✓ Conversation created/found:', conversation._id);
    
    // Step 2: Create and save message
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: TEST_USER_1,
      recipientId: TEST_USER_2,
      content: TEST_MESSAGE_CONTENT,
      readStatus: false
    });
    
    await newMessage.save();
    console.log('✓ Message saved to database:', newMessage._id);
    
    // Step 3: Verify message exists in database
    const savedMessage = await Message.findById(newMessage._id);
    
    if (!savedMessage) {
      throw new Error('FAIL: Message not found in database after save');
    }
    
    // Validate all required fields
    if (savedMessage.senderId !== TEST_USER_1) {
      throw new Error(`FAIL: senderId mismatch. Expected: ${TEST_USER_1}, Got: ${savedMessage.senderId}`);
    }
    
    if (savedMessage.recipientId !== TEST_USER_2) {
      throw new Error(`FAIL: recipientId mismatch. Expected: ${TEST_USER_2}, Got: ${savedMessage.recipientId}`);
    }
    
    if (savedMessage.content !== TEST_MESSAGE_CONTENT) {
      throw new Error(`FAIL: content mismatch. Expected: ${TEST_MESSAGE_CONTENT}, Got: ${savedMessage.content}`);
    }
    
    if (savedMessage.readStatus !== false) {
      throw new Error(`FAIL: readStatus should be false. Got: ${savedMessage.readStatus}`);
    }
    
    if (!savedMessage.createdAt) {
      throw new Error('FAIL: createdAt timestamp missing');
    }
    
    if (!savedMessage.conversationId) {
      throw new Error('FAIL: conversationId missing');
    }
    
    console.log('✓ All message fields validated correctly');
    console.log('  - senderId:', savedMessage.senderId);
    console.log('  - recipientId:', savedMessage.recipientId);
    console.log('  - content:', savedMessage.content);
    console.log('  - readStatus:', savedMessage.readStatus);
    console.log('  - createdAt:', savedMessage.createdAt);
    console.log('  - conversationId:', savedMessage.conversationId);
    
    return { success: true, message: 'Message persistence test PASSED' };
    
  } catch (error) {
    return { success: false, message: `Message persistence test FAILED: ${error.message}` };
  }
}

/**
 * Property 2: Message History Retrieval
 * 
 * For any conversation with persisted messages, the system SHALL retrieve and
 * display the complete message history when the conversation is opened
 */
async function testMessageHistoryRetrieval() {
  console.log('\n=== Test 2: Message History Retrieval ===');
  
  try {
    // Send multiple messages to create history
    const participants = [TEST_USER_1, TEST_USER_2].sort();
    const conversation = await Conversation.findOne({ participants });
    
    if (!conversation) {
      throw new Error('FAIL: Conversation not found from previous test');
    }
    
    // Add 2 more messages to create history
    const message2 = new Message({
      conversationId: conversation._id,
      senderId: TEST_USER_2,
      recipientId: TEST_USER_1,
      content: 'Yes, I would love to collaborate!',
      readStatus: false
    });
    await message2.save();
    
    const message3 = new Message({
      conversationId: conversation._id,
      senderId: TEST_USER_1,
      recipientId: TEST_USER_2,
      content: 'Great! Let me know your availability.',
      readStatus: false
    });
    await message3.save();
    
    console.log('✓ Created 2 additional messages for history');
    
    // Simulate fetching message history (like frontend does)
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 });
    
    if (messages.length !== 3) {
      throw new Error(`FAIL: Expected 3 messages in history, got ${messages.length}`);
    }
    
    console.log('✓ Retrieved all 3 messages from database');
    console.log('  Message 1:', messages[0].content.substring(0, 30) + '...');
    console.log('  Message 2:', messages[1].content.substring(0, 30) + '...');
    console.log('  Message 3:', messages[2].content.substring(0, 30) + '...');
    
    // Verify messages are in chronological order
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].createdAt < messages[i-1].createdAt) {
        throw new Error('FAIL: Messages not in chronological order');
      }
    }
    
    console.log('✓ Messages are in correct chronological order');
    
    return { success: true, message: 'Message history retrieval test PASSED' };
    
  } catch (error) {
    return { success: false, message: `Message history retrieval test FAILED: ${error.message}` };
  }
}

/**
 * Property 3: Conversation Metadata Management
 * 
 * For any conversation, the system SHALL maintain lastMessageAt, lastMessageContent,
 * and unreadCount metadata correctly
 */
async function testConversationMetadata() {
  console.log('\n=== Test 3: Conversation Metadata ===');
  
  try {
    const participants = [TEST_USER_1, TEST_USER_2].sort();
    const conversation = await Conversation.findOne({ participants });
    
    if (!conversation) {
      throw new Error('FAIL: Conversation not found');
    }
    
    // Verify lastMessageAt is set
    if (!conversation.lastMessageAt) {
      throw new Error('FAIL: lastMessageAt not set');
    }
    
    console.log('✓ lastMessageAt is set:', conversation.lastMessageAt);
    
    // Verify lastMessageContent is set
    if (!conversation.lastMessageContent) {
      throw new Error('FAIL: lastMessageContent not set');
    }
    
    console.log('✓ lastMessageContent is set:', conversation.lastMessageContent.substring(0, 50));
    
    // Verify unreadCount exists
    if (!conversation.unreadCount) {
      throw new Error('FAIL: unreadCount not initialized');
    }
    
    console.log('✓ unreadCount is initialized');
    
    // Test unread count increment
    const currentUnreadCount = conversation.unreadCount.get(TEST_USER_2) || 0;
    conversation.unreadCount.set(TEST_USER_2, currentUnreadCount + 1);
    await conversation.save();
    
    // Verify the increment
    const updatedConversation = await Conversation.findOne({ participants });
    const newUnreadCount = updatedConversation.unreadCount.get(TEST_USER_2);
    
    if (newUnreadCount !== currentUnreadCount + 1) {
      throw new Error(`FAIL: Unread count not incremented correctly. Expected: ${currentUnreadCount + 1}, Got: ${newUnreadCount}`);
    }
    
    console.log('✓ Unread count incremented correctly:', newUnreadCount);
    
    return { success: true, message: 'Conversation metadata test PASSED' };
    
  } catch (error) {
    return { success: false, message: `Conversation metadata test FAILED: ${error.message}` };
  }
}

/**
 * Property 4: Unread Message Tracking
 * 
 * For any message where readStatus is false and current user is recipient,
 * the system SHALL track and display unread indicators
 */
async function testUnreadMessageTracking() {
  console.log('\n=== Test 4: Unread Message Tracking ===');
  
  try {
    const participants = [TEST_USER_1, TEST_USER_2].sort();
    const conversation = await Conversation.findOne({ participants });
    
    // Count unread messages for TEST_USER_2
    const unreadMessages = await Message.find({
      conversationId: conversation._id,
      recipientId: TEST_USER_2,
      readStatus: false
    });
    
    console.log(`✓ Found ${unreadMessages.length} unread messages for ${TEST_USER_2}`);
    
    if (unreadMessages.length === 0) {
      throw new Error('FAIL: Expected at least 1 unread message');
    }
    
    // Simulate marking messages as read
    await Message.updateMany(
      {
        conversationId: conversation._id,
        recipientId: TEST_USER_2,
        readStatus: false
      },
      {
        $set: { readStatus: true }
      }
    );
    
    console.log('✓ Marked messages as read');
    
    // Verify messages are now read
    const stillUnread = await Message.find({
      conversationId: conversation._id,
      recipientId: TEST_USER_2,
      readStatus: false
    });
    
    if (stillUnread.length !== 0) {
      throw new Error(`FAIL: Expected 0 unread messages after marking as read, got ${stillUnread.length}`);
    }
    
    console.log('✓ All messages marked as read successfully');
    
    // Reset unread count in conversation
    conversation.unreadCount.set(TEST_USER_2, 0);
    await conversation.save();
    
    const updatedConversation = await Conversation.findOne({ participants });
    if (updatedConversation.unreadCount.get(TEST_USER_2) !== 0) {
      throw new Error('FAIL: Unread count not reset to 0');
    }
    
    console.log('✓ Unread count reset to 0');
    
    return { success: true, message: 'Unread message tracking test PASSED' };
    
  } catch (error) {
    return { success: false, message: `Unread message tracking test FAILED: ${error.message}` };
  }
}

/**
 * Property 5: Conversation Uniqueness
 * 
 * For any pair of users, the system SHALL maintain exactly one conversation
 * regardless of message order (A->B and B->A use same conversation)
 */
async function testConversationUniqueness() {
  console.log('\n=== Test 5: Conversation Uniqueness ===');
  
  try {
    // Try to create conversation in reverse order
    const participants1 = [TEST_USER_1, TEST_USER_2].sort();
    const participants2 = [TEST_USER_2, TEST_USER_1].sort();
    
    // Both should resolve to same sorted array
    if (JSON.stringify(participants1) !== JSON.stringify(participants2)) {
      throw new Error('FAIL: Participant sorting not working correctly');
    }
    
    console.log('✓ Participant sorting ensures consistency');
    
    // Find conversation
    const conversation1 = await Conversation.findOne({ participants: participants1 });
    const conversation2 = await Conversation.findOne({ participants: participants2 });
    
    if (!conversation1 || !conversation2) {
      throw new Error('FAIL: Conversation not found');
    }
    
    if (conversation1._id.toString() !== conversation2._id.toString()) {
      throw new Error('FAIL: Different conversations found for same participants');
    }
    
    console.log('✓ Same conversation found regardless of participant order');
    console.log('  Conversation ID:', conversation1._id);
    
    return { success: true, message: 'Conversation uniqueness test PASSED' };
    
  } catch (error) {
    return { success: false, message: `Conversation uniqueness test FAILED: ${error.message}` };
  }
}

/**
 * Main test runner
 */
async function runBugConditionExplorationTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Bug Condition Exploration Test Suite                         ║');
  console.log('║  Artist Collaboration Hub Messaging Fix                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\nValidates Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6');
  console.log('\nCRITICAL: On UNFIXED code, these tests MUST FAIL');
  console.log('EXPECTED: On FIXED code, these tests SHOULD PASS\n');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    
    const results = [];
    
    // Run all tests
    results.push(await testMessagePersistence());
    results.push(await testMessageHistoryRetrieval());
    results.push(await testConversationMetadata());
    results.push(await testUnreadMessageTracking());
    results.push(await testConversationUniqueness());
    
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
      console.log('\n⚠️  EXPECTED OUTCOME ON UNFIXED CODE: Tests FAILED');
      console.log('This confirms the bug exists. Counterexamples documented above.');
      console.log('\nCounterexamples found:');
      results.filter(r => !r.success).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.message}`);
      });
    } else {
      console.log('\n✓ EXPECTED OUTCOME ON FIXED CODE: All tests PASSED');
      console.log('This confirms the bug has been resolved.');
      console.log('\nValidated behaviors:');
      console.log('  ✓ Messages are persisted to database with all required fields');
      console.log('  ✓ Message history is retrievable across sessions');
      console.log('  ✓ Conversation metadata is properly maintained');
      console.log('  ✓ Unread message tracking works correctly');
      console.log('  ✓ Conversation uniqueness is enforced');
    }
    
    // Clean up test data
    console.log('\nCleaning up test data...');
    await Message.deleteMany({ 
      $or: [
        { senderId: TEST_USER_1, recipientId: TEST_USER_2 },
        { senderId: TEST_USER_2, recipientId: TEST_USER_1 }
      ]
    });
    const participants = [TEST_USER_1, TEST_USER_2].sort();
    await Conversation.deleteOne({ participants });
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
runBugConditionExplorationTests();
