const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test categories endpoint
    console.log('1. Testing categories endpoint...');
    const categoriesRes = await axios.get(`${API_BASE}/menu/categories`);
    console.log('Categories response:', JSON.stringify(categoriesRes.data, null, 2));
    
    // Test menu items endpoint
    console.log('\n2. Testing menu items endpoint...');
    const menuRes = await axios.get(`${API_BASE}/menu/items`);
    console.log('Menu items response:', JSON.stringify(menuRes.data, null, 2));
    
    // Test tables endpoint
    console.log('\n3. Testing tables endpoint...');
    const tablesRes = await axios.get(`${API_BASE}/tables`);
    console.log('Tables response:', JSON.stringify(tablesRes.data, null, 2));
    
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
  }
}

testAPI();




