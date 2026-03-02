const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Use actual user IDs from the database
const USER1_UID = '4WK7MEBOoJNRpYKjPD3XGxvprU53'; // Elma
const USER2_UID = 'GSk7J8xFb7ZritwQp0u5FKxJ7jo2'; // Rahat

async function testAPIEndpoint() {
    console.log('=== Testing Message History API Endpoint ===\n');

    try {
        console.log(`Fetching messages between:`);
        console.log(`  User 1: ${USER1_UID}`);
        console.log(`  User 2: ${USER2_UID}\n`);

        const response = await axios.get(
            `${API_BASE_URL}/messages/conversation/${USER2_UID}`,
            {
                headers: {
                    'x-firebase-uid': USER1_UID
                }
            }
        );

        console.log('✓ API Response Status:', response.status);
        console.log('✓ Response structure:', Object.keys(response.data));
        
        if (response.data.messages) {
            console.log(`\n✓ Found ${response.data.messages.length} messages\n`);
            
            if (response.data.messages.length > 0) {
                console.log('Message details:');
                response.data.messages.forEach((msg, index) => {
                    console.log(`\n${index + 1}. ${msg.content}`);
                    console.log(`   From: ${msg.senderId}`);
                    console.log(`   To: ${msg.recipientId}`);
                    console.log(`   Time: ${msg.createdAt}`);
                    console.log(`   Read: ${msg.readStatus}`);
                });
            }
        } else {
            console.log('\n⚠ No messages array in response');
            console.log('Response data:', JSON.stringify(response.data, null, 2));
        }

        if (response.data.conversation) {
            console.log('\n✓ Conversation details:');
            console.log('  ID:', response.data.conversation._id);
            console.log('  Participants:', response.data.conversation.participants);
        }

    } catch (error) {
        console.error('\n✗ API request failed:');
        if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Data:', error.response.data);
        } else {
            console.error('  Message:', error.message);
        }
    }
}

console.log('Make sure the backend server is running on port 5000\n');
testAPIEndpoint();
