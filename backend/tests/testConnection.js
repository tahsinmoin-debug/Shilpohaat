/**
 * Simple Backend Connection Test
 * Tests if the backend server is accessible and responding
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

console.log('Testing backend connection...\n');

// Test 1: Health endpoint
const healthOptions = {
  hostname: HOST,
  port: PORT,
  path: '/api/health',
  method: 'GET'
};

const healthReq = http.request(healthOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Health Check:');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Response: ${data}\n`);
    
    // Test 2: Root endpoint
    testRoot();
  });
});

healthReq.on('error', (error) => {
  console.error('❌ Health Check Failed:');
  console.error(`   Error: ${error.message}`);
  console.error('\nPossible issues:');
  console.error('   1. Backend server is not running');
  console.error('   2. Port 5000 is blocked or in use by another process');
  console.error('   3. Firewall is blocking the connection\n');
  console.error('To start the backend server:');
  console.error('   cd Shilpohaat/backend');
  console.error('   npm start\n');
  process.exit(1);
});

healthReq.end();

function testRoot() {
  const rootOptions = {
    hostname: HOST,
    port: PORT,
    path: '/',
    method: 'GET'
  };
  
  const rootReq = http.request(rootOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Root Endpoint:');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Response: ${data}\n`);
      
      console.log('✅ Backend is running and accessible!');
      console.log(`   Server URL: http://${HOST}:${PORT}`);
      console.log(`   Health Check: http://${HOST}:${PORT}/api/health`);
      console.log(`   Socket.IO: ws://${HOST}:${PORT}\n`);
    });
  });
  
  rootReq.on('error', (error) => {
    console.error('❌ Root Endpoint Failed:');
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  });
  
  rootReq.end();
}
