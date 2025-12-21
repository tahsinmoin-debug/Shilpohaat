require('dotenv').config({ path: '.env.development' });
const mongoose = require('mongoose');
const User = require('../models/User.js');
const Workshop = require('../models/Workshop.js');


const DEMO_WORKSHOPS = [
  {
    title: "Mastering Terracotta Basics",
    description: "Learn the ancient art of terracotta molding from scratch.",
    type: "recorded",
    category: "Traditional Art",
    thumbnail: "https://images.unsplash.com/photo-1565191999001-551c187427bb?q=80&w=800",
    contentUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with a real tutorial link
    price: 499,
  },
  {
    title: "Live: Modern Abstract Painting",
    description: "Join me live to explore color theory and bold strokes.",
    type: "live",
    category: "Modern Art",
    thumbnail: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800",
    contentUrl: "https://zoom.us/j/your-meeting-id", // Replace with real meeting link
    scheduledAt: new Date(Date.now() + 86400000), // Scheduled for tomorrow
    price: 0,
  }
];

async function seedDB() {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shilpohaat');
    console.log('Connected to MongoDB...');

    // 2. Find an existing artist to be the instructor
    // We'll look for Nasima Khatun (from your seedArtists.js)
    const instructor = await User.findOne({ role: 'artist' });

    if (!instructor) {
      console.log('❌ No artist found in DB. Please run your seedArtists.js first!');
      process.exit(1);
    }

    // 3. Clear existing workshops (Optional)
    await Workshop.deleteMany({});
    console.log('Cleared existing workshops.');

    // 4. Add the workshops
    const workshopsWithInstructor = DEMO_WORKSHOPS.map(ws => ({
      ...ws,
      instructor: instructor._id
    }));

    await Workshop.insertMany(workshopsWithInstructor);
    console.log(`✅ Successfully seeded ${workshopsWithInstructor.length} workshops!`);
    
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();