// Script to fix Review collection indexes
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/db');

async function fixIndexes() {
    try {
        await connectDB();
        console.log('Connected to database');

        const db = mongoose.connection.db;
        const collection = db.collection('reviews');

        // Get all existing indexes
        console.log('\n📋 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log('  -', JSON.stringify(index.key), index.name);
        });

        // Drop the old workshop_1_user_1 index if it exists
        try {
            await collection.dropIndex('workshop_1_user_1');
            console.log('\n✅ Dropped old index: workshop_1_user_1');
        } catch (err) {
            if (err.code === 27) {
                console.log('\n⚠️  Index workshop_1_user_1 does not exist (already removed)');
            } else {
                throw err;
            }
        }

        // Ensure the correct index exists
        await collection.createIndex(
            { artwork: 1, reviewerId: 1 },
            { unique: true, name: 'artwork_1_reviewerId_1' }
        );
        console.log('✅ Created correct index: artwork_1_reviewerId_1');

        // Show final indexes
        console.log('\n📋 Final indexes:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(index => {
            console.log('  -', JSON.stringify(index.key), index.name);
        });

        console.log('\n✅ Index fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing indexes:', error);
        process.exit(1);
    }
}

fixIndexes();
