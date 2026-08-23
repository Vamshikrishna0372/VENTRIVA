const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testCapitalRaiseWorkspace() {
  console.log('================================================================');
  console.log(' VENTRIVA CAPITAL RAISE WORKSPACE REAL-WORLD AUDIT ');
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

    // 1. Founder Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
    const token = loginRes.data.token;
    record('Founder Login (POST /api/auth/login)', loginRes.status === 200 && !!token);

    // 2. Session Restoration
    const meRes = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    record('Session Restoration (GET /api/auth/me)', meRes.status === 200 && meRes.data.user.role === 'founder');

    // 3. GET /api/startups
    const startupsRes = await axios.get(`${API_BASE}/startups`, { headers: { Authorization: `Bearer ${token}` } });
    const startupsList = startupsRes.data.startups || startupsRes.data.data;
    record('GET /api/startups (HTTP 200 OK)', startupsRes.status === 200 && Array.isArray(startupsList));
    record('Founder Startups Found in GET /api/startups', startupsList.length > 0 && startupsList[0].startupName === 'VentrivaPay');

    // 4. GET /api/startups/my
    const myStartupRes = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${token}` } });
    const myStartup = myStartupRes.data.startup;
    record('GET /api/startups/my (HTTP 200 OK)', myStartupRes.status === 200 && !!myStartup);

    const startupId = (myStartup._id || myStartup.id).toString();

    // Clean up any existing active fundraising rounds for clean test run
    await db.collection('fundraisingrounds').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });

    // 5. Create Fundraising Round (POST /api/fundraising-rounds)
    const roundData = {
      startupId: startupId,
      roundName: 'Seed Round 2026',
      roundType: 'Seed',
      targetAmount: 20000000,
      minimumAmount: 5000000,
      maximumAmount: 25000000,
      preMoneyValuation: 80000000,
      postMoneyValuation: 100000000,
      minimumTicketSize: 500000,
      currency: 'INR',
      description: 'Expansion of VentrivaPay fintech settlement infrastructure.',
      useOfFunds: 'Product Engineering, Regulatory Compliance, Go-To-Market expansion.',
      isPublic: true,
    };

    const createRoundRes = await axios.post(`${API_BASE}/fundraising-rounds`, roundData, { headers: { Authorization: `Bearer ${token}` } });
    const createdRound = createRoundRes.data.round || createRoundRes.data.data;
    record('Create Fundraising Round (POST /api/fundraising-rounds)', createRoundRes.status === 201 || createRoundRes.status === 200);
    record('Created Round Persisted in Response', createdRound && createdRound.roundName === 'Seed Round 2026');

    // 6. Fetch All Fundraising Rounds (GET /api/fundraising-rounds)
    const roundsRes = await axios.get(`${API_BASE}/fundraising-rounds`, { headers: { Authorization: `Bearer ${token}` } });
    const roundsList = roundsRes.data.rounds || roundsRes.data.data || [];
    const roundFound = roundsList.some((r) => r.roundName === 'Seed Round 2026');
    record('Fundraising Round Retrievable via GET /api/fundraising-rounds', roundsRes.status === 200 && roundFound);

    // 7. Server-Side Ownership Protection Guard
    try {
      await axios.post(
        `${API_BASE}/fundraising-rounds`,
        { ...roundData, startupId: new mongoose.Types.ObjectId().toString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      record('Server-Side Ownership Guard (Unauthorized Startup ID)', false, 'Expected 403 or 404');
    } catch (err) {
      record('Server-Side Ownership Guard (Unauthorized Startup ID)', err.response?.status === 403 || err.response?.status === 404);
    }

    console.log('\n================================================================');
    console.log(` AUDIT SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal Error during Capital Raise audit:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testCapitalRaiseWorkspace();
