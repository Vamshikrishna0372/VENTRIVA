const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runPhase46ProductionDeploymentVerification() {
  console.log('================================================================');
  console.log(' VENTRIVA PHASE 46: PRODUCTION DEPLOYMENT REAL-WORLD VERIFICATION ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function record(stepNum, category, name, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ PASS [Step ${stepNum.toString().padStart(2, '0')}] ${category}: ${name}`);
    } else {
      console.error(`✗ FAIL [Step ${stepNum.toString().padStart(2, '0')}] ${category}: ${name} (${detail})`);
    }
  }

  try {
    // Connect DB
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✓ Connected to MongoDB Atlas');

    // Step 3: Backend Health Probes
    const healthRes = await axios.get(`${API_BASE}/health`);
    record(3, 'BACKEND HEALTH', 'GET /api/health probe', healthRes.status === 200 && healthRes.data.status === 'ok');

    const readyRes = await axios.get(`${API_BASE}/health/ready`);
    record(3, 'BACKEND HEALTH', 'GET /api/health/ready probe', readyRes.status === 200 && (readyRes.data.database === 'ready' || readyRes.data.data?.database === 'ready'));

    // Step 4: Real Production Authentication & Invalid Password Guard
    const adminRes = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
    const adminToken = adminRes.data.token;
    record(4, 'AUTHENTICATION', 'Admin Login (admin@ventriva.com)', adminRes.status === 200 && !!adminToken);

    const founderRes = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
    const founderToken = founderRes.data.token;
    record(4, 'AUTHENTICATION', 'Founder Login (founder@ventriva.com)', founderRes.status === 200 && !!founderToken);

    const investorRes = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
    const investorToken = investorRes.data.token;
    record(4, 'AUTHENTICATION', 'Investor Login (investor@ventriva.com)', investorRes.status === 200 && !!investorToken);

    // Invalid Password 401 Rejection
    try {
      await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'wrongpassword' });
      record(4, 'AUTHENTICATION', 'Invalid Password Guard (HTTP 401 Rejection)', false, 'Expected 401');
    } catch (err) {
      record(4, 'AUTHENTICATION', 'Invalid Password Guard (HTTP 401 Rejection)', err.response?.status === 401);
    }

    // Session Restoration (/api/auth/me)
    const meRes = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
    record(4, 'AUTHENTICATION', 'Session Restoration (/api/auth/me)', meRes.status === 200 && meRes.data.user.role === 'founder');

    // Step 5: Role Isolation / RBAC
    try {
      await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${founderToken}` } });
      record(5, 'ROLE ISOLATION', 'Server-Side RBAC (Founder -> Admin Route)', false, 'Expected 403 Forbidden');
    } catch (err) {
      record(5, 'ROLE ISOLATION', 'Server-Side RBAC (Founder -> Admin Route)', err.response?.status === 403);
    }

    // Step 8: Startup Verification Queue & Governance Persistence
    await db.collection('startups').deleteMany({ startupName: 'VentrivaPay Phase 46 Verification' });

    const createStartupRes = await axios.post(
      `${API_BASE}/startups`,
      {
        startupName: 'VentrivaPay Phase 46 Verification',
        foundedYear: 2024,
        tagline: 'Venture Capital Settlement Infrastructure',
        description: 'Automated deal room transactions and cap table equity management.',
        sector: 'FinTech',
        stage: 'Seed',
        businessModel: 'SaaS',
        country: 'United States',
        city: 'San Francisco',
        monthlyRevenue: 35000,
        annualRevenue: 420000,
        fundingRequired: 2000000,
        targetRoundStage: 'Seed',
      },
      { headers: { Authorization: `Bearer ${founderToken}` } }
    );
    const createdStartup = createStartupRes.data.startup || createStartupRes.data.data;
    const startupId = (createdStartup._id || createdStartup.id).toString();

    // Verify unverified draft startup appears in Admin Verification Queue
    const queueRes = await axios.get(`${API_BASE}/admin/startups?limit=100`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const pendingList = queueRes.data.startups.filter((s) => !s.isVerified && s.verificationStatus !== 'Verified' && s.verificationStatus !== 'Rejected');
    const inQueue = pendingList.some((s) => (s._id || s.id).toString() === startupId);
    record(8, 'VERIFICATION QUEUE', 'Unverified/Draft Startup Appears in Admin Verification Queue', inQueue);

    // Admin Approves Verification Status
    const approveRes = await axios.patch(
      `${API_BASE}/admin/startups/${startupId}/verification`,
      { verificationStatus: 'Verified' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record(8, 'VERIFICATION QUEUE', 'Admin Approves Startup Verification Status', approveRes.status === 200 && approveRes.data.startup.verificationStatus === 'Verified');

    // Admin Governance Reflects Synchronized Verified Status
    const govRes = await axios.get(`${API_BASE}/admin/startups`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const govVerified = govRes.data.startups.find((s) => (s._id || s.id).toString() === startupId);
    record(8, 'VERIFICATION QUEUE', 'Admin Governance Synchronized Verified Status', govVerified && govVerified.verificationStatus === 'Verified' && govVerified.isVerified === true);

    // Founder Sees Synchronized Verified Status
    const myStartupRes = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${founderToken}` } });
    const myStartup = myStartupRes.data.startup || myStartupRes.data.data;
    record(8, 'VERIFICATION QUEUE', 'Founder Profile Synchronized Verified Status', myStartup && myStartup.verificationStatus === 'Verified');

    // Clean up temporary test startup
    await db.collection('startups').deleteOne({ _id: new mongoose.Types.ObjectId(startupId) });
    console.log('✓ Cleaned temporary test startup document');

    // Step 9: Database Persistence & Baseline Verification
    const finalDocsCount = await db.collection('users').countDocuments();
    record(9, 'DATABASE PERSISTENCE', 'Clean Primary Baseline User Accounts Count (3 Accounts)', finalDocsCount === 3);

    console.log('\n================================================================');
    console.log(` PHASE 46 VERIFICATION SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal Error during Phase 46 verification:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase46ProductionDeploymentVerification();
