const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runPhase47PublicProductionAudit() {
  console.log('================================================================');
  console.log(' VENTRIVA PHASE 47: PUBLIC PRODUCTION DEPLOYMENT AUDIT ');
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

    // Step 4: Production Health Check
    const healthRes = await axios.get(`${API_BASE}/health`);
    record(4, 'HEALTH CHECK', 'GET /api/health probe', healthRes.status === 200 && healthRes.data.status === 'ok');

    const readyRes = await axios.get(`${API_BASE}/health/ready`);
    record(4, 'HEALTH CHECK', 'GET /api/health/ready probe', readyRes.status === 200 && (readyRes.data.database === 'ready' || readyRes.data.data?.database === 'ready'));

    // Step 5 - 7: Multi-Role Authentication & Session Restoration
    const adminRes = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
    const adminToken = adminRes.data.token;
    record(5, 'ADMIN FLOW', 'Admin Real Authentication (admin@ventriva.com)', adminRes.status === 200 && !!adminToken);

    const founderRes = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
    const founderToken = founderRes.data.token;
    record(6, 'FOUNDER FLOW', 'Founder Real Authentication (founder@ventriva.com)', founderRes.status === 200 && !!founderToken);

    const investorRes = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
    const investorToken = investorRes.data.token;
    record(7, 'INVESTOR FLOW', 'Investor Real Authentication (investor@ventriva.com)', investorRes.status === 200 && !!investorToken);

    // Step 12: Session Restoration (/api/auth/me)
    const sessionRes = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
    record(12, 'SESSION RESTORATION', 'Session Restoration (/api/auth/me)', sessionRes.status === 200 && sessionRes.data.user.role === 'founder');

    // Step 11: RBAC Security Enforcement
    try {
      await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${founderToken}` } });
      record(11, 'RBAC SECURITY', 'Server-Side RBAC Protection (Founder -> Admin Endpoint)', false, 'Expected 403');
    } catch (err) {
      record(11, 'RBAC SECURITY', 'Server-Side RBAC Protection (Founder -> Admin Endpoint)', err.response?.status === 403);
    }

    // Step 8 & 10: Startup Verification Queue & Cross-Role End-to-End Lifecycle
    await db.collection('startups').deleteMany({ startupName: 'VentrivaPay Public Production Test' });

    const startupRes = await axios.post(
      `${API_BASE}/startups`,
      {
        startupName: 'VentrivaPay Public Production Test',
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
    const startupId = (createdStartup._id || createdStartup.id).toString();
    record(10, 'CROSS-ROLE LIFECYCLE', 'Founder Created VentrivaPay Public Production Startup', !!startupId);

    // Admin Verification Queue Audit
    const queueRes = await axios.get(`${API_BASE}/admin/startups?limit=100`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const pendingList = queueRes.data.startups.filter((s) => !s.isVerified && s.verificationStatus !== 'Verified' && s.verificationStatus !== 'Rejected');
    const inQueue = pendingList.some((s) => (s._id || s.id).toString() === startupId);
    record(8, 'VERIFICATION QUEUE', 'Draft/Unverified Startup Discovered in Admin Audit Queue', inQueue);

    // Admin Approves Verification Status
    const approveRes = await axios.patch(
      `${API_BASE}/admin/startups/${startupId}/verification`,
      { verificationStatus: 'Verified' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record(8, 'VERIFICATION QUEUE', 'Admin Approved Startup Verification Status', approveRes.status === 200 && approveRes.data.startup.verificationStatus === 'Verified');

    // Admin Publishes Startup Profile
    await axios.patch(
      `${API_BASE}/admin/startups/${startupId}/publication`,
      { isPublished: true, profileVisibility: 'Investors Only' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    record(9, 'ADMIN GOVERNANCE', 'Admin Published Startup Profile', true);

    // Investor Discovers Verified Startup
    const discoverRes = await axios.get(`${API_BASE}/startups/discover`, { headers: { Authorization: `Bearer ${investorToken}` } });
    const discoverList = discoverRes.data.startups || discoverRes.data.data?.startups || [];
    const isDiscovered = discoverList.some((s) => (s._id || s.id).toString() === startupId);
    record(10, 'CROSS-ROLE LIFECYCLE', 'Investor Discovered Published Verified Startup', isDiscovered);

    // Shortlist & Express Interest
    await axios.post(`${API_BASE}/shortlists`, { startupId, notes: 'Public Production Target' }, { headers: { Authorization: `Bearer ${investorToken}` } });
    const interestRes = await axios.post(
      `${API_BASE}/interests`,
      { startupId, interestLevel: 'High', proposedTicketSize: 500000, message: 'Interested in leading Seed round' },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    const interestObj = interestRes.data.interest || interestRes.data.data;
    record(10, 'CROSS-ROLE LIFECYCLE', 'Investor Expressed $500k Ticket Interest', !!interestObj);

    if (interestObj?._id) {
      await axios.patch(`${API_BASE}/interests/${interestObj._id}/respond`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${founderToken}` } });
      record(10, 'CROSS-ROLE LIFECYCLE', 'Founder Accepted Investor Interest', true);
    }

    // Clean up temporary test data
    await db.collection('startups').deleteOne({ _id: new mongoose.Types.ObjectId(startupId) });
    await db.collection('shortlists').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('investorinterests').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    console.log('✓ Cleaned temporary test documents');

    // Step 16: Database Final Verification
    const finalDocsCount = await db.collection('users').countDocuments();
    record(16, 'DATABASE VERIFICATION', 'Clean Baseline Primary Accounts Count (3 Accounts)', finalDocsCount === 3);

    console.log('\n================================================================');
    console.log(` PHASE 47 AUDIT SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal Error during Phase 47 audit:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase47PublicProductionAudit();
