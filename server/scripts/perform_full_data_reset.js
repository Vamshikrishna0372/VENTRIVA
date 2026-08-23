const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TARGET_50_COLLECTIONS = [
  'activitylogs',
  'adminauditlogs',
  'availabilities',
  'boardmeetings',
  'boardmembers',
  'boardresolutions',
  'captablesnapshots',
  'capitalallocationplans',
  'closingconditions',
  'closingtransactions',
  'complianceitems',
  'conversations',
  'corporateactions',
  'deals',
  'documents',
  'documentrequests',
  'duediligencechecklists',
  'equitypools',
  'evaluations',
  'exitevents',
  'followoninvestments',
  'fundraisinginvites',
  'fundraisingrounds',
  'governancerights',
  'governancevotes',
  'investments',
  'investmentdecisions',
  'investorcommitments',
  'investorinterests',
  'investorstrategies',
  'legaldocuments',
  'meetings',
  'messages',
  'moderationflags',
  'notifications',
  'ownershipevents',
  'paymentrecords',
  'pipelineentries',
  'portfolioperformances',
  'portfolioscenarios',
  'portfolioupdates',
  'sharetransfers',
  'shareholders',
  'shareholdings',
  'shortlists',
  'signaturerecords',
  'startups',
  'teammembers',
  'termsheets',
  'users',
];

async function executeRealDatabaseReset() {
  console.log('====================================================');
  console.log('  VENTRIVA REAL MONGODB ATLAS DATABASE DATA RESET   ');
  console.log('====================================================\n');

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing in .env');

  console.log(`📍 Connection URI Host: ${uri.replace(/:([^@]+)@/, ':****@')}`);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log(`📍 Connected Database: "${db.databaseName}"`);
  console.log(`📍 Environment: "${process.env.NODE_ENV || 'development'}"\n`);

  // 1. Scan current collections
  const collections = await db.listCollections().toArray();
  console.log(`--- PRE-RESET MONGODB COLLECTION SCAN (${collections.length} collections) ---`);
  
  let preDocsTotal = 0;
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    preDocsTotal += count;
    if (count > 0) {
      console.log(`  - Collection "${col.name}": ${count} document(s)`);
    }
  }
  console.log(`Pre-Reset Total Documents Across All Collections: ${preDocsTotal}\n`);

  // 2. Drop obsolete collections not in TARGET_50_COLLECTIONS
  console.log('--- DROPPING OBSOLETE COLLECTION NAMESPACES ---');
  for (const col of collections) {
    if (!TARGET_50_COLLECTIONS.includes(col.name)) {
      await db.collection(col.name).drop().catch(() => {});
      console.log(`  ✓ Dropped obsolete collection namespace: "${col.name}"`);
    }
  }

  // 3. Clear all documents in 49 business collections
  console.log('\n--- CLEARING ALL BUSINESS APPLICATION DATA ---');
  for (const colName of TARGET_50_COLLECTIONS) {
    if (colName !== 'users') {
      const col = db.collection(colName);
      await col.deleteMany({});
    }
  }
  console.log('  ✓ Cleared 49 business collections to 0 documents');

  // 4. Reset Users collection to EXACTLY 3 clean accounts
  console.log('\n--- RESETTING USER ACCOUNTS TO CLEAN BASELINE ---');
  const User = require('../models/User');
  await User.deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });

  // Ensure Admin
  let admin = await User.findOne({ email: 'admin@ventriva.com' });
  if (!admin) {
    admin = await User.create({
      name: 'System Administrator',
      email: 'admin@ventriva.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });
    console.log('  ✓ Created clean Admin account (admin@ventriva.com)');
  } else {
    admin.password = 'admin123';
    admin.isVerified = true;
    admin.isActive = true;
    await admin.save();
    console.log('  ✓ Reset existing Admin account (admin@ventriva.com)');
  }

  // Ensure Founder
  let founder = await User.findOne({ email: 'founder@ventriva.com' });
  if (!founder) {
    founder = await User.create({
      name: 'Demo Founder',
      email: 'founder@ventriva.com',
      password: 'founder123',
      role: 'founder',
      isVerified: true,
      isActive: true,
    });
    console.log('  ✓ Created clean Founder account (founder@ventriva.com)');
  } else {
    founder.password = 'founder123';
    founder.isVerified = true;
    founder.isActive = true;
    await founder.save();
    console.log('  ✓ Reset existing Founder account (founder@ventriva.com)');
  }

  // Ensure Investor
  let investor = await User.findOne({ email: 'investor@ventriva.com' });
  if (!investor) {
    investor = await User.create({
      name: 'Demo Investor',
      email: 'investor@ventriva.com',
      password: 'investor123',
      role: 'investor',
      isVerified: true,
      isActive: true,
    });
    console.log('  ✓ Created clean Investor account (investor@ventriva.com)');
  } else {
    investor.password = 'investor123';
    investor.isVerified = true;
    investor.isActive = true;
    await investor.save();
    console.log('  ✓ Reset existing Investor account (investor@ventriva.com)');
  }

  // 5. Final Verification Scan
  const finalCols = await db.listCollections().toArray();
  let postDocsTotal = 0;
  let nonZeroCount = 0;
  console.log(`\n--- POST-RESET VERIFICATION INVENTORY (${finalCols.length} collections) ---`);
  for (const col of finalCols) {
    const count = await db.collection(col.name).countDocuments();
    postDocsTotal += count;
    if (count > 0) {
      nonZeroCount++;
      console.log(`  - "${col.name}": ${count} document(s)`);
    }
  }

  console.log(`\nPost-Reset Total Documents: ${postDocsTotal}`);
  console.log(`User Count: ${await User.countDocuments()}`);
  console.log(`Non-Empty Collections: ${nonZeroCount} (Only "users")`);

  if (postDocsTotal === 3 && (await User.countDocuments()) === 3) {
    console.log('\n✨ DATABASE SUCCESSFULLY RESET TO CLEAN EMPTY STATE (3 USERS, 0 BUSINESS RECORDS)! ✨');
  } else {
    console.error(`\n⚠️ Warning: Post-reset document count is ${postDocsTotal} (expected 3)`);
  }

  console.log('====================================================\n');
  await mongoose.connection.close();
}

executeRealDatabaseReset().catch(console.error);
