const io = require('socket.io-client');

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// Test user IDs (replace with actual Firebase UIDs from your database)
const USER1_ID = 'test-user-1';
const USER2_ID = 'test-user-2';

let socket1, socket2;
let conversationId;

async function testCompleteMessagingFlow() {
    console.log('=== Testing Complete Messaging Flow ===\n');
    
    try {
        // Step 1: Test Socket.IO Connection
        console.log('Step 1: Testing Socket.IO connections...');
        await testSocketConnections();
        
        // Step 2: Test API - Get or Create Conversation
        console.log('\nStep 2: Testing conversation creation...');
        await testConversationCreation();
        
        // Step 3: Test Real-time Message Sending
        console.log('\nStep 3: Testing real-time message sending...');
        await testRealTimeMessaging();
        
        // Step 4: Test Message Persistence
        console.log('\nStep 4: Testing message persistence...');
        await testMessagePersistence();
        
        // Step 5: Test Unread Counts
        console.log('\nStep 5: Testing unread counts...');
        await testUnreadCounts();
        
        console.log('\n=== All Tests Passed! ===');
        
    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
    } finally {
        // Cleanup
        if (socket1) socket1.disconnect();
        if (socket2) socket2.disconnect();
        process.exit(0);
    }
}

function testSocketConnections() {
    return new Promise((resolve, reject) => {
        let connected = 0;
        const timeout = setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
        
        socket1 = io(SOCKET_URL);
        socket2 = io(SOCKET_URL);
        
        socket1.on('connect', () => {
            console.log('✓ User 1 socket connected');
            socket1.emit('registerUser', USER1_ID);
            connected++;
            if (connected === 2) {
                clearTimeout(timeout);
                resolve();
            }
        });
        
        socket2.on('connect', () => {
            console.log('✓ User 2 socket connected');
            socket2.emit('registerUser', USER2_ID);
            connected++;
            if (connected === 2) {
                clearTimeout(timeout);
                resolve();
            }
        });
        
        socket1.on('connect_error', (error) => {
            clearTimeout(timeout);
            reject(new Error(`Socket 1 connection error: ${error.message}`));
        });
        
        socket2.on('connect_error', (error) => {
            clearTimeout(timeout);
            reject(new Error(`Socket 2 connection error: ${error.message}`));
        });
    });
}

async function testConversationCreation() {
    try {
        const response = await fetch(`${API_BASE_URL}/messages/conversation/${USER2_ID}`, {
            headers: {
                'x-firebase-uid': USER1_ID
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create conversation: ${response.status}`);
        }
        
        const data = await response.json();
        conversationId = data.conversation._id;
        
        console.log('✓ Conversation created:', conversationId);
        console.log('  Participants:', data.conversation.participants);
        
    } catch (error) {
        throw new Error(`Conversation creation failed: ${error.message}`);
    }
}

function testRealTimeMessaging() {
    return new Promise((resolve, reject) => {
        const testMessage = `Test message at ${new Date().toISOString()}`;
        const timeout = setTimeout(() => reject(new Error('Message receive timeout')), 5000);
        
        // User 2 listens for message
        socket2.once('receiveMessage', (data) => {
            clearTimeout(timeout);
            
            if (data.senderId === USER1_ID && data.message === testMessage) {
                console.log('✓ User 2 received message in real-time');
                console.log('  Message:', data.message);
                resolve();
            } else {
                reject(new Error('Received message does not match sent message'));
            }
        });
        
        // User 1 sends message
        socket1.emit('privateMessage', {
            recipientId: USER2_ID,
            senderId: USER1_ID,
            message: testMessage
        });
        
        console.log('✓ User 1 sent message via Socket.IO');
    });
}

async function testMessagePersistence() {
    // Wait a bit for database write
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
            headers: {
                'x-firebase-uid': USER1_ID
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.status}`);
        }
        
        const data = await response.json();
        const messages = data.messages || [];
        
        if (messages.length === 0) {
            throw new Error('No messages found in database');
        }
        
        console.log('✓ Messages persisted to database');
        console.log(`  Total messages: ${messages.length}`);
        console.log('  Latest message:', messages[messages.length - 1].content);
        
    } catch (error) {
        throw new Error(`Message persistence test failed: ${error.message}`);
    }
}

async function testUnreadCounts() {
    try {
        // Fetch conversations for User 2 (who received the message)
        const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
            headers: {
                'x-firebase-uid': USER2_ID
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch conversations: ${response.status}`);
        }
        
        const data = await response.json();
        const conversations = data.conversations || [];
        
        const conv = conversations.find(c => c._id === conversationId);
        
        if (!conv) {
            throw new Error('Conversation not found');
        }
        
        console.log('✓ Unread count retrieved');
        console.log(`  Unread messages for User 2: ${conv.unreadCount}`);
        
        // Test marking as read
        const markReadResponse = await fetch(`${API_BASE_URL}/messages/${conversationId}/mark-read`, {
            method: 'POST',
            headers: {
                'x-firebase-uid': USER2_ID
            }
        });
        
        if (!markReadResponse.ok) {
            throw new Error(`Failed to mark messages as read: ${markReadResponse.status}`);
        }
        
        console.log('✓ Messages marked as read');
        
    } catch (error) {
        throw new Error(`Unread count test failed: ${error.message}`);
    }
}

// Run tests
testCompleteMessagingFlow();
