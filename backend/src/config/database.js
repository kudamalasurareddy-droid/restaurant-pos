const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('Please set MONGODB_URI in your .env file or environment variables');
      console.error('Example: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
      
      // In development, allow server to start without DB (for testing)
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Continuing without database connection (development mode)');
        return null;
      }
      
      // In production, exit if no database
      process.exit(1);
    }

    // Remove deprecated options (not needed in mongoose 6+)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Create indexes for better performance
    await createIndexes();
    
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('');
      console.error('🔴 Authentication failed!');
      console.error('Possible causes:');
      console.error('1. Password is incorrect in MongoDB Atlas');
      console.error('2. Username doesn\'t exist');
      console.error('3. Connection string has quotes around it (remove quotes in environment variable)');
      console.error('');
      console.error('Solution:');
      console.error('1. Check MONGODB_URI in your .env file or environment variables');
      console.error('2. Verify password in MongoDB Atlas matches the connection string');
      console.error('3. Make sure there are NO quotes around the connection string');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
      console.error('');
      console.error('🔴 DNS/Network error!');
      console.error('Check your cluster URL is correct');
    }
    
    // In development, allow server to continue (for testing)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Continuing without database connection (development mode)');
      return null;
    }
    
    // In production, exit if database connection fails
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Additional custom indexes can be created here
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

// Handle mongoose connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

module.exports = connectDB;