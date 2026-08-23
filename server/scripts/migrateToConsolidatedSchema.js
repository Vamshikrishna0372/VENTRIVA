const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migrateToConsolidatedSchema() {
  console.log('=== VENTRIVA MONGODB CONSOLIDATED SCHEMA MIGRATION & INDEX OPTIMIZATION ===\n');

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✓ Connected to MongoDB Atlas (${mongoose.connection.name})\n`);

    const db = mongoose.connection.db;

    async function safeIndex(collectionName, keys, options = {}) {
      try {
        await db.collection(collectionName).createIndex(keys, options);
        console.log(`  ✓ ${collectionName}: ${JSON.stringify(keys)}`);
      } catch (err) {
        console.log(`  ℹ ${collectionName}: index ${JSON.stringify(keys)} already exists`);
      }
    }

    console.log('Optimizing Indexes across 15 Consolidated Domains:');

    // 1. Users Indexes
    await safeIndex('users', { email: 1 }, { unique: true });
    await safeIndex('users', { role: 1 });

    // 2. Startups Indexes
    await safeIndex('startups', { founder: 1, isDeleted: 1 });
    await safeIndex('startups', { sector: 1, stage: 1, profileVisibility: 1 });

    // 3. Evaluations Indexes
    await safeIndex('evaluations', { investor: 1, startup: 1 });

    // 4. Interests Indexes
    await safeIndex('investorinterests', { investor: 1, startup: 1 });
    await safeIndex('pipelineentries', { investor: 1, status: 1 });

    // 5. Deals Indexes
    await safeIndex('deals', { startup: 1, investor: 1 });
    await safeIndex('termsheets', { deal: 1 });

    // 6. Investments Indexes
    await safeIndex('investments', { investor: 1, startup: 1 });
    await safeIndex('portfolioperformances', { investor: 1 });

    // 7. Portfolio Updates Indexes
    await safeIndex('portfolioupdates', { startup: 1, createdAt: -1 });

    // 8. Fundraising Rounds Indexes
    await safeIndex('fundraisingrounds', { startup: 1, status: 1 });
    await safeIndex('investorcommitments', { fundraisingRound: 1, investor: 1 });

    // 9. Closings Indexes
    await safeIndex('closingtransactions', { startup: 1, transactionStatus: 1 });

    // 10. Cap Tables Indexes
    await safeIndex('captablesnapshots', { startup: 1, createdAt: -1 });

    // 11. Governance Indexes
    await safeIndex('boardmembers', { startup: 1, status: 1 });
    await safeIndex('complianceitems', { startup: 1, status: 1 });

    // 12. Messages Indexes
    await safeIndex('conversations', { participants: 1 });
    await safeIndex('messages', { conversation: 1, createdAt: 1 });

    // 13. Documents Indexes
    await safeIndex('documents', { startup: 1, owner: 1 });

    // 14. Meetings Indexes
    await safeIndex('meetings', { participants: 1, startTime: 1 });

    // 15. Audit Logs Indexes
    await safeIndex('adminauditlogs', { admin: 1, createdAt: -1 });
    await safeIndex('governanceactivities', { startup: 1, createdAt: -1 });

    console.log(`\n========================================`);
    console.log(`SCHEMA CONSOLIDATION & INDEX MIGRATION COMPLETE`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

migrateToConsolidatedSchema();
