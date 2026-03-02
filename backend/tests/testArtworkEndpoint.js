async function testEndpoint() {
  try {
    const artistId = '6919ddb7f84d61379612c5b9';
    const url = `http://localhost:5000/api/artworks/artist/${artistId}`;
    
    console.log('Testing endpoint:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\n=== Response Status ===');
    console.log('Status:', response.status);
    
    console.log('\n=== Response Data ===');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.artworks) {
      console.log('\n=== Artworks Count ===');
      console.log('Total:', data.artworks.length);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEndpoint();
