/**
 * Preservation Property Tests for Artist Collaboration Hub Messaging Fix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.6**
 * 
 * This test suite verifies that existing real-time messaging, online status tracking,
 * and UI behavior remain unchanged after implementing the bug fix.
 * 
 * CRITICAL: These tests MUST PASS on UNFIXED code - this establishes the baseline
 * EXPECTED: These tests MUST STILL PASS on FIXED code - this confirms no regressions
 * 
 * The tests validate:
 * 1. Real-time message delivery via Socket.io for online users
 * 2. Online/offline status tracking via registerUser event
 * 3. onlineUsers broadcast updates
 * 4. Message format and structure preservation
 * 5. Socket.io event handling behavior
 * 
 * Note: This is an integration test that requires:
 * - Socket.io server running on backend
 * - Socket.io client connections
 */

const io = require('socket.io-client');
require('dotenv').config();

// Test configuration
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:5000';
const TEST_USER_1 = 'preservation-test-user-1';
const TEST_USER_2 = 'preservation-test-user-2';
const TEST_USER_3 = 'preservation-test-user-3';
const TEST_MESSAGE = 'Test message for preservation';

// Helper to create socket connection
function createSocket() {
  return io(SOCKET_SERVER_URL, {
    transports: ['websocket'],
    reconnection: false
  });
}

// Helper to wait for event
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

// Helper to wait for specific time
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Property 1: Real-Time Message Delivery Preservation
 * 
 * For any message sent to an online user via Socket.io, the system SHALL
 * deliver the message instantly to the recipient's socket connection,
 * preserving the exact same real-time behavior as the original system.
 */
