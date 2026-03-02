/**
 * Test Message Persistence
 * Verifies that messages are being saved to the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

const MONGODB_URI = process.env.MONGODB_URI;

async function testMessagePersistence() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Test data
        const senderId = 'test-sender-uid';
        const recipientId = 'test-recipient-uid';
        const messageContent = 'Test message for persistence';

        console.log('Creating test conversation...');
        const participants = [senderId, recipientId].sort();
        
        let conversation = await Conversation.findOneAndUpdate(
            { participants },
            {
                $setOnInsert: {
                    participants,
                    unreadCount: new Map([[senderId, 0], [recipientId, 0]])
                },
                $set: {
                    lastMessageAt: new Date(),
                    lastMessageContent: messageContent.substring(0, 200)
                }
            },
            { upsert: true, new: true }
        );
        console.log('✓ Conversation created/found:', conversation._id);

        console.log('\nCreating test message...');
        const newMessage = new Message({
            conversationId: conversation._id,
            senderId,
            recipientId,
            content: messageContent,
            readStatus: false
        });
        await newMessage.save();
        console.log('✓ Message saved:', newMessage._id);

        console.log('\nRetrieving messages from database...');
        const messages = await Message.find({ conversationId: conversation._id });
        console.log(`✓ Found ${messages.length} message(s) in conversation`);
        
        if (messages.length > 0) {
            console.log('\nLatest message:');
            console.log('  - Content:', messages[messages.length - 1].content);
            console.log('  - Sender:', messages[messages.length - 1].senderId);
            console.log('  - Created:', messages[messages.length - 1].createdAt);
        }

        console.log('\n✓ Message persistence test PASSED');
        console.log('Messages are being saved to database correctly.');

        // Cleanup
        console.log('\nCleaning up test data...');
        await Message.deleteMany({ conversationId: conversation._id });
        await Conversation.deleteOne({ _id: conversation._id });
        console.log('✓ Test data cleaned up');

    } catch (error) {
        console.error('\n✗ Message persistence test FAILED');
        console.error('Error:', error.message);
        console.error('\nFull error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
    }
}

testMessagePersistence();
