require('dotenv').config();

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment.');
  process.exit(1);
}

// Artwork schema minimal model for migration
const artworkSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
  },
  { collection: 'artworks' }
);

const Artwork = mongoose.model('Artwork', artworkSchema);

// Map legacy categories to new enum values
const categoryMap = {
  Paintings: 'Painting',
  Painting: 'Painting',
  Sculpture: 'Sculpture',
  Sculptures: 'Sculpture',
  Photography: 'Photography',
  Photo: 'Photography',
  Drawing: 'Drawing',
  Drawings: 'Drawing',
  Illustration: 'Illustration',
  Illustrations: 'Illustration',
  MixedMedia: 'Mixed Media',
  'Mixed Media': 'Mixed Media',
  Calligraphy: 'Calligraphy',
  DigitalArt: 'Digital Art',
  'Digital Art': 'Digital Art',
  Printmaking: 'Printmaking',
  Ceramics: 'Ceramics',
  Textile: 'Textile',
  Jewelry: 'Jewelry',
  Glass: 'Glass',
  Woodwork: 'Woodwork',
  Metalwork: 'Metalwork',
  Architecture: 'Architecture',
  Abstract: 'Abstract',
  Landscape: 'Landscape',
  Portrait: 'Portrait',
  Watercolor: 'Watercolor',
  Oil: 'Oil Painting',
  'Oil Painting': 'Oil Painting',
  Acrylic: 'Acrylic Painting',
  'Acrylic Painting': 'Acrylic Painting',
};

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: 'shilpohaat' }).catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

  console.log('Connected to MongoDB. Scanning artworks...');

  const legacyCategories = Object.keys(categoryMap);

  const filter = { category: { $in: legacyCategories } };
  const artworks = await Artwork.find(filter).lean();
  console.log(`Found ${artworks.length} artworks needing updates.`);

  let updated = 0;
  for (const doc of artworks) {
    const oldCat = doc.category;
    const newCat = categoryMap[oldCat] || oldCat;
    if (newCat !== oldCat) {
      await Artwork.updateOne({ _id: doc._id }, { $set: { category: newCat } });
      updated++;
      console.log(`Updated ${doc.title || doc._id}: ${oldCat} -> ${newCat}`);
    }
  }

  console.log(`Migration complete. Updated ${updated} documents.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
