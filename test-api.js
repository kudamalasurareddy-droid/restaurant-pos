// Test API endpoints using native fetch (Node.js 18+)
// If using older Node.js, install node-fetch: npm install node-fetch

const API_BASE = process.env.API_BASE || 'http://localhost:10000/api';

// Use native fetch (Node.js 18+) or require node-fetch for older versions
let fetch;
try {
  // Try native fetch first (Node.js 18+)
  fetch = globalThis.fetch || require('node-fetch');
} catch (e) {
  console.error('❌ fetch is not available. Please install node-fetch:');
  console.error('   npm install node-fetch');
  console.error('   Or upgrade to Node.js 18+');
  process.exit(1);
}

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...');
    console.log(`📍 API Base: ${API_BASE}\n`);
    
    // Test health endpoint first
    console.log('1. Testing health endpoint...');
    try {
      const baseUrl = API_BASE.replace('/api', '');
      const healthRes = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthRes.json();
      console.log('✅ Health check:', JSON.stringify(healthData, null, 2));
    } catch (err) {
      console.error('❌ Health check failed:', err.message);
      console.error('   Make sure the backend server is running on port 10000');
      return;
    }
    
    // Test categories endpoint
    console.log('\n2. Testing categories endpoint...');
    try {
      const categoriesRes = await fetch(`${API_BASE}/menu/categories`);
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('✅ Categories response:', JSON.stringify(categoriesData, null, 2));
      } else {
        console.error(`❌ Categories endpoint returned status: ${categoriesRes.status}`);
        const errorText = await categoriesRes.text();
        console.error('   Error:', errorText);
      }
    } catch (err) {
      console.error('❌ Categories endpoint error:', err.message);
    }
    
    // Test menu items endpoint
    console.log('\n3. Testing menu items endpoint...');
    try {
      const menuRes = await fetch(`${API_BASE}/menu/items`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        console.log('✅ Menu items response:', JSON.stringify(menuData, null, 2));
      } else {
        console.error(`❌ Menu items endpoint returned status: ${menuRes.status}`);
        const errorText = await menuRes.text();
        console.error('   Error:', errorText);
      }
    } catch (err) {
      console.error('❌ Menu items endpoint error:', err.message);
    }
    
    // Test tables endpoint
    console.log('\n4. Testing tables endpoint...');
    try {
      const tablesRes = await fetch(`${API_BASE}/tables`);
      if (tablesRes.ok) {
        const tablesData = await tablesRes.json();
        console.log('✅ Tables response:', JSON.stringify(tablesData, null, 2));
      } else {
        console.error(`❌ Tables endpoint returned status: ${tablesRes.status}`);
        const errorText = await tablesRes.text();
        console.error('   Error:', errorText);
      }
    } catch (err) {
      console.error('❌ Tables endpoint error:', err.message);
    }
    
    console.log('\n✅ API testing completed!');
    
  } catch (error) {
    console.error('\n❌ API Test Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure backend server is running: cd backend && npm start');
    console.error('   2. Check if server is on port 10000 (or update API_BASE in test-api.js)');
    console.error('   3. Verify MongoDB connection is working');
  }
}

testAPI();




