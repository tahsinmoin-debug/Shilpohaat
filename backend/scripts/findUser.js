require('dotenv').config({ path: '.env.development' }); // Use .env.development
const mongoose = require('mongoose');
const User = require('../models/User');

async function findUser() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in .env.development');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB\n');

    const email = 'sumaiya.rahman4@g.bracu.ac.bd';
    const user = await User.findOne({ email });

    if (user) {
      console.log('✅ Found user:');
      console.log('=====================================');
      console.log('MongoDB ID:', user._id);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('Firebase UID:', user.firebaseUID);
      console.log('=====================================\n');
      
      console.log('📋 Use this info:');
      console.log(`MongoDB ID for messages: ${user._id}`);
      console.log(`Firebase UID for API calls: ${user.firebaseUID}`);
    } else {
      console.log('❌ User not found with email:', email);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findUser();