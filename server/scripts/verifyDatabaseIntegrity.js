const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');
const Deal = require('../models/Deal');
const Investment = require('../models/Investment');
const FundraisingRound = require('../models/FundraisingRound');
const InvestorCommitment = require('../models/InvestorCommitment');
const ClosingTransaction = require('../models/ClosingTransaction');

async function verifyDatabaseIntegrity() {
  console.log('=== VENTRIVA DATABASE INTEGRITY & FINANCIAL INVARIANT VERIFICATION ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✓ Connected to MongoDB Atlas (${mongoose.connection.name})\n`);

    // 1. Verify User Role Integrity
    const users = await User.find({}).lean();
    const invalidUsers = users.filter((u) => !['founder', 'investor', 'admin'].includes(u.role));
    assert(invalidUsers.length === 0, `User Role Integrity: All ${users.length} users have valid roles`);

    // 2. Verify Startup Founder Reference Integrity
    const startups = await Startup.find({}).lean();
    const invalidStartups = startups.filter((s) => !s.founder || !mongoose.Types.ObjectId.isValid(s.founder));
    assert(invalidStartups.length === 0, `Startup Founder Reference: All ${startups.length} startups have valid Founder ObjectIds`);

    // 3. Verify Financial Invariants on Investment Records
    const investments = await Investment.find({}).lean();
    const invalidInvestments = investments.filter(
      (inv) => inv.ownershipPercentage < 0 || inv.ownershipPercentage > 100 || inv.investmentAmount < 0 || isNaN(inv.investmentAmount)
    );
    assert(invalidInvestments.length === 0, `Investment Financial Invariants: All ${investments.length} investment records satisfy ownership & amount constraints`);

    // 4. Verify Fundraising Round Target Financial Constraints
    const rounds = await FundraisingRound.find({}).lean();
    const invalidRounds = rounds.filter((r) => r.targetAmount < 0 || isNaN(r.targetAmount));
    assert(invalidRounds.length === 0, `Fundraising Round Invariants: All ${rounds.length} rounds satisfy financial constraints`);

    // 5. Verify Closing Transactions Status & Amount Constraints
    const closings = await ClosingTransaction.find({}).lean();
    const invalidClosings = closings.filter((c) => c.finalInvestmentAmount < 0 || isNaN(c.finalInvestmentAmount));
    assert(invalidClosings.length === 0, `Closing Transaction Invariants: All ${closings.length} transactions satisfy financial constraints`);

    console.log(`\n========================================`);
    console.log(`DATABASE INTEGRITY VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

verifyDatabaseIntegrity();
