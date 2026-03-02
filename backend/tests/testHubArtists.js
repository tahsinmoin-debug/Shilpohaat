/**
 * Test Hub Artists Endpoint
 * Verifies that /api/artist/hub-artists returns artist list correctly
 */

const http = require('http');

const PORT = 5000;
const HOST = 'localhost';

console.log('Testing /api/artist/hub-artists endpoint...\n');

const options = {
  hostname: HOST,
  port: PORT,
  path: '/api/artist/hub-artists',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}\n`);
    
    if (res.statusCode === 200) {
      try {
        const artists = JSON.parse(data);
        
        console.log('✅ Endpoint working!');
        console.log(`\nFound ${artists.length} artists:\n`);
        
        if (Array.isArray(artists)) {
          artists.forEach((artist, index) => {
            console.log(`${index + 1}. ${artist.name} (ID: ${artist.id})`);
          });
          
          if (artists.length === 0) {
            console.log('\n⚠️  No artists found in database.');
            console.log('This means there are no users with role="artist" in the database.');
            console.log('\nTo add artists:');
            console.log('1. Register users through the frontend');
            console.log('2. Set their role to "artist" in the database');
            console.log('3. Or use a seed script to create test artists');
          }
        } else {
          console.log('❌ Response is not an array:', artists);
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.log('Raw response:', data);
      }
    } else {
      console.error(`❌ Request failed with status ${res.statusCode}`);
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.error('\nMake sure the backend server is running:');
  console.error('  cd Shilpohaat/backend');
  console.error('  npm start');
});

req.end();
