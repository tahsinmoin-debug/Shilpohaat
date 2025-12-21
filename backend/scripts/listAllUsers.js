require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const users = await User.find({});

    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. User:`);
        console.log('   MongoDB ID:', user._id);
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        console.log('   Firebase UID:', user.firebaseUID);
        console.log('');
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listAllUsers();