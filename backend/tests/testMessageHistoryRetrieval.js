const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test user IDs (replace with actual Firebase UIDs from your database)
const USER1_UID = 'test-user-1'; // Replace with actual UID
const USER2_UID = 'test-user-2'; // Replace with actual UID

async function testMessageHistoryRetrieval() {
    console.log('=== Testing Message History Retrieval ===\n');

    try {
        // Test 1: Fetch conversation history between two users
        console.log(`1. Fetching conversation history between ${USER1_UID} and ${USER2_UID}...`);
        const response = await axios.get(
            `${API_BASE_URL}/messages/conversation/${USER2_UID}`,
            {
                headers: {
                    'x-firebase-uid': USER1_UID
                }
            }
        );

        console.log('✓ Response Status:', response.status);
        console.log('✓ Response Data:', JSON.stringify(response.data, null, 2));
        
        if (response.data.messages && response.data.messages.length > 0) {
            console.log(`\n✓ Found ${response.data.messages.length} messages in conversation`);
            console.log('\nFirst message:');
            console.log('  - Sender:', response.data.messages[0].senderId);
            console.log('  - Content:', response.data.messages[0].content);
            console.log('  - Created:', response.data.messages[0].createdAt);
        } else {
            console.log('\n⚠ No messages found in conversation');
            console.log('This could mean:');
            console.log('  1. No messages have been sent between these users yet');
            console.log('  2. The user IDs are incorrect');
            console.log('  3. Messages are not being saved to the database');
        }

        // Test 2: Check if conversation exists
        if (response.data.conversation) {
            console.log('\n✓ Conversation exists:');
            console.log('  - ID:', response.data.conversation._id);
            console.log('  - Participants:', response.data.conversation.participants);
            console.log('  - Last message:', response.data.conversation.lastMessageAt);
        } else {
            console.log('\n⚠ No conversation found between these users');
        }

    } catch (error) {
        console.error('\n✗ Error testing message history retrieval:');
        if (error.response) {
            console.error('  - Status:', error.response.status);
            console.error('  - Data:', error.response.data);
        } else {
            console.error('  - Message:', error.message);
        }
    }
}

// Instructions
console.log('INSTRUCTIONS:');
console.log('1. Make sure the backend server is running (npm start in backend folder)');
console.log('2. Update USER1_UID and USER2_UID with actual Firebase UIDs from your database');
console.log('3. Send some messages between these users using the frontend');
console.log('4. Run this script: node testMessageHistoryRetrieval.js\n');

testMessageHistoryRetrieval();
