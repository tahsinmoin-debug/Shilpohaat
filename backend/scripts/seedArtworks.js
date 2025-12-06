const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Artwork = require('../models/Artwork');

dotenv.config();

const seedArtworks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the demo artists by email
    const nasima = await User.findOne({ email: 'nasima@example.com' });
    const sohel = await User.findOne({ email: 'sohel@example.com' });
    const meher = await User.findOne({ email: 'meher@example.com' });
    const farida = await User.findOne({ email: 'farida@example.com' });

    if (!nasima || !sohel || !meher || !farida) {
      console.log('Please run seedArtists.js first to create demo artists!');
      process.exit(1);
    }

    // Clear existing artworks
    await Artwork.deleteMany({});
    console.log('Cleared existing artworks');

    // Create demo artworks
    const artworks = [
      // Nasima Khatun - Sculptor
      {
        artist: nasima._id,
        title: 'Clay Sculpture - Traditional Dancer',
        description: 'Hand-sculpted terracotta figurine depicting a traditional Bengali dancer. Created using local clay and traditional techniques passed down through generations.',
        category: 'Sculptures',
        price: 8500,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzg4NjY0NCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DbGF5IFNjdWxwdHVyZTwvdGV4dD48L3N2Zz4=',
        ],
        dimensions: { width: 15, height: 30, depth: 12, unit: 'cm' },
        materials: ['Clay', 'Terracotta'],
        status: 'available',
        featured: true,
      },
      {
        artist: nasima._id,
        title: 'Village Life Series - Fisherman',
        description: 'Detailed clay sculpture capturing the essence of rural Bengal. Part of the Village Life series.',
        category: 'Sculptures',
        price: 12000,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzk5NzczMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GaXNoZXJtYW48L3RleHQ+PC9zdmc+',
        ],
        dimensions: { width: 20, height: 35, depth: 15, unit: 'cm' },
        materials: ['Clay'],
        status: 'available',
        featured: false,
      },

      // Sohel Islam - Jewelry Designer
      {
        artist: sohel._id,
        title: 'Handcrafted Silver Necklace',
        description: 'Exquisite silver necklace with traditional Bengali motifs. Each piece is hand-hammered and polished to perfection.',
        category: 'Jewelry',
        price: 15000,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0M0QzRDNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaWx2ZXIgTmVja2xhY2U8L3RleHQ+PC9zdmc+',
        ],
        dimensions: { width: 40, height: 5, depth: 1, unit: 'cm' },
        materials: ['Metal', 'Silver'],
        status: 'available',
        featured: true,
      },
      {
        artist: sohel._id,
        title: 'Traditional Bengali Earrings Set',
        description: 'Pair of intricately designed earrings inspired by Mughal architecture and Bengali heritage.',
        category: 'Jewelry',
        price: 8000,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGRDcwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FYXJyaW5ncyBTZXQ8L3RleHQ+PC9zdmc+',
        ],
        dimensions: { width: 3, height: 6, depth: 0.5, unit: 'cm' },
        materials: ['Metal', 'Gold'],
        status: 'available',
        featured: false,
      },

      // Meher Ali - Watercolor Artist
      {
        artist: meher._id,
        title: 'Watercolor Landscape - Sundarbans',
        description: 'Serene watercolor painting capturing the mystical beauty of the Sundarbans mangrove forest. Created with natural pigments on handmade paper.',
        category: 'Paintings',
        price: 18000,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojODdDRUVCO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOThGQjk4O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY2OEI4QjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdW5kYXJiYW5zPC90ZXh0Pjwvc3ZnPg==',
        ],
        dimensions: { width: 60, height: 40, unit: 'cm' },
        materials: ['Watercolor', 'Paper'],
        status: 'available',
        featured: true,
      },
      {
        artist: meher._id,
        title: 'Monsoon in Dhaka',
        description: 'Vibrant watercolor depicting the bustling streets of Dhaka during monsoon season.',
        category: 'Paintings',
        price: 22000,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzRBNjc4RCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb25zb29uIGluIERoYWthPC90ZXh0Pjwvc3ZnPg==',
        ],
        dimensions: { width: 70, height: 50, unit: 'cm' },
        materials: ['Watercolor', 'Canvas'],
        status: 'available',
        featured: false,
      },

      // Farida Parveen - Abstract Artist
      {
        artist: farida._id,
        title: 'Modern Abstract - Cultural Fusion',
        description: 'Bold abstract piece exploring the intersection of traditional Bengali culture and modern urban life. Mixed media on canvas.',
        category: 'Mixed Media',
        price: 35000,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0ZGNEUwMCIvPjxyZWN0IHg9IjEwMCIgeT0iMTAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRFMDMwMyIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iNTAiIGZpbGw9IiNGRkQ3MDAiLz48dGV4dCB4PSI1MCUiIHk9IjkwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIwIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DdWx0dXJhbCBGdXNpb248L3RleHQ+PC9zdmc+',
        ],
        dimensions: { width: 90, height: 120, unit: 'cm' },
        materials: ['Acrylic', 'Canvas', 'Mixed'],
        status: 'available',
        featured: true,
      },
      {
        artist: farida._id,
        title: 'Colors of Liberation',
        description: 'Explosive abstract celebrating the spirit of Bangladesh\'s independence.',
        category: 'Paintings',
        price: 42000,
        images: [
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzAwNjY0RiIvPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjQyQTQxIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSI4MCIgZmlsbD0iI0ZGRDcwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iOTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxpYmVyYXRpb248L3RleHQ+PC9zdmc+',
        ],
        dimensions: { width: 100, height: 80, unit: 'cm' },
        materials: ['Acrylic', 'Oil', 'Canvas'],
        status: 'sold',
        featured: false,
      },
    ];

    const createdArtworks = await Artwork.insertMany(artworks);
    console.log(`✅ Created ${createdArtworks.length} demo artworks`);

    // Update some as featured
    console.log('\nFeatured Artworks:');
    createdArtworks.filter(a => a.featured).forEach(artwork => {
      console.log(`  - ${artwork.title} by ${artwork.artist}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding artworks:', error);
    process.exit(1);
  }
};

seedArtworks();
