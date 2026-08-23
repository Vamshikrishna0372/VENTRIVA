const mongoose = require('mongoose');
const env = require('../config/env');
const Startup = require('../models/Startup');
const User = require('../models/User');

async function auditDataIntegrity() {
  console.log('=== VENTRIVA DATA INTEGRITY AUDIT ===');
  let issuesCount = 0;

  try {
    await mongoose.connect(env.MONGODB_URI);

    // Audit 1: Orphaned Startups without valid founder
    const startups = await Startup.find({}).select('founder startupName').lean();
    for (const s of startups) {
      const founderExists = await User.exists({ _id: s.founder });
      if (!founderExists) {
        console.warn(`[Integrity Issue] Orphaned Startup [${s.startupName}] with missing Founder ID [${s.founder}]`);
        issuesCount += 1;
      }
    }

    console.log(`\nData Integrity Audit Summary: ${issuesCount} issue(s) detected.`);
  } catch (err) {
    console.error('Data Integrity Audit Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

if (require.main === module) {
  auditDataIntegrity();
}

module.exports = auditDataIntegrity;
