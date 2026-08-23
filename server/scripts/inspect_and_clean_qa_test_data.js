const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import Mongoose Models
const User = require('../models/User');
const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');
const PipelineEntry = require('../models/PipelineEntry');
const Deal = require('../models/Deal');
const TermSheet = require('../models/TermSheet');
const FundraisingRound = require('../models/FundraisingRound');
const InvestorCommitment = require('../models/InvestorCommitment');
const ClosingTransaction = require('../models/ClosingTransaction');
const Investment = require('../models/Investment');
const CapTableSnapshot = require('../models/CapTableSnapshot');
const Shareholder = require('../models/Shareholder');
const BoardMember = require('../models/BoardMember');
const BoardResolution = require('../models/BoardResolution');
const ComplianceItem = require('../models/ComplianceItem');
const GovernanceActivity = require('../models/GovernanceActivity');
const AdminAuditLog = require('../models/AdminAuditLog');
const ModerationFlag = require('../models/ModerationFlag');

async function cleanQATestData() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not defined.');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`[Database] Connected to MongoDB Atlas (${mongoose.connection.name})\n`);

    // Clean all AdminAuditLog entries referencing test user emails or descriptions
    const delAudit = await AdminAuditLog.deleteMany({
      $or: [
        { description: { $regex: /ventriva-live\.com/i } },
        { description: { $regex: /ventriva-test\.com/i } },
        { description: { $regex: /ventriva\.org/i } },
        { description: { $regex: /1787/ } },
        { description: { $regex: /founder_/i } },
        { description: { $regex: /investor_/i } },
      ],
    });
    console.log(`✓ Deleted ${delAudit.deletedCount} test/QA AdminAuditLog entries.`);

    // Clean test user accounts created during automated test runs
    const delTestUsers = await User.deleteMany({
      $or: [
        { email: { $regex: /ventriva-live\.com/i } },
        { email: { $regex: /ventriva-test\.com/i } },
        { email: { $regex: /ventriva\.org/i } },
        { email: { $regex: /test_founder_/i } },
        { email: { $regex: /test_investor_/i } },
      ],
      email: { $ne: 'admin@ventriva.com' },
    });
    console.log(`✓ Deleted ${delTestUsers.deletedCount} test user accounts.`);

    // Ensure System Administrator exists
    let admin = await User.findOne({ email: 'admin@ventriva.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@ventriva.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isVerified: true,
      });
      console.log('✓ Created fresh System Administrator: admin@ventriva.com / admin123');
    } else {
      admin.name = 'System Administrator';
      admin.password = 'admin123';
      admin.role = 'admin';
      admin.isActive = true;
      admin.isVerified = true;
      await admin.save();
      console.log('✓ Verified System Administrator: admin@ventriva.com / admin123');
    }

    console.log('\n=== AFTER CLEANUP DB COUNTS ===');
    const countsAfter = {
      users: await User.countDocuments(),
      startups: await Startup.countDocuments(),
      evaluations: await Evaluation.countDocuments(),
      pipelineEntries: await PipelineEntry.countDocuments(),
      deals: await Deal.countDocuments(),
      termSheets: await TermSheet.countDocuments(),
      fundraisingRounds: await FundraisingRound.countDocuments(),
      investorCommitments: await InvestorCommitment.countDocuments(),
      closingTransactions: await ClosingTransaction.countDocuments(),
      investments: await Investment.countDocuments(),
      adminAuditLogs: await AdminAuditLog.countDocuments(),
      governanceActivities: await GovernanceActivity.countDocuments(),
      moderationFlags: await ModerationFlag.countDocuments(),
    };
    console.log(JSON.stringify(countsAfter, null, 2));

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`✗ Error cleaning QA data: ${err.message}`);
    process.exit(1);
  }
}

cleanQATestData();
