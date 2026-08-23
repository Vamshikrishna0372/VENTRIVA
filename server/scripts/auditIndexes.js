const mongoose = require('mongoose');
const env = require('../config/env');

async function auditIndexes() {
  console.log('=== VENTRIVA DATABASE INDEX AUDIT ===');
  try {
    await mongoose.connect(env.MONGODB_URI);
    const collections = await mongoose.connection.db.listCollections().toArray();

    for (const col of collections) {
      const indexes = await mongoose.connection.db.collection(col.name).indexes();
      console.log(`Collection [${col.name}]: ${indexes.length} index(es) defined`);
      indexes.forEach((idx) => {
        console.log(`  - Index: ${idx.name} | Fields: ${JSON.stringify(idx.key)}`);
      });
    }

    console.log('\n✓ Index Audit Completed Successfully.');
  } catch (err) {
    console.error('Index Audit Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  auditIndexes();
}

module.exports = auditIndexes;
