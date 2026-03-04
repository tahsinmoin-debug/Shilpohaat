require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shilpohaat');
    console.log('✓ Connected to MongoDB');

    // Get email from command line or use default
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/createAdmin.js your_email@example.com');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      console.log('\nMake sure the user exists in your database first.');
      process.exit(1);
    }

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log('\n✅ SUCCESS! User is now an admin:');
    console.log('-----------------------------------');
    console.log(`Name: ${user.name || 'N/A'}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Firebase UID: ${user.firebaseUID}`);
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();