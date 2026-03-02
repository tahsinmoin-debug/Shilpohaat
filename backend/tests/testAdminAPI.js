require('dotenv').config();
const http = require('http');

// Get a Firebase UID from a user in the database
const mongoose = require('mongoose');
const User = require('../models/User');

async function testAdminEndpoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'tahsinmoin2662@gmail.com' });
    if (!adminUser) {
      console.error('❌ Admin user not found!');
      mongoose.disconnect();
      return;
    }
    
    console.log('✓ Found admin user:', adminUser.name, adminUser.email);
    console.log('  Firebase UID:', adminUser.firebaseUID);
    
    mongoose.disconnect();
    
    // Test the endpoints
    const firebaseUID = adminUser.firebaseUID;
    
    const testEndpoint = (path) => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path,
          method: 'GET',
          headers: {
            'x-firebase-uid': firebaseUID
          }
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            resolve({ status: res.statusCode, data });
          });
        });
        
        req.on('error', reject);
        req.end();
      });
    };
    
    console.log('\nTesting endpoints:');
    
    const tests = [
      '/api/admin/users',
      '/api/admin/artists',
      '/api/artworks?includeAll=true',
      '/api/blog?limit=100',
      '/api/admin/analytics/artists-sales'
    ];
    
    for (const path of tests) {
      try {
        const result = await testEndpoint(path);
        console.log(`  ${path}`);
        console.log(`    Status: ${result.status}`);
        if (result.status === 200) {
          const parsed = JSON.parse(result.data);
          const count = parsed.users?.length || parsed.artists?.length || parsed.artworks?.length || parsed.posts?.length || 0;
          console.log(`    ✓ Success - ${count} items`);
        } else {
          console.log(`    ❌ Error: ${result.data}`);
        }
      } catch (e) {
        console.log(`    ❌ Request failed: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAdminEndpoints();
