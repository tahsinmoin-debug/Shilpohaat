/**
 * Check Messages in Database
 * Shows all messages currently stored
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkMessages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        console.log('Checking conversations...');
        const conversations = await Conversation.find({});
        console.log(`Found ${conversations.length} conversation(s)\n`);

        if (conversations.length > 0) {
            for (const conv of conversations) {
                console.log(`Conversation ${conv._id}:`);
                console.log(`  Participants: ${conv.participants.join(', ')}`);
                console.log(`  Last message: ${conv.lastMessageAt}`);
                console.log(`  Content preview: ${conv.lastMessageContent || 'N/A'}`);
                
                const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
                console.log(`  Total messages: ${messages.length}`);
                
                if (messages.length > 0) {
                    console.log(`  Recent messages:`);
                    messages.slice(-3).forEach((msg, idx) => {
                        console.log(`    ${idx + 1}. [${msg.senderId}]: ${msg.content.substring(0, 50)}...`);
                    });
                }
                console.log('');
            }
        } else {
            console.log('No conversations found in database.');
            console.log('This means messages are NOT being saved.');
            console.log('\nPossible reasons:');
            console.log('1. Backend server needs to be restarted');
            console.log('2. Socket.io handler is not executing the save code');
            console.log('3. Database connection issue in the running server');
        }

        console.log('\nChecking all messages...');
        const allMessages = await Message.find({});
        console.log(`Total messages in database: ${allMessages.length}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

checkMessages();
