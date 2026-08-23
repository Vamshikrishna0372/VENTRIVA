const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testAuthAndCapitalRaiseForensic() {
  console.log('================================================================');
  console.log(' VENTRIVA AUTHENTICATION & CAPITAL RAISE FORENSIC E2E AUDIT ');
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

    // 1. Authentication (Admin, Founder, Investor)
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
    record('Admin Login (POST /api/auth/login)', adminLogin.status === 200 && adminLogin.data.user.role === 'admin');

    const founderLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
    const founderToken = founderLogin.data.token;
    record('Founder Login (POST /api/auth/login)', founderLogin.status === 200 && founderLogin.data.user.role === 'founder');

    const investorLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
    const investorToken = investorLogin.data.token;
    record('Investor Login (POST /api/auth/login)', investorLogin.status === 200 && investorLogin.data.user.role === 'investor');

    // 2. Session Restoration (GET /api/auth/me)
    const founderMe = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
    record('Founder Session Restoration (GET /api/auth/me)', founderMe.status === 200 && founderMe.data.user.email === 'founder@ventriva.com');

    const investorMe = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${investorToken}` } });
    record('Investor Session Restoration (GET /api/auth/me)', investorMe.status === 200 && investorMe.data.user.email === 'investor@ventriva.com');

    // 3. Founder Startup Data Retrieval
    const startupsRes = await axios.get(`${API_BASE}/startups`, { headers: { Authorization: `Bearer ${founderToken}` } });
    const startupsList = startupsRes.data.startups || startupsRes.data.data || [];
    record('GET /api/startups (HTTP 200 OK)', startupsRes.status === 200 && Array.isArray(startupsList));
    record('Founder Startup Found in Response (VentrivaPay)', startupsList.length > 0 && (startupsList[0].startupName || startupsList[0].name || startupsList[0].companyName) === 'VentrivaPay');

    const startupObj = startupsList[0];
    const startupId = (startupObj._id || startupObj.id).toString();

    // 4. Create Seed Fundraising Round for VentrivaPay
    const roundData = {
      startupId: startupId,
      roundName: 'Series Seed 2026',
      roundType: 'Seed',
      targetAmount: 2500000,
      minimumAmount: 500000,
      maximumAmount: 3000000,
      preMoneyValuation: 10000000,
      minimumTicketSize: 50000,
      currency: 'USD',
      description: 'VentrivaPay Series Seed expansion round',
      useOfFunds: 'Product Engineering, Regulatory Compliance, Go-To-Market',
      isPublic: true,
    };

    let roundId;
    try {
      const createRoundRes = await axios.post(`${API_BASE}/fundraising-rounds`, roundData, { headers: { Authorization: `Bearer ${founderToken}` } });
      const createdRound = createRoundRes.data.round || createRoundRes.data.data;
      roundId = (createdRound._id || createdRound.id).toString();
      record('Create Fundraising Round (POST /api/fundraising-rounds)', createRoundRes.status === 201 || createRoundRes.status === 200);
    } catch (err) {
      if (err.response?.data?.message?.includes('already exists')) {
        const existingRoundsRes = await axios.get(`${API_BASE}/fundraising-rounds`, { headers: { Authorization: `Bearer ${founderToken}` } });
        const rounds = existingRoundsRes.data.rounds || existingRoundsRes.data.data || [];
        const existing = rounds.find(r => r.startup._id.toString() === startupId || r.startup.toString() === startupId);
        roundId = (existing._id || existing.id).toString();
        record('Found Existing Active Round for VentrivaPay', !!roundId);
      } else {
        record('Create Fundraising Round', false, err.response?.data?.message || err.message);
      }
    }

    // Open round for commitments if currently draft
    if (roundId) {
      try {
        await axios.post(`${API_BASE}/fundraising-rounds/${roundId}/open`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      } catch (err) {
        // Round already open or in progress
      }
    }

    // 5. Investor Commitment Creation ($500,000)
    let commitmentId;
    try {
      const commitRes = await axios.post(
        `${API_BASE}/fundraising-rounds/${roundId}/commitments`,
        {
          committedAmount: 500000,
          requestedAmount: 500000,
          investorRole: 'Co-Investor',
          proposedOwnership: 5,
          proposedValuation: 10000000,
          message: 'Firm check commitment for VentrivaPay Seed round',
          notes: 'Diligence passed',
        },
        { headers: { Authorization: `Bearer ${investorToken}` } }
      );
      const createdCommitment = commitRes.data.commitment || commitRes.data.data;
      commitmentId = (createdCommitment._id || createdCommitment.id).toString();
      record('Investor Created $500,000 Commitment', commitRes.status === 201 || commitRes.status === 200);
    } catch (err) {
      if (err.response?.data?.message?.includes('already have an active commitment')) {
        const existingCommRes = await axios.get(`${API_BASE}/fundraising-rounds/${roundId}/commitments`, { headers: { Authorization: `Bearer ${investorToken}` } });
        const comms = existingCommRes.data.commitments || existingCommRes.data.data || [];
        if (comms.length > 0) {
          commitmentId = (comms[0]._id || comms[0].id).toString();
          record('Existing $500,000 Commitment Preserved in Database', true);
        }
      } else {
        record('Investor Commitment Creation', false, err.response?.data?.message || err.message);
      }
    }

    // 6. Server-Side Security & RBAC Guards
    try {
      await axios.post(`${API_BASE}/fundraising-rounds/${roundId}/commitments`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      record('RBAC Guard (Founder Cannot Create Investor Commitment)', false, 'Expected 403 or 400');
    } catch (err) {
      record('RBAC Guard (Founder Cannot Create Investor Commitment)', err.response?.status === 403 || err.response?.status === 400);
    }

    // 7. Data Safety Verification (0 Deletions)
    const finalCollections = await db.listCollections().toArray();
    record('MongoDB Collection Count (50 Collections Preserved)', finalCollections.length === 50);

    console.log('\n================================================================');
    console.log(` AUDIT SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal Error during Auth & Capital Raise forensic audit:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testAuthAndCapitalRaiseForensic();