async function testRealTimeMessageDelivery() {
  console.log('\n=== Test 1: Real-Time Message Delivery ===');
  
  let socket1, socket2;
  
  try {
    // Create two socket connections
    socket1 = createSocket();
    socket2 = createSocket();
    
    // Wait for connections
    await Promise.all([
      waitForEvent(socket1, 'connect'),
      waitForEvent(socket2, 'connect')
    ]);
    
    console.log('✓ Both sockets connected');
    
    // Register both users
    socket1.emit('registerUser', TEST_USER_1);
    socket2.emit('registerUser', TEST_USER_2);
    
    await wait(500); // Give time for registration
    
    console.log('✓ Both users registered');
    
    // Set up message receiver
    const messagePromise = waitForEvent(socket2, 'receiveMessage');
    
    // Send message from user 1 to user 2
    socket1.emit('privateMessage', {
      senderId: TEST_USER_1,
      recipientId: TEST_USER_2,
      message: TEST_MESSAGE
    });
    
    console.log('✓ Message sent via Socket.io');
    
    // Wait for message to be received
    const receivedMessage = await messagePromise;
    
    // Validate message structure
    if (!receivedMessage) {
      throw new Error('FAIL: No message received');
    }
    
    if (receivedMessage.senderId !== TEST_USER_1) {
      throw new Error(`FAIL: senderId mismatch. Expected: ${TEST_USER_1}, Got: ${receivedMessage.senderId}`);
    }
    
    if (receivedMessage.message !== TEST_MESSAGE) {
      throw new Error(`FAIL: message content mismatch. Expected: ${TEST_MESSAGE}, Got: ${receivedMessage.message}`);
    }
    
    console.log('✓ Message received in real-time with correct structure');
    console.log('  - senderId:', receivedMessage.senderId);
    console.log('  - message:', receivedMessage.message);
    
    return { success: true, message: 'Real-time message delivery PRESERVED' };
    
  } catch (error) {
    return { success: false, message: `Real-time message delivery test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
  }
}

/**
 * Property 2: Online Status Tracking Preservation
 * 
 * For any user registration or disconnection, the system SHALL update the
 * activeUsers Map and broadcast the onlineUsers list, preserving the exact
 * same status tracking behavior as the original system.
 */
async function testOnlineStatusTracking() {
  console.log('\n=== Test 2: Online Status Tracking ===');
  
  let socket1, socket2, socket3;
  
  try {
    // Create socket connection for observer
    socket1 = createSocket();
    await waitForEvent(socket1, 'connect');
    socket1.emit('registerUser', TEST_USER_1);
    
    console.log('✓ Observer socket connected and registered');
    
    // Set up listener for onlineUsers broadcasts
    let onlineUsersUpdates = [];
    socket1.on('onlineUsers', (userIds) => {
      onlineUsersUpdates.push([...userIds]);
    });
    
    await wait(500); // Wait for initial broadcast
    
    // Connect second user
    socket2 = createSocket();
    await waitForEvent(socket2, 'connect');
    socket2.emit('registerUser', TEST_USER_2);
    
    await wait(500); // Wait for broadcast
    
    console.log('✓ Second user connected and registered');
    
    // Connect third user
    socket3 = createSocket();
    await waitForEvent(socket3, 'connect');
    socket3.emit('registerUser', TEST_USER_3);
    
    await wait(500); // Wait for broadcast
    
    console.log('✓ Third user connected and registered');
    
    // Verify we received onlineUsers broadcasts
    if (onlineUsersUpdates.length === 0) {
      throw new Error('FAIL: No onlineUsers broadcasts received');
    }
    
    console.log(`✓ Received ${onlineUsersUpdates.length} onlineUsers broadcasts`);
    
    // Get the latest online users list
    const latestOnlineUsers = onlineUsersUpdates[onlineUsersUpdates.length - 1];
    
    // Verify all three users are in the list
    if (!latestOnlineUsers.includes(TEST_USER_1)) {
      throw new Error(`FAIL: ${TEST_USER_1} not in online users list`);
    }
    
    if (!latestOnlineUsers.includes(TEST_USER_2)) {
      throw new Error(`FAIL: ${TEST_USER_2} not in online users list`);
    }
    
    if (!latestOnlineUsers.includes(TEST_USER_3)) {
      throw new Error(`FAIL: ${TEST_USER_3} not in online users list`);
    }
    
    console.log('✓ All registered users appear in onlineUsers list');
    console.log('  Online users:', latestOnlineUsers);
    
    // Test disconnection
    onlineUsersUpdates = []; // Reset
    socket3.disconnect();
    
    await wait(500); // Wait for disconnect broadcast
    
    if (onlineUsersUpdates.length === 0) {
      throw new Error('FAIL: No onlineUsers broadcast after disconnection');
    }
    
    const afterDisconnect = onlineUsersUpdates[onlineUsersUpdates.length - 1];
    
    if (afterDisconnect.includes(TEST_USER_3)) {
      throw new Error(`FAIL: ${TEST_USER_3} still in online users after disconnect`);
    }
    
    console.log('✓ Disconnected user removed from onlineUsers list');
    console.log('  Online users after disconnect:', afterDisconnect);
    
    return { success: true, message: 'Online status tracking PRESERVED' };
    
  } catch (error) {
    return { success: false, message: `Online status tracking test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
    if (socket3) socket3.disconnect();
  }
}

/**
 * Property 3: Message Sent Confirmation Preservation
 * 
 * For any message sent to an online recipient, the sender SHALL receive
 * a messageSent confirmation event, preserving the original feedback behavior.
 */
async function testMessageSentConfirmation() {
  console.log('\n=== Test 3: Message Sent Confirmation ===');
  
  let socket1, socket2;
  
  try {
    // Create two socket connections
    socket1 = createSocket();
    socket2 = createSocket();
    
    await Promise.all([
      waitForEvent(socket1, 'connect'),
      waitForEvent(socket2, 'connect')
    ]);
    
    // Register both users
    socket1.emit('registerUser', TEST_USER_1);
    socket2.emit('registerUser', TEST_USER_2);
    
    await wait(500);
    
    console.log('✓ Both users connected and registered');
    
    // Set up listener for messageSent event
    const messageSentPromise = waitForEvent(socket1, 'messageSent');
    
    // Send message
    socket1.emit('privateMessage', {
      senderId: TEST_USER_1,
      recipientId: TEST_USER_2,
      message: TEST_MESSAGE
    });
    
    // Wait for confirmation
    const confirmation = await messageSentPromise;
    
    if (!confirmation) {
      throw new Error('FAIL: No messageSent confirmation received');
    }
    
    if (confirmation.recipientId !== TEST_USER_2) {
      throw new Error(`FAIL: recipientId mismatch in confirmation. Expected: ${TEST_USER_2}, Got: ${confirmation.recipientId}`);
    }
    
    if (confirmation.message !== TEST_MESSAGE) {
      throw new Error(`FAIL: message mismatch in confirmation. Expected: ${TEST_MESSAGE}, Got: ${confirmation.message}`);
    }
    
    console.log('✓ messageSent confirmation received with correct data');
    console.log('  - recipientId:', confirmation.recipientId);
    console.log('  - message:', confirmation.message);
    
    return { success: true, message: 'Message sent confirmation PRESERVED' };
    
  } catch (error) {
    return { success: false, message: `Message sent confirmation test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
  }
}

/**
 * Property 4: Offline Recipient Handling Preservation
 * 
 * For any message sent to an offline recipient, the sender SHALL receive
 * a messageFailed event, preserving the original error handling behavior.
 */
async function testOfflineRecipientHandling() {
  console.log('\n=== Test 4: Offline Recipient Handling ===');
  
  let socket1;
  
  try {
    // Create only sender socket (recipient is offline)
    socket1 = createSocket();
    await waitForEvent(socket1, 'connect');
    socket1.emit('registerUser', TEST_USER_1);
    
    await wait(500);
    
    console.log('✓ Sender connected (recipient offline)');
    
    // Set up listener for messageFailed event
    const messageFailedPromise = waitForEvent(socket1, 'messageFailed');
    
    // Send message to offline user
    socket1.emit('privateMessage', {
      senderId: TEST_USER_1,
      recipientId: 'offline-user-id',
      message: TEST_MESSAGE
    });
    
    // Wait for failure notification
    const failureNotification = await messageFailedPromise;
    
    if (!failureNotification) {
      throw new Error('FAIL: No messageFailed event received for offline recipient');
    }
    
    if (!failureNotification.message) {
      throw new Error('FAIL: messageFailed event missing error message');
    }
    
    console.log('✓ messageFailed event received for offline recipient');
    console.log('  - error message:', failureNotification.message);
    
    return { success: true, message: 'Offline recipient handling PRESERVED' };
    
  } catch (error) {
    return { success: false, message: `Offline recipient handling test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
  }
}

/**
 * Property 5: Multiple Message Sequence Preservation
 * 
 * For any sequence of messages sent between online users, the system SHALL
 * deliver all messages in order with correct timestamps, preserving the
 * original message ordering behavior.
 */
async function testMultipleMessageSequence() {
  console.log('\n=== Test 5: Multiple Message Sequence ===');
  
  let socket1, socket2;
  
  try {
    // Create two socket connections
    socket1 = createSocket();
    socket2 = createSocket();
    
    await Promise.all([
      waitForEvent(socket1, 'connect'),
      waitForEvent(socket2, 'connect')
    ]);
    
    // Register both users
    socket1.emit('registerUser', TEST_USER_1);
    socket2.emit('registerUser', TEST_USER_2);
    
    await wait(500);
    
    console.log('✓ Both users connected and registered');
    
    // Set up message collector
    const receivedMessages = [];
    socket2.on('receiveMessage', (msg) => {
      receivedMessages.push({ ...msg, receivedAt: Date.now() });
    });
    
    // Send multiple messages in sequence
    const messages = [
      'First message',
      'Second message',
      'Third message',
      'Fourth message',
      'Fifth message'
    ];
    
    for (const msg of messages) {
      socket1.emit('privateMessage', {
        senderId: TEST_USER_1,
        recipientId: TEST_USER_2,
        message: msg
      });
      await wait(100); // Small delay between messages
    }
    
    // Wait for all messages to be received
    await wait(1000);
    
    console.log(`✓ Sent ${messages.length} messages`);
    
    if (receivedMessages.length !== messages.length) {
      throw new Error(`FAIL: Expected ${messages.length} messages, received ${receivedMessages.length}`);
    }
    
    console.log(`✓ Received all ${receivedMessages.length} messages`);
    
    // Verify message order
    for (let i = 0; i < messages.length; i++) {
      if (receivedMessages[i].message !== messages[i]) {
        throw new Error(`FAIL: Message ${i} order mismatch. Expected: "${messages[i]}", Got: "${receivedMessages[i].message}"`);
      }
    }
    
    console.log('✓ All messages received in correct order');
    
    // Verify timestamps are sequential
    for (let i = 1; i < receivedMessages.length; i++) {
      if (receivedMessages[i].receivedAt < receivedMessages[i-1].receivedAt) {
        throw new Error(`FAIL: Message timestamps not sequential`);
      }
    }
    
    console.log('✓ Message timestamps are sequential');
    
    return { success: true, message: 'Multiple message sequence PRESERVED' };
    
  } catch (error) {
    return { success: false, message: `Multiple message sequence test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
  }
}

/**
 * Property 6: Bidirectional Communication Preservation
 * 
 * For any two online users, the system SHALL support bidirectional message
 * exchange with both users able to send and receive simultaneously,
 * preserving the original full-duplex communication behavior.
 */
async function testBidirectionalCommunication() {
  console.log('\n=== Test 6: Bidirectional Communication ===');
  
  let socket1, socket2;
  
  try {
    // Create two socket connections
    socket1 = createSocket();
    socket2 = createSocket();
    
    await Promise.all([
      waitForEvent(socket1, 'connect'),
      waitForEvent(socket2, 'connect')
    ]);
    
    // Register both users
    socket1.emit('registerUser', TEST_USER_1);
    socket2.emit('registerUser', TEST_USER_2);
    
    await wait(500);
    
    console.log('✓ Both users connected and registered');
    
    // Set up message collectors
    const user1Received = [];
    const user2Received = [];
    
    socket1.on('receiveMessage', (msg) => user1Received.push(msg));
    socket2.on('receiveMessage', (msg) => user2Received.push(msg));
    
    // User 1 sends to User 2
    socket1.emit('privateMessage', {
      senderId: TEST_USER_1,
      recipientId: TEST_USER_2,
      message: 'Hello from User 1'
    });
    
    await wait(200);
    
    // User 2 sends to User 1
    socket2.emit('privateMessage', {
      senderId: TEST_USER_2,
      recipientId: TEST_USER_1,
      message: 'Hello from User 2'
    });
    
    await wait(200);
    
    // User 1 sends again
    socket1.emit('privateMessage', {
      senderId: TEST_USER_1,
      recipientId: TEST_USER_2,
      message: 'Reply from User 1'
    });
    
    await wait(500);
    
    console.log('✓ Bidirectional messages sent');
    
    // Verify User 1 received message from User 2
    if (user1Received.length !== 1) {
      throw new Error(`FAIL: User 1 should receive 1 message, got ${user1Received.length}`);
    }
    
    if (user1Received[0].senderId !== TEST_USER_2) {
      throw new Error(`FAIL: User 1 received message from wrong sender`);
    }
    
    console.log('✓ User 1 received message from User 2');
    
    // Verify User 2 received messages from User 1
    if (user2Received.length !== 2) {
      throw new Error(`FAIL: User 2 should receive 2 messages, got ${user2Received.length}`);
    }
    
    if (user2Received[0].senderId !== TEST_USER_1 || user2Received[1].senderId !== TEST_USER_1) {
      throw new Error(`FAIL: User 2 received messages from wrong sender`);
    }
    
    console.log('✓ User 2 received messages from User 1');
    console.log('✓ Bidirectional communication working correctly');
    
    return { success: true, message: 'Bidirectional communication PRESERVED' };
    
  } catch (error) {
    return { success: false, message: `Bidirectional communication test FAILED: ${error.message}` };
  } finally {
    if (socket1) socket1.disconnect();
    if (socket2) socket2.disconnect();
  }
}

/**
 * Main test runner
 */
async function runPreservationTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Preservation Property Test Suite                             ║');
  console.log('║  Artist Collaboration Hub Messaging Fix                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\nValidates Requirements: 3.1, 3.2, 3.3, 3.5, 3.6');
  console.log('\nCRITICAL: These tests MUST PASS on UNFIXED code (baseline)');
  console.log('EXPECTED: These tests MUST STILL PASS on FIXED code (no regressions)\n');
  
  console.log(`Connecting to Socket.io server at: ${SOCKET_SERVER_URL}`);
  console.log('Make sure the backend server is running!\n');
  
  try {
    const results = [];
    
    // Run all preservation tests
    results.push(await testRealTimeMessageDelivery());
    results.push(await testOnlineStatusTracking());
    results.push(await testMessageSentConfirmation());
    results.push(await testOfflineRecipientHandling());
    results.push(await testMultipleMessageSequence());
    results.push(await testBidirectionalCommunication());
    
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
      console.log('\n⚠️  REGRESSION DETECTED: Some preservation tests FAILED');
      console.log('The bug fix has altered existing behavior that should be preserved.');
      console.log('\nFailed preservation properties:');
      results.filter(r => !r.success).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.message}`);
      });
      console.log('\nAction required: Review and fix the implementation to preserve original behavior.');
    } else {
      console.log('\n✓ SUCCESS: All preservation tests PASSED');
      console.log('Real-time messaging behavior is preserved correctly.');
      console.log('\nPreserved behaviors:');
      console.log('  ✓ Real-time message delivery via Socket.io');
      console.log('  ✓ Online/offline status tracking');
      console.log('  ✓ onlineUsers broadcast updates');
      console.log('  ✓ Message sent confirmations');
      console.log('  ✓ Offline recipient error handling');
      console.log('  ✓ Multiple message sequencing');
      console.log('  ✓ Bidirectional communication');
    }
    
    console.log('\n');
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n✗ Test suite error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runPreservationTests();
