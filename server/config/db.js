const mongoose = require('mongoose');

/**
 * MongoDB database connection wrapper.
 * Gracefully handles missing URI during Phase 1 foundation setup.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('[Database] MONGODB_URI not provided in environment variables.');
    console.log('[Database] Phase 1 backend running in database-decoupled mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    // Don't crash process in dev mode if database connection fails, but log warning
  }
};

module.exports = connectDB;
