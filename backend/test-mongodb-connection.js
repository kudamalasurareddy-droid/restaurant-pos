// Test MongoDB Connection String
// Run: node test-mongodb-connection.js

const mongoose = require('mongoose');

// Test connection string - UPDATE THIS with your actual connection string
const connectionString = process.env.MONGODB_URI || 
  'mongodb+srv://kudamalasurareddy_db_user:RestaurantPOS2024@cluster0.jn1bkky.mongodb.net/restaurant_pos_db?retryWrites=true&w=majority';

console.log('🔍 Testing MongoDB Connection...');
console.log('Connection String:', connectionString.replace(/:[^:@]+@/, ':****@')); // Hide password
console.log('');

// Test connection (removed deprecated options for mongoose 6+)
mongoose.connect(connectionString)
  .then(() => {
    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log('📍 Host:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Ready State:', mongoose.connection.readyState);
    console.log('');
    
    // Test a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database ping successful!');
    console.log('🎉 Connection is working correctly!');
    process.exit(0);
  })
  .catch(err => {
    console.error('');
    console.error('❌ ERROR:', err.message);
    console.error('');
    
    if (err.message.includes('bad auth')) {
      console.error('🔴 Authentication failed!');
      console.error('');
      console.error('Possible causes:');
      console.error('1. Password is incorrect in MongoDB Atlas');
      console.error('2. Username doesn\'t exist');
      console.error('3. Password needs URL encoding (if it has special characters)');
      console.error('');
      console.error('Solution:');
      console.error('1. Go to MongoDB Atlas → Database Access');
      console.error('2. Find user: kudamalasurareddy_db_user');
      console.error('3. Click Edit → Edit Password');
      console.error('4. Set new password: RestaurantPOS2024');
      console.error('5. Update connection string with new password');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('DNS')) {
      console.error('🔴 DNS/Network error!');
      console.error('Check your cluster URL is correct');
    } else {
      console.error('Full error:', err);
    }
    
    process.exit(1);
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.error('⏱️ Connection timeout');
  process.exit(1);
}, 10000);

