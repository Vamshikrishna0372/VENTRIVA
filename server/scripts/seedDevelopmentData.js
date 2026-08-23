const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Startup = require('../models/Startup');
const Evaluation = require('../models/Evaluation');
const Deal = require('../models/Deal');
const TermSheet = require('../models/TermSheet');
const FundraisingRound = require('../models/FundraisingRound');
const InvestorCommitment = require('../models/InvestorCommitment');
const ClosingTransaction = require('../models/ClosingTransaction');
const Investment = require('../models/Investment');
const CapTableSnapshot = require('../models/CapTableSnapshot');
const BoardMember = require('../models/BoardMember');
const ComplianceItem = require('../models/ComplianceItem');
const GovernanceActivity = require('../models/GovernanceActivity');

async function seedDevelopmentData() {
  console.log('=== SEEDING INTERCONNECTED DEVELOPMENT TEST RECORDS ===\n');

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not found');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✓ Connected to MongoDB Atlas (${mongoose.connection.name})\n`);

    const timestamp = Date.now();

    // 1. Create Dev Founder & Investor
    const founder = await User.create({
      name: `Dev Founder ${timestamp}`,
      email: `dev_founder_${timestamp}@ventriva.org`,
      password: 'DevPassword123!',
      role: 'founder',
    });

    const investor = await User.create({
      name: `Dev Investor ${timestamp}`,
      email: `dev_investor_${timestamp}@ventriva.org`,
      password: 'DevPassword123!',
      role: 'investor',
    });

    // 2. Create Dev Startup
    const startup = await Startup.create({
      startupName: `DevVentures AI ${timestamp}`,
      tagline: 'Enterprise Autonomous Intelligence Engine',
      description: 'Next-generation AI orchestration for corporate software teams',
      foundedYear: 2024,
      businessModel: 'B2B',
      sector: 'AI / Machine Learning',
      stage: 'Seed',
      founder: founder._id,
      valuation: 10000000,
      targetRaise: 2500000,
      status: 'Published',
    });

    // 3. Create Dev Evaluation
    const evaluation = await Evaluation.create({
      investor: investor._id,
      startup: startup._id,
      scores: { market: 9, team: 10, product: 9, traction: 8 },
      overallScore: 9.0,
      convictionLevel: 'High',
      recommendation: 'Strong Buy',
      notes: 'Outstanding technical founder team and product execution.',
    });

    // 4. Create Dev Deal & Term Sheet
    const deal = await Deal.create({
      startup: startup._id,
      investor: investor._id,
      founder: founder._id,
      stage: 'Term Sheet Negotiating',
      status: 'Active',
    });

    const termSheet = await TermSheet.create({
      deal: deal._id,
      startup: startup._id,
      investor: investor._id,
      founder: founder._id,
      proposedBy: investor._id,
      investmentAmount: 2500000,
      preMoneyValuation: 10000000,
      postMoneyValuation: 12500000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      version: 1,
      status: 'Accepted',
    });

    // 5. Create Dev Fundraising Round & Commitment
    const round = await FundraisingRound.create({
      startup: startup._id,
      founder: founder._id,
      createdBy: founder._id,
      roundName: 'Seed Round 2026',
      roundType: 'Seed',
      targetAmount: 2500000,
      preMoneyValuation: 10000000,
      committedAmount: 2500000,
      status: 'Closed',
    });

    const commitment = await InvestorCommitment.create({
      fundraisingRound: round._id,
      round: round._id,
      startup: startup._id,
      investor: investor._id,
      founder: founder._id,
      createdBy: investor._id,
      committedAmount: 2500000,
      commitmentAmount: 2500000,
      status: 'Funded',
    });

    // 6. Create Closing Transaction, Investment, Cap Table Snapshot & Governance Records
    const closingTx = await ClosingTransaction.create({
      startup: startup._id,
      founder: founder._id,
      investor: investor._id,
      createdBy: founder._id,
      commitment: commitment._id,
      transactionType: 'Priced Equity Round',
      finalInvestmentAmount: 2500000,
      investmentAmount: 2500000,
      preMoneyValuation: 10000000,
      postMoneyValuation: 12500000,
      sharesIssued: 2500000,
      sharePrice: 1.0,
      transactionStatus: 'Closed',
    });

    const investment = await Investment.create({
      startup: startup._id,
      investor: investor._id,
      founder: founder._id,
      investmentAmount: 2500000,
      amountInvested: 2500000,
      ownershipPercentage: 20.0,
      sharesOwned: 2500000,
      investmentStatus: 'Active',
    });

    const capTable = await CapTableSnapshot.create({
      startup: startup._id,
      createdBy: founder._id,
      snapshotReason: 'Seed Round Investment Closure',
      totalSharesBefore: 10000000,
      totalSharesAfter: 12500000,
      totalShares: 12500000,
      founderOwnershipPercentage: 80.0,
      investorOwnershipPercentage: 20.0,
      holdingsSnapshot: [
        { holderName: founder.name, holderType: 'Founder', sharesOwned: 10000000, ownershipPercentage: 80.0 },
        { holderName: investor.name, holderType: 'Investor', sharesOwned: 2500000, ownershipPercentage: 20.0 },
      ],
    });

    const boardMember = await BoardMember.create({
      startup: startup._id,
      user: investor._id,
      role: 'Investor Director',
      status: 'Active',
      votingPower: 1,
    });

    const governanceActivity = await GovernanceActivity.create({
      startup: startup._id,
      actor: founder._id,
      eventType: 'BOARD_APPOINTED',
      entityType: 'BoardMember',
      entityId: boardMember._id,
      description: `Appointed ${investor.name} to Board of Directors`,
    });

    console.log(`✅ Development Seed Completed Successfully!`);
    console.log(`👤 Founder: ${founder.email}`);
    console.log(`👤 Investor: ${investor.email}`);
    console.log(`🚀 Startup: ${startup.startupName}`);
    console.log(`💼 Investment: $${investment.investmentAmount.toLocaleString()} (20% Equity)`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

seedDevelopmentData();
