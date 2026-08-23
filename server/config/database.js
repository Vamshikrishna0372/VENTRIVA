const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, options);
    isConnected = true;

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB connection lost. Reconnecting...');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB connection re-established.');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database Error]', err.message);
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('[Database] MongoDB connection closed cleanly.');
  }
};

const getDBState = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    stateName: states[stateCode] || 'unknown',
    isConnected: stateCode === 1,
  };
};

module.exports = {
  connectDB,
  disconnectDB,
  getDBState,
};
