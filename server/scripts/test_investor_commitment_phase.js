const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testInvestorCommitmentPhase() {
  console.log('================================================================');
  console.log(' VENTRIVA PHASE: INVESTOR COMMITMENT & INVESTMENT FLOW AUDIT ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function record(name, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ PASS: ${name}`);
    } else {
      console.error(`✗ FAIL: ${name} (${detail})`);
    }
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✓ Connected to MongoDB Atlas');

    // 1. Authentication
    const founderRes = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
    const founderToken = founderRes.data.token;
    record('Founder Login (founder@ventriva.com)', founderRes.status === 200 && !!founderToken);

    const investorRes = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
    const investorToken = investorRes.data.token;
    record('Investor Login (investor@ventriva.com)', investorRes.status === 200 && !!investorToken);

    // 2. Founder Startup & Active Round Setup
    const myStartupRes = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${founderToken}` } });
    const startup = myStartupRes.data.startup;
    record('Founder Startup Retrieved (VentrivaPay)', myStartupRes.status === 200 && !!startup);

    const startupId = (startup._id || startup.id).toString();

    // Clean any old test rounds
    await db.collection('fundraisingrounds').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('investorcommitments').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });

    // Founder creates $2M Seed round
    const roundCreateRes = await axios.post(
      `${API_BASE}/fundraising-rounds`,
      {
        startupId,
        roundName: 'Seed Round 2026',
        roundType: 'Seed',
        targetAmount: 2000000,
        minimumAmount: 500000,
        maximumAmount: 2500000,
        preMoneyValuation: 8000000,
        minimumTicketSize: 25000,
        currency: 'USD',
        description: 'VentrivaPay FinTech Seed Round',
        useOfFunds: 'Product Engineering & Regulatory Compliance',
        isPublic: true,
      },
      { headers: { Authorization: `Bearer ${founderToken}` } }
    );
    const roundObj = roundCreateRes.data.round || roundCreateRes.data.data;
    const roundId = (roundObj._id || roundObj.id).toString();
    record('Founder Created $2M Seed Round', roundCreateRes.status === 201 || roundCreateRes.status === 200);

    // Founder opens the round
    const openRes = await axios.post(`${API_BASE}/fundraising-rounds/${roundId}/open`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
    record('Founder Opened Round for Commitments', openRes.status === 200 && openRes.data.data.status === 'Open');

    // 3. Investor Discovery & Details
    const openRoundsRes = await axios.get(`${API_BASE}/fundraising-rounds`, { headers: { Authorization: `Bearer ${investorToken}` } });
    const roundsList = openRoundsRes.data.rounds || openRoundsRes.data.data || [];
    const discoveredRound = roundsList.find((r) => (r._id || r.id).toString() === roundId);
    record('Investor Discovered Open Round in Marketplace', !!discoveredRound);

    const roundDetailRes = await axios.get(`${API_BASE}/fundraising-rounds/${roundId}`, { headers: { Authorization: `Bearer ${investorToken}` } });
    record('Investor Retrieved Round Details View', roundDetailRes.status === 200 && roundDetailRes.data.data._id.toString() === roundId);

    // 4. Investor Commitment Submission ($500k check)
    const commitRes = await axios.post(
      `${API_BASE}/fundraising-rounds/${roundId}/commitments`,
      {
        committedAmount: 500000,
        requestedAmount: 500000,
        investorRole: 'Co-Investor',
        proposedOwnership: 5,
        proposedValuation: 8000000,
        message: 'Submitting $500k check commitment for Seed round',
        notes: 'Due diligence passed cleanly',
      },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    const commitmentObj = commitRes.data.commitment || commitRes.data.data;
    const commitmentId = (commitmentObj._id || commitmentObj.id).toString();
    record('Investor Submitted $500k Commitment (POST /api/fundraising-rounds/:id/commitments)', commitRes.status === 201 || commitRes.status === 200);

    // 5. Duplicate Commitment Prevention Guard
    try {
      await axios.post(
        `${API_BASE}/fundraising-rounds/${roundId}/commitments`,
        { committedAmount: 100000 },
        { headers: { Authorization: `Bearer ${investorToken}` } }
      );
      record('Duplicate Commitment Guard (HTTP 400 Rejection)', false, 'Expected 400');
    } catch (err) {
      record('Duplicate Commitment Guard (HTTP 400 Rejection)', err.response?.status === 400);
    }

    // 6. Founder Commitment Visibility
    const founderCommRes = await axios.get(`${API_BASE}/fundraising-rounds/${roundId}/commitments`, { headers: { Authorization: `Bearer ${founderToken}` } });
    const founderCommList = founderCommRes.data.commitments || founderCommRes.data.data || [];
    const foundInList = founderCommList.some((c) => (c._id || c.id).toString() === commitmentId);
    record('Founder Discovered Investor Commitment in Round Workspace', founderCommRes.status === 200 && foundInList);

    // 7. Commitment Lifecycle: Founder Accepts Commitment
    const acceptRes = await axios.post(`${API_BASE}/commitments/${commitmentId}/accept`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
    record('Founder Accepted Investor Commitment (POST /api/commitments/:id/accept)', acceptRes.status === 200 && acceptRes.data.data.commitmentStatus === 'Committed');

    // 8. Server-Side Security & RBAC Guards
    try {
      await axios.post(
        `${API_BASE}/commitments/${commitmentId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${investorToken}` } }
      );
      record('RBAC Guard (Investor Cannot Accept Own Commitment)', false, 'Expected 403');
    } catch (err) {
      record('RBAC Guard (Investor Cannot Accept Own Commitment)', err.response?.status === 403);
    }

    // 9. Database Clean Up & Baseline User Verification
    await db.collection('fundraisingrounds').deleteOne({ _id: new mongoose.Types.ObjectId(roundId) });
    await db.collection('investorcommitments').deleteOne({ _id: new mongoose.Types.ObjectId(commitmentId) });
    console.log('✓ Cleaned temporary test commitment & round documents');

    const finalUsersCount = await db.collection('users').countDocuments();
    record('Final MongoDB Baseline Users Count (3 Accounts)', finalUsersCount === 3);

    console.log('\n================================================================');
    console.log(` AUDIT SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal Error during Investor Commitment audit:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testInvestorCommitmentPhase();
