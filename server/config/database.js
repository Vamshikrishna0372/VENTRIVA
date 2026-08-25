const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Force IPv4 result order to prevent Windows dual-stack IPv6 DNS resolution timeouts
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  const options = {
    family: 4,
    serverSelectionTimeoutMS: 10000,
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
    if (error.message.includes('whitelisted') || error.message.includes('ETIMEDOUT') || error.message.includes('selection timed out')) {
      console.warn('[Database Notice] If using MongoDB Atlas, verify your local IP address is allowed in Atlas Network Access settings (0.0.0.0/0).');
    }
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
