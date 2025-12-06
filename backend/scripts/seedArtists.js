// Seed demo artists for testing
// Run with: node backend/scripts/seedArtists.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.js');
const ArtistProfile = require('../models/ArtistProfile.js');

const DEMO_ARTISTS = [
  {
    email: 'nasima.khatun@shilpohaat.com',
    name: 'Nasima Khatun',
    firebaseUID: 'demo-nasima-khatun-uid',
    role: 'artist',
    profile: {
      bio: 'Nasima Khatun',
      artistStory: 'A master sculptor from rural Bangladesh, Nasima brings traditional clay craftsmanship into contemporary art. Her work reflects the stories of village life and celebrates the strength of Bengali women.',
      specializations: ['Sculpture', 'Ceramics', 'Traditional Bengali Art'],
      skills: ['Portrait', 'Realism', 'Folk Art'],
      contactPhone: '+880 1712-123456',
      website: '',
      instagram: '@nasimakhatun_art',
      availability: 'available',
      profilePicture: 'https://placehold.co/400x400/8B4513/FFF.png?text=NK',
      portfolioImages: [
        'https://placehold.co/600x600/8B4513/FFF.png?text=Clay+Sculpture+1',
        'https://placehold.co/600x600/A0522D/FFF.png?text=Clay+Sculpture+2',
        'https://placehold.co/600x600/654321/FFF.png?text=Clay+Sculpture+3',
      ],
      isProfileComplete: true,
    }
  },
  {
    email: 'sohel.islam@shilpohaat.com',
    name: 'Sohel Islam',
    firebaseUID: 'demo-sohel-islam-uid',
    role: 'artist',
    profile: {
      bio: 'Sohel Islam',
      artistStory: 'A jewelry designer combining traditional Bengali motifs with modern aesthetics. Each piece tells a story of heritage and innovation.',
      specializations: ['Jewelry', 'Mixed Media'],
      skills: ['Contemporary', 'Traditional Bengali Art', 'Illustration'],
      contactPhone: '+880 1712-234567',
      website: 'https://sohelislamjewelry.com',
      instagram: '@sohel_jewelry',
      availability: 'available',
      profilePicture: 'https://placehold.co/400x400/DAA520/000.png?text=SI',
      portfolioImages: [
        'https://placehold.co/600x600/FFD700/000.png?text=Jewelry+1',
        'https://placehold.co/600x600/DAA520/000.png?text=Jewelry+2',
        'https://placehold.co/600x600/B8860B/FFF.png?text=Jewelry+3',
      ],
      isProfileComplete: true,
    }
  },
  {
    email: 'meher.ali@shilpohaat.com',
    name: 'Meher Ali',
    firebaseUID: 'demo-meher-ali-uid',
    role: 'artist',
    profile: {
      bio: 'Meher Ali',
      artistStory: 'Watercolor artist capturing the essence of Bengal\'s rivers, monsoons, and rural landscapes. My art is a love letter to the natural beauty of Bangladesh.',
      specializations: ['Watercolor', 'Painting'],
      skills: ['Landscape', 'Realism', 'Contemporary'],
      contactPhone: '+880 1712-345678',
      website: '',
      instagram: '@meher_watercolors',
      availability: 'busy',
      profilePicture: 'https://placehold.co/400x400/4682B4/FFF.png?text=MA',
      portfolioImages: [
        'https://placehold.co/600x600/87CEEB/000.png?text=Landscape+1',
        'https://placehold.co/600x600/4682B4/FFF.png?text=Landscape+2',
        'https://placehold.co/600x600/5F9EA0/FFF.png?text=Landscape+3',
      ],
      isProfileComplete: true,
    }
  },
  {
    email: 'farida.parveen@shilpohaat.com',
    name: 'Farida Parveen',
    firebaseUID: 'demo-farida-parveen-uid',
    role: 'artist',
    profile: {
      bio: 'Farida Parveen',
      artistStory: 'Modern abstract painter exploring themes of identity, migration, and cultural fusion. My work bridges traditional Bengali aesthetics with contemporary abstraction.',
      specializations: ['Acrylic', 'Oil Painting', 'Mixed Media'],
      skills: ['Abstract', 'Modern Art', 'Contemporary'],
      contactPhone: '+880 1712-456789',
      website: 'https://faridaparveenart.com',
      instagram: '@farida_abstract',
      availability: 'available',
      profilePicture: 'https://placehold.co/400x400/DC143C/FFF.png?text=FP',
      portfolioImages: [
        'https://placehold.co/600x600/FF6347/FFF.png?text=Abstract+1',
        'https://placehold.co/600x600/DC143C/FFF.png?text=Abstract+2',
        'https://placehold.co/600x600/B22222/FFF.png?text=Abstract+3',
      ],
      isProfileComplete: true,
    }
  },
  {
    email: 'rahman.chowdhury@shilpohaat.com',
    name: 'Rahman Chowdhury',
    firebaseUID: 'demo-rahman-chowdhury-uid',
    role: 'artist',
    profile: {
      bio: 'Rahman Chowdhury',
      artistStory: 'Digital artist and illustrator bringing Bengali folklore to life through modern digital techniques. From Nakshi Kantha patterns to contemporary character design.',
      specializations: ['Digital Art', 'Illustration'],
      skills: ['Illustration', 'Typography', 'Contemporary', 'Folk Art'],
      contactPhone: '+880 1712-567890',
      website: 'https://rahmanchowdhuryart.com',
      instagram: '@rahman_digital',
      availability: 'available',
      profilePicture: 'https://placehold.co/400x400/9370DB/FFF.png?text=RC',
      portfolioImages: [
        'https://placehold.co/600x600/9370DB/FFF.png?text=Digital+1',
        'https://placehold.co/600x600/8A2BE2/FFF.png?text=Digital+2',
        'https://placehold.co/600x600/9932CC/FFF.png?text=Digital+3',
      ],
      isProfileComplete: true,
    }
  },
  {
    email: 'anjali.das@shilpohaat.com',
    name: 'Anjali Das',
    firebaseUID: 'demo-anjali-das-uid',
    role: 'artist',
    profile: {
      bio: 'Anjali Das',
      artistStory: 'Textile artist preserving and reinventing traditional Bengali weaving techniques. Each piece is a meditation on texture, color, and cultural memory.',
      specializations: ['Textile Art', 'Weaving'],
      skills: ['Traditional Bengali Art', 'Folk Art', 'Contemporary'],
      contactPhone: '+880 1712-678901',
      website: '',
      instagram: '@anjali_textiles',
      availability: 'available',
      profilePicture: 'https://placehold.co/400x400/228B22/FFF.png?text=AD',
      portfolioImages: [
        'https://placehold.co/600x600/32CD32/000.png?text=Textile+1',
        'https://placehold.co/600x600/228B22/FFF.png?text=Textile+2',
        'https://placehold.co/600x600/006400/FFF.png?text=Textile+3',
      ],
      isProfileComplete: true,
    }
  },
];

async function seedArtists() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shilpohaat';
    await mongoose.connect(mongoURI);
    console.log('✓ Connected to MongoDB');

    for (const artist of DEMO_ARTISTS) {
      // Check if user already exists
      let user = await User.findOne({ email: artist.email });
      
      if (!user) {
        // Create user
        user = new User({
          email: artist.email,
          name: artist.name,
          firebaseUID: artist.firebaseUID,
          role: artist.role,
        });
        await user.save();
        console.log(`✓ Created user: ${artist.name}`);
      } else {
        console.log(`→ User already exists: ${artist.name}`);
      }

      // Check if profile exists
      let profile = await ArtistProfile.findOne({ user: user._id });
      
      if (!profile) {
        // Create profile
        profile = new ArtistProfile({
          user: user._id,
          ...artist.profile,
        });
        await profile.save();
        
        // Update user's artistProfile reference
        user.artistProfile = profile._id;
        await user.save();
        
        console.log(`✓ Created profile for: ${artist.name}`);
      } else {
        console.log(`→ Profile already exists for: ${artist.name}`);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`📊 Total demo artists: ${DEMO_ARTISTS.length}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedArtists();
