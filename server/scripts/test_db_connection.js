const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function testConnection() {
  console.log('=== TESTING REAL MONGODB ATLAS CONNECTION ===\n');
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI not found in process.env');
    process.exit(1);
  }

  try {
    const redactedURI = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`Connecting to URI: ${redactedURI}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✓ SUCCESS: Connected to MongoDB Host: ${conn.connection.host}`);
    console.log(`✓ Database Name: ${conn.connection.name}`);
    console.log(`✓ ReadyState: ${conn.connection.readyState} (1 = connected)`);

    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`✓ Active Collections in database: ${collections.length}`);
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });

    await mongoose.connection.close();
    console.log('\n[Database] Connection closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error(`✗ FAIL: Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

testConnection();
