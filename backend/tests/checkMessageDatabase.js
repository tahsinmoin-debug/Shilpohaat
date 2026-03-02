const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

async function checkMessageDatabase() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Check messages
        console.log('=== CHECKING MESSAGES ===');
        const messageCount = await Message.countDocuments();
        console.log(`Total messages in database: ${messageCount}`);

        if (messageCount > 0) {
            const recentMessages = await Message.find()
                .sort({ createdAt: -1 })
                .limit(5);
            
            console.log('\nMost recent 5 messages:');
            recentMessages.forEach((msg, index) => {
                console.log(`\n${index + 1}. Message ID: ${msg._id}`);
                console.log(`   Sender: ${msg.senderId}`);
                console.log(`   Recipient: ${msg.recipientId}`);
                console.log(`   Content: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
                console.log(`   Created: ${msg.createdAt}`);
                console.log(`   Read: ${msg.readStatus}`);
            });
        } else {
            console.log('⚠ No messages found in database');
        }

        // Check conversations
        console.log('\n\n=== CHECKING CONVERSATIONS ===');
        const conversationCount = await Conversation.countDocuments();
        console.log(`Total conversations in database: ${conversationCount}`);

        if (conversationCount > 0) {
            const conversations = await Conversation.find()
                .sort({ lastMessageAt: -1 })
                .limit(5);
            
            console.log('\nMost recent 5 conversations:');
            for (let i = 0; i < conversations.length; i++) {
                const conv = conversations[i];
                console.log(`\n${i + 1}. Conversation ID: ${conv._id}`);
                console.log(`   Participants: ${conv.participants.join(', ')}`);
                console.log(`   Last message: ${conv.lastMessageAt}`);
                console.log(`   Last content: ${conv.lastMessageContent?.substring(0, 50) || 'N/A'}`);
                
                // Get participant names
                const users = await User.find({ 
                    firebaseUID: { $in: conv.participants } 
                }).select('firebaseUID name email');
                
                console.log('   Participant details:');
                users.forEach(user => {
                    console.log(`     - ${user.name || user.email} (${user.firebaseUID})`);
                });
            }
        } else {
            console.log('⚠ No conversations found in database');
        }

        // Check users
        console.log('\n\n=== CHECKING USERS ===');
        const userCount = await User.countDocuments();
        console.log(`Total users in database: ${userCount}`);

        if (userCount > 0) {
            const users = await User.find().select('firebaseUID name email role').limit(10);
            console.log('\nFirst 10 users (for testing):');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name || user.email} (${user.firebaseUID}) - ${user.role}`);
            });
        }

        console.log('\n\n=== SUMMARY ===');
        console.log(`Messages: ${messageCount}`);
        console.log(`Conversations: ${conversationCount}`);
        console.log(`Users: ${userCount}`);

        if (messageCount === 0) {
            console.log('\n⚠ WARNING: No messages in database!');
            console.log('This means either:');
            console.log('  1. No messages have been sent yet');
            console.log('  2. Messages are not being saved to the database');
            console.log('  3. Socket.io handler is not working correctly');
            console.log('\nTo test:');
            console.log('  1. Make sure backend server is running');
            console.log('  2. Send a message from the frontend');
            console.log('  3. Run this script again to verify the message was saved');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
}

checkMessageDatabase();
