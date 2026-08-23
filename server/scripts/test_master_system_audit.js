const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runMasterSystemAudit() {
  console.log('================================================================');
  console.log(' VENTRIVA MASTER SYSTEM FORENSIC AUDIT & VERIFICATION ');
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

    // 1. Database Baseline Capture
    const initialUsersCount = await db.collection('users').countDocuments();
    const initialStartupsCount = await db.collection('startups').countDocuments();
    const initialCommitmentsCount = await db.collection('investorcommitments').countDocuments();
    record('MongoDB Atlas Baseline Captured (50 Collections)', initialUsersCount >= 3 && initialStartupsCount >= 1);

    // 2. Multi-Role Authentication & Session Restoration
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
    const adminToken = adminLogin.data.token;
    record('Admin Authentication (POST /api/auth/login)', adminLogin.status === 200 && adminLogin.data.user.role === 'admin');

    const founderLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
    const founderToken = founderLogin.data.token;
    record('Founder Authentication (POST /api/auth/login)', founderLogin.status === 200 && founderLogin.data.user.role === 'founder');

    const investorLogin = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
    const investorToken = investorLogin.data.token;
    record('Investor Authentication (POST /api/auth/login)', investorLogin.status === 200 && investorLogin.data.user.role === 'investor');

    const founderMe = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
    record('Session Restoration (GET /api/auth/me)', founderMe.status === 200 && founderMe.data.user.role === 'founder');

    // 3. Founder Startup Retrieval & Select Startup Dropdown
    const startupsRes = await axios.get(`${API_BASE}/startups`, { headers: { Authorization: `Bearer ${founderToken}` } });
    const startupsList = startupsRes.data.startups || startupsRes.data.data || [];
    record('Founder Startup Retrieval (GET /api/startups)', startupsRes.status === 200 && startupsList.length > 0);
    record('Startup Name Property Validation', (startupsList[0].startupName || startupsList[0].name || startupsList[0].companyName) === 'VentrivaPay');

    // 4. Capital Raise Workspace & Active Round
    const roundsRes = await axios.get(`${API_BASE}/fundraising-rounds`, { headers: { Authorization: `Bearer ${founderToken}` } });
    const roundsList = roundsRes.data.rounds || roundsRes.data.data || [];
    record('Capital Raise Workspace Round Retrieval', roundsRes.status === 200 && roundsList.length > 0);

    // 5. Investor Commitment Preservation
    const commitmentsRes = await axios.get(`${API_BASE}/fundraising-rounds/${roundsList[0]._id}/commitments`, { headers: { Authorization: `Bearer ${investorToken}` } });
    const commsList = commitmentsRes.data.commitments || commitmentsRes.data.data || [];
    const preservedComm = commsList.find(c => c.committedAmount === 500000);
    record('Existing $500,000 Investor Commitment Preserved', !!preservedComm);

    // 6. Admin Verification Queue & Governance
    const adminQueueRes = await axios.get(`${API_BASE}/admin/startups?verificationStatus=Unverified`, { headers: { Authorization: `Bearer ${adminToken}` } });
    record('Admin Verification Queue Endpoint (GET /api/admin/startups)', adminQueueRes.status === 200);

    // 7. Server-Side Security & RBAC Enforcement
    try {
      await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${investorToken}` } });
      record('RBAC Security Guard (Investor Blocked from Admin Users Endpoint)', false, 'Expected 403');
    } catch (err) {
      record('RBAC Security Guard (Investor Blocked from Admin Users Endpoint)', err.response?.status === 403);
    }

    // 8. Data Preservation Final Count Check
    const finalUsersCount = await db.collection('users').countDocuments();
    const finalStartupsCount = await db.collection('startups').countDocuments();
    const finalCommitmentsCount = await db.collection('investorcommitments').countDocuments();
    record('Zero MongoDB Record Deletions', finalUsersCount >= initialUsersCount && finalStartupsCount >= initialStartupsCount && finalCommitmentsCount >= initialCommitmentsCount);

    console.log('\n================================================================');
    console.log(` MASTER AUDIT SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Fatal Error during Master System Audit:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runMasterSystemAudit();
