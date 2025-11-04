const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/database');
const User = require('../models/User');

dotenv.config();

(async () => {
  try {
    await connectDB();
    const result = await User.updateMany(
      { role: 'customer', $or: [ { permissions: { $exists: false } }, { permissions: { $size: 0 } } ] },
      { $set: { permissions: [ { module: 'menu', actions: ['read'] }, { module: 'orders', actions: ['create', 'read'] } ] } }
    );
    console.log(`Updated customers: ${result.modifiedCount}`);
  } catch (err) {
    console.error('Patch error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();


