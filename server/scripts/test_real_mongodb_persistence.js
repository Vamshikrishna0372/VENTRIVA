const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Import key Mongoose models
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

async function testRealMongoPersistence() {
  console.log('=== VERIFYING REAL MONGODB ATLAS PERSISTENCE & DATA PIPELINE ===\n');

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
    console.log(`[Database] Connected to MongoDB Atlas (${mongoose.connection.name})`);

    // 1. Create real Founder & Investor Users in Atlas
    const timestamp = Date.now();
    const founderUser = await User.create({
      name: `Atlas Founder ${timestamp}`,
      email: `founder_${timestamp}@ventriva-live.com`,
      password: 'SecurePassword123!',
      role: 'founder',
    });
    assert(founderUser._id && founderUser.role === 'founder', 'MongoDB Persistence: Founder User created and saved');

    const investorUser = await User.create({
      name: `Atlas Investor ${timestamp}`,
      email: `investor_${timestamp}@ventriva-live.com`,
      password: 'SecurePassword123!',
      role: 'investor',
    });
    assert(investorUser._id && investorUser.role === 'investor', 'MongoDB Persistence: Investor User created and saved');

    // 2. Create real Startup in Atlas
    const startup = await Startup.create({
      startupName: `Ventriva AI Labs ${timestamp}`,
      tagline: 'Autonomous AI Coding Engine',
      description: 'Next-gen enterprise AI developer automation',
      foundedYear: 2024,
      businessModel: 'B2B',
      sector: 'AI / Machine Learning',
      stage: 'Seed',
      founder: founderUser._id,
      valuation: 8000000,
      targetRaise: 2000000,
      status: 'Published',
    });
    assert(startup._id && startup.startupName.includes('Ventriva AI Labs'), 'MongoDB Persistence: Startup created and saved');

    // 3. Create real Evaluation in Atlas
    const evaluation = await Evaluation.create({
      investor: investorUser._id,
      startup: startup._id,
      scores: { market: 9, team: 9, product: 10, traction: 8 },
      overallScore: 9.0,
      convictionLevel: 'High',
      recommendation: 'Strong Buy',
      notes: 'Exceptional technical execution and market alignment.',
    });
    assert(evaluation._id && evaluation.overallScore === 9.0, 'MongoDB Persistence: Evaluation record created and saved');

    // 4. Create real Deal & Term Sheet in Atlas
    const deal = await Deal.create({
      startup: startup._id,
      investor: investorUser._id,
      founder: founderUser._id,
      stage: 'Term Sheet Negotiating',
      status: 'Active',
    });
    assert(deal._id, 'MongoDB Persistence: Deal created and saved');

    const termSheet = await TermSheet.create({
      deal: deal._id,
      startup: startup._id,
      investor: investorUser._id,
      founder: founderUser._id,
      proposedBy: investorUser._id,
      investmentAmount: 2000000,
      preMoneyValuation: 8000000,
      postMoneyValuation: 10000000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      version: 1,
      status: 'Accepted',
    });
    assert(termSheet._id && termSheet.status === 'Accepted', 'MongoDB Persistence: Term Sheet created and saved');

    // 5. Create real Fundraising Round & Commitment in Atlas
    const round = await FundraisingRound.create({
      startup: startup._id,
      founder: founderUser._id,
      createdBy: founderUser._id,
      roundName: 'Seed Round 2026',
      roundType: 'Seed',
      targetAmount: 2000000,
      preMoneyValuation: 8000000,
      committedAmount: 2000000,
      status: 'Closed',
    });
    assert(round._id && round.committedAmount === 2000000, 'MongoDB Persistence: Fundraising Round created and saved');

    const commitment = await InvestorCommitment.create({
      fundraisingRound: round._id,
      round: round._id,
      startup: startup._id,
      investor: investorUser._id,
      founder: founderUser._id,
      createdBy: investorUser._id,
      committedAmount: 2000000,
      commitmentAmount: 2000000,
      status: 'Funded',
    });
    assert(commitment._id && commitment.committedAmount === 2000000, 'MongoDB Persistence: Investor Commitment created and saved');

    // 6. Create real Investment Closing Transaction in Atlas
    const closingTx = await ClosingTransaction.create({
      startup: startup._id,
      founder: founderUser._id,
      investor: investorUser._id,
      createdBy: founderUser._id,
      commitment: commitment._id,
      transactionType: 'Priced Equity Round',
      finalInvestmentAmount: 2000000,
      investmentAmount: 2000000,
      preMoneyValuation: 8000000,
      postMoneyValuation: 10000000,
      sharesIssued: 2500000,
      sharePrice: 0.8,
      transactionStatus: 'Closed',
    });
    assert(closingTx._id && closingTx.transactionStatus === 'Closed', 'MongoDB Persistence: Closing Transaction created and saved');

    // 7. Create real Investment & Cap Table Snapshot in Atlas
    const investment = await Investment.create({
      startup: startup._id,
      investor: investorUser._id,
      founder: founderUser._id,
      investmentAmount: 2000000,
      amountInvested: 2000000,
      ownershipPercentage: 20.0,
      sharesOwned: 2500000,
      investmentStatus: 'Active',
    });
    assert(investment._id && investment.ownershipPercentage === 20.0, 'MongoDB Persistence: Investment record created and saved');

    const snapshot = await CapTableSnapshot.create({
      startup: startup._id,
      createdBy: founderUser._id,
      snapshotReason: 'Investment Closing - Seed Round',
      totalSharesBefore: 10000000,
      totalSharesAfter: 12500000,
      totalShares: 12500000,
      founderOwnershipPercentage: 80.0,
      investorOwnershipPercentage: 20.0,
      holdingsSnapshot: [
        { holderName: founderUser.name, holderType: 'Founder', sharesOwned: 10000000, ownershipPercentage: 80.0 },
        { holderName: investorUser.name, holderType: 'Investor', sharesOwned: 2500000, ownershipPercentage: 20.0 },
      ],
    });
    assert(snapshot._id && snapshot.totalSharesAfter === 12500000, 'MongoDB Persistence: Cap Table Snapshot created and saved');

    // 8. Create real Corporate Governance entities in Atlas
    const boardMember = await BoardMember.create({
      startup: startup._id,
      user: investorUser._id,
      role: 'Investor Director',
      status: 'Active',
      votingPower: 1,
    });
    assert(boardMember._id && boardMember.role === 'Investor Director', 'MongoDB Persistence: Board Member appointed and saved');

    const complianceItem = await ComplianceItem.create({
      startup: startup._id,
      category: 'Corporate',
      title: 'Annual Shareholder Meeting Minutes',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      priority: 'High',
      status: 'Pending',
    });
    assert(complianceItem._id && complianceItem.status === 'Pending', 'MongoDB Persistence: Compliance Item created and saved');

    const activity = await GovernanceActivity.create({
      startup: startup._id,
      actor: founderUser._id,
      eventType: 'BOARD_APPOINTED',
      entityType: 'BoardMember',
      entityId: boardMember._id,
      description: `Appointed ${investorUser.name} as Investor Director on Board of Directors`,
    });
    assert(activity._id, 'MongoDB Persistence: Governance Audit Activity created and saved');

    // Query list of collections in Atlas
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n✓ Active Collections created in Atlas database: ${collections.length}`);
    collections.forEach((c) => console.log(`  - ${c.name}`));

    console.log(`\n========================================`);
    console.log(`REAL MONGODB PERSISTENCE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

testRealMongoPersistence();
