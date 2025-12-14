require('dotenv').config();

const mongoose = require('mongoose');
const Artwork = require('../models/Artwork');

const allowed = [
  'Abstract',
  'Landscape',
  'Portrait',
  'Modern Art',
  'Traditional Art',
  'Nature & Wildlife',
  'Cityscape',
  'Floral Art',
  'Minimalist',
  'Pop Art',
  'Digital Art',
  'Acrylic',
  'Oil',
  'Watercolor',
  'Mixed Media',
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

  const pipeline = [
    {
      $match: {
        $or: [
          { category: { $nin: allowed } },
          { category: { $not: { $type: 'string' } } },
        ],
      },
    },
    { $project: { title: 1, category: 1 } },
  ];

  const invalid = await Artwork.aggregate(pipeline);
  console.log('Invalid count:', invalid.length);
  invalid.forEach((doc) => console.log(`${doc.title || doc._id} -> ${JSON.stringify(doc.category)}`));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
