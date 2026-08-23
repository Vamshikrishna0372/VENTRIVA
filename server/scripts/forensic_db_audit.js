const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function forensicDbAudit() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log(`EXACT_PHYSICAL_COLLECTION_COUNT: ${collections.length}`);
    console.log('--- COLLECTION DETAILS ---');

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`COLLECTION: ${col.name} | DOCS: ${count}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

forensicDbAudit();
