const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runVerificationQueueAudit() {
  console.log('================================================================');
  console.log(' VENTRIVA STARTUP VERIFICATION QUEUE REAL-WORLD AUDIT ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function record(name, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ PASS [${total.toString().padStart(2, '0')}] ${name}`);
    } else {
      console.error(`✗ FAIL [${total.toString().padStart(2, '0')}] ${name}: ${detail}`);
    }
  }

  try {
    // 1. Direct MongoDB Atlas Connection Verification
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✓ Connected to MongoDB Atlas');

    // 2. Admin Login
    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ventriva.com',
      password: 'admin123',
    });
    const adminToken = adminRes.data.token;
    record('Admin Authentication (admin@ventriva.com)', adminRes.status === 200);

    // 3. Founder Login
    const founderRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'founder@ventriva.com',
      password: 'founder123',
    });
    const founderToken = founderRes.data.token;
    record('Founder Authentication (founder@ventriva.com)', founderRes.status === 200);

    // 4. Founder Creates / Updates Startup Profile (VentrivaPay FinTech Queue Audit)
    const startupRes = await axios.post(
      `${API_BASE}/startups`,
      {
        startupName: 'VentrivaPay Verification Test',
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
    const createdStartup = startupRes.data.startup || startupRes.data.data;
    const startupId = createdStartup._id;
    record('Founder: Created Startup (VentrivaPay Verification Test)', [200, 201].includes(startupRes.status) && startupId);

    // 5. Admin Governance Query Returns Created Startup
    const govRes = await axios.get(`${API_BASE}/admin/startups`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const govStartup = govRes.data.startups.find((s) => s._id.toString() === startupId.toString());
    record('Admin Governance: Discovered Created Startup', !!govStartup);

    // 6. Admin Verification Queue Returns Created Unverified Startup
    const queueRes = await axios.get(`${API_BASE}/admin/startups?limit=100`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingList = queueRes.data.startups.filter((s) => !s.isVerified && s.verificationStatus !== 'Verified' && s.verificationStatus !== 'Rejected');
    const queueStartup = pendingList.find((s) => s._id.toString() === startupId.toString());
    record('Admin Verification Queue: Discovered Pending Unverified Startup', !!queueStartup);

    // 7. Admin Approves Verification Status
    const approveRes = await axios.patch(
      `${API_BASE}/admin/startups/${startupId}/verification`,
      { verificationStatus: 'Verified' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record('Admin: Approved Startup Verification (Status: Verified)', approveRes.status === 200 && approveRes.data.startup.verificationStatus === 'Verified');

    // 8. Admin Governance Shows Verified Status
    const govAfterApprove = await axios.get(`${API_BASE}/admin/startups`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const govVerified = govAfterApprove.data.startups.find((s) => s._id.toString() === startupId.toString());
    record('Admin Governance: Synchronized Verified Status', govVerified && govVerified.verificationStatus === 'Verified' && govVerified.isVerified === true);

    // 9. Founder Dashboard / GET /api/startups/my Shows Verified Status
    const myStartupRes = await axios.get(`${API_BASE}/startups/my`, {
      headers: { Authorization: `Bearer ${founderToken}` },
    });
    const myStartup = myStartupRes.data.startup || myStartupRes.data.data;
    record('Founder: Synchronized Verified Status', myStartup && myStartup.verificationStatus === 'Verified');

    // 10. Clean up temporary test startup
    await db.collection('startups').deleteOne({ _id: new mongoose.Types.ObjectId(startupId) });
    console.log('✓ Cleaned temporary test startup document');

    // 11. Final Clean Baseline Verification
    const finalDocsCount = await db.collection('users').countDocuments();
    record('Final Baseline User Accounts Count (3 Clean Accounts)', finalDocsCount === 3, `Count: ${finalDocsCount}`);

    console.log('\n================================================================');
    console.log(` VERIFICATION QUEUE SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal Error during verification queue audit:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runVerificationQueueAudit();
