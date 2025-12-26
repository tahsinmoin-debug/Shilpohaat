require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ArtistProfile = require('./models/ArtistProfile');
const BlogPost = require('./models/BlogPost');
const Artwork = require('./models/Artwork');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    
    const users = await User.find({}).select('name email role firebaseUID');
    console.log(`Users (${users.length}):`);
    users.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));
    
    const artists = await ArtistProfile.find({}).populate('user', 'name email');
    console.log(`\nArtist Profiles (${artists.length}):`);
    artists.forEach(a => console.log(`  - ${a.user?.name || 'Unknown'} (${a.user?.email || 'N/A'})`));
    
    const blogs = await BlogPost.find({}).select('title category');
    console.log(`\nBlog Posts (${blogs.length}):`);
    blogs.forEach(b => console.log(`  - ${b.title} (${b.category})`));
    
    const artworks = await Artwork.find({}).select('title artist').populate('artist', 'name');
    console.log(`\nArtworks (${artworks.length}):`);
    artworks.forEach(a => console.log(`  - ${a.title} by ${a.artist?.name || 'Unknown'}`));
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
