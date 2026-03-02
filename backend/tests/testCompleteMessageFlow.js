const io = require('socket.io-client');
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const SOCKET_URL = 'http://localhost:5000';
const API_BASE_URL = 'http://localhost:5000/api';

// Test user IDs - replace with actual Firebase UIDs from your database
const USER1_UID = 'test-user-1';
const USER2_UID = 'test-user-2';

async function testCompleteMessageFlow() {
    console.log('=== COMPLETE MESSAGE FLOW TEST ===\n');

    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Step 1: Check initial state
        console.log('STEP 1: Checking initial database state...');
        const initialMessageCount = await Message.countDocuments();
        const initialConversationCount = await Conversation.countDocuments();
        console.log(`  Messages: ${initialMessageCount}`);
        console.log(`  Conversations: ${initialConversationCount}\n`);

        // Step 2: Connect Socket.io clients
        console.log('STEP 2: Connecting Socket.io clients...');
        const socket1 = io(SOCKET_URL, { transports: ['websocket'] });
        const socket2 = io(SOCKET_URL, { transports: ['websocket'] });

        await new Promise((resolve) => {
            let connected = 0;
            socket1.on('connect', () => {
                console.log('  ✓ User 1 connected');
                socket1.emit('registerUser', USER1_UID);
                connected++;
                if (connected === 2) resolve();
            });
            socket2.on('connect', () => {
                console.log('  ✓ User 2 connected');
                socket2.emit('registerUser', USER2_UID);
                connected++;
                if (connected === 2) resolve();
            });
        });

        // Wait for registration
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('  ✓ Both users registered\n');

        // Step 3: Send a test message
        console.log('STEP 3: Sending test message from User 1 to User 2...');
        const testMessage = `Test message at ${new Date().toISOString()}`;
        
        socket1.emit('privateMessage', {
            recipientId: USER2_UID,
            senderId: USER1_UID,
            message: testMessage
        });

        // Wait for message to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('  ✓ Message sent\n');

        // Step 4: Check if message was saved to database
        console.log('STEP 4: Checking if message was saved to database...');
        const newMessageCount = await Message.countDocuments();
        const newConversationCount = await Conversation.countDocuments();
        
        console.log(`  Messages: ${newMessageCount} (was ${initialMessageCount})`);
        console.log(`  Conversations: ${newConversationCount} (was ${initialConversationCount})`);

        if (newMessageCount > initialMessageCount) {
            console.log('  ✓ Message was saved to database!\n');
            
            // Find the message
            const savedMessage = await Message.findOne({
                senderId: USER1_UID,
                recipientId: USER2_UID,
                content: testMessage
            });

            if (savedMessage) {
                console.log('  Message details:');
                console.log(`    - ID: ${savedMessage._id}`);
                console.log(`    - Conversation ID: ${savedMessage.conversationId}`);
                console.log(`    - Content: ${savedMessage.content}`);
                console.log(`    - Created: ${savedMessage.createdAt}`);
            }
        } else {
            console.log('  ✗ Message was NOT saved to database!\n');
            console.log('  This indicates a problem with the Socket.io handler.');
        }

        // Step 5: Test API endpoint to retrieve messages
        console.log('\nSTEP 5: Testing API endpoint to retrieve messages...');
        try {
            const response = await axios.get(
                `${API_BASE_URL}/messages/conversation/${USER2_UID}`,
                {
                    headers: {
                        'x-firebase-uid': USER1_UID
                    }
                }
            );

            console.log(`  ✓ API Response Status: ${response.status}`);
            console.log(`  ✓ Messages retrieved: ${response.data.messages?.length || 0}`);

            if (response.data.messages && response.data.messages.length > 0) {
                console.log('\n  Recent messages:');
                response.data.messages.slice(-3).forEach((msg, index) => {
                    console.log(`    ${index + 1}. ${msg.content.substring(0, 50)}`);
                    console.log(`       From: ${msg.senderId}`);
                    console.log(`       At: ${msg.createdAt}`);
                });
            }
        } catch (error) {
            console.log('  ✗ API request failed:');
            console.log(`    ${error.message}`);
        }

        // Cleanup
        socket1.disconnect();
        socket2.disconnect();
        await mongoose.connection.close();

        console.log('\n=== TEST COMPLETE ===');

    } catch (error) {
        console.error('\n✗ Test failed:', error);
        await mongoose.connection.close();
    }
}

console.log('INSTRUCTIONS:');
console.log('1. Make sure the backend server is running');
console.log('2. Update USER1_UID and USER2_UID with actual Firebase UIDs');
console.log('3. Run: node testCompleteMessageFlow.js\n');

testCompleteMessageFlow();
