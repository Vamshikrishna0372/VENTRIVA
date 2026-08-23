const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/database');

async function resetDatabase() {
  console.log('====================================================');
  console.log('    VENTRIVA DEVELOPMENT DATABASE COMPLETE RESET    ');
  console.log('====================================================\n');

  await connectDB();
  const db = mongoose.connection.db;
  console.log(`📍 Connected Database Name: "${db.databaseName}"`);
  console.log(`📍 Environment: "${process.env.NODE_ENV || 'development'}"\n`);

  // 1. Fetch collection list & document counts before deletion
  const collections = await db.listCollections().toArray();
  console.log(`--- PRE-RESET COLLECTION INVENTORY (${collections.length} collections found) ---`);

  const countsBefore = {};
  let totalDocsBefore = 0;

  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    countsBefore[col.name] = count;
    totalDocsBefore += count;
    console.log(`  - Collection "${col.name}": ${count} document(s)`);
  }

  console.log(`\nTotal Pre-Reset Documents: ${totalDocsBefore}`);

  // 2. Clear all documents in all collections
  console.log('\n--- CLEARING ALL APPLICATION DATA ---');
  for (const col of collections) {
    await db.collection(col.name).deleteMany({});
    console.log(`  ✓ Cleared all documents in "${col.name}"`);
  }

  // 3. Verify post-reset document counts
  console.log('\n--- POST-RESET VERIFICATION ---');
  let totalDocsAfter = 0;
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    totalDocsAfter += count;
  }

  console.log(`Total Post-Reset Documents: ${totalDocsAfter}`);
  if (totalDocsAfter === 0) {
    console.log('\n✨ DATABASE SUCCESSFULLY RESET TO CLEAN EMPTY STATE! ✨');
  } else {
    console.error(`\n⚠️ Warning: ${totalDocsAfter} documents remain!`);
  }

  console.log('====================================================\n');
  await disconnectDB();
}

resetDatabase().catch(console.error);
