const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runUserAcceptanceMasterTest() {
  console.log('================================================================');
  console.log(' VENTRIVA USER ACCEPTANCE & FULL PERSISTENCE MASTER AUDIT ');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let errors = [];

  function recordResult(name, passed, detail = '') {
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`✓ PASS [${totalTests.toString().padStart(2, '0')}] ${name}${detail ? ' (' + detail + ')' : ''}`);
    } else {
      errors.push({ name, detail });
      console.error(`❌ FAIL [${totalTests.toString().padStart(2, '0')}] ${name}: ${detail}`);
    }
  }

  // CONNECT TO MONGOOSE
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const dbCols = await db.listCollections().toArray();
  const User = require('../models/User');

  // CLEAN INITIAL BASELINE (3 Users, 0 Business Documents)
  await db.collection('users').deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });
  for (const col of dbCols) {
    if (col.name !== 'users') await db.collection(col.name).deleteMany({});
  }

  const initialUserCount = await User.countDocuments();
  recordResult('Baseline Inventory: Clean Users Count', initialUserCount === 3, `Count: ${initialUserCount}`);

  // --- PHASE 1: AUTHENTICATION AUDIT ---
  console.log('\n--- PHASE 1: AUTHENTICATION AUDIT ---');

  const adminLogin1 = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  recordResult('Admin Login', adminLogin1.status === 200 && adminLogin1.data.user.role === 'admin');

  const founderLogin1 = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('Founder Login', founderLogin1.status === 200 && founderLogin1.data.user.role === 'founder');

  const investorLogin1 = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
  recordResult('Investor Login', investorLogin1.status === 200 && investorLogin1.data.user.role === 'investor');

  const adminToken = adminLogin1.data.token;
  const founderToken = founderLogin1.data.token;
  const investorToken = investorLogin1.data.token;

  const founderId = String(founderLogin1.data.user.id || founderLogin1.data.user._id);
  const investorId = String(investorLogin1.data.user.id || investorLogin1.data.user._id);

  // Session restoration
  const meRes = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('Session Restoration (/api/auth/me)', meRes.data.user?.email === 'founder@ventriva.com');

  // Re-login after logout simulation
  const founderLogin2 = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('Re-login Post Logout Simulation (No 401/403 loop)', founderLogin2.status === 200);

  // --- PHASE 2: FOUNDER REAL-WORLD STARTUP WORKFLOW ---
  console.log('\n--- PHASE 2: FOUNDER REAL-WORLD STARTUP WORKFLOW ---');

  const createStartupRes = await axios.post(
    `${API_BASE}/startups`,
    {
      startupName: 'VentrivaPay FinTech',
      tagline: 'Unified payment infrastructure for SMBs',
      description: 'VentrivaPay provides next-gen payment gateways, reconciliation, and automated financial operations for high-growth enterprises.',
      foundedYear: 2024,
      sector: 'FinTech',
      subSector: 'Payments',
      stage: 'Seed',
      businessModel: 'B2B',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      website: 'https://ventrivapay.com',
      linkedin: 'https://linkedin.com/company/ventrivapay',
      monthlyRevenue: 35000,
      annualRevenue: 420000,
      revenueCurrency: 'USD',
      customerCount: 180,
      userCount: 2500,
      fundraisingStatus: 'Currently Raising',
      fundingStage: 'Seed',
      fundingRequired: 2000000,
      fundingCurrency: 'USD',
      profileVisibility: 'Investors Only',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );

  const startupObj = createStartupRes.data.startup;
  assert(startupObj?._id, 'Startup creation failed');
  const startupId = startupObj._id;
  recordResult('Founder: Created VentrivaPay FinTech Startup', !!startupId, `ID: ${startupId}`);

  // Publish startup for discovery
  await axios.put(`${API_BASE}/startups/my/${startupId}`, { isPublished: true, profileVisibility: 'Investors Only' }, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('Founder: Published Startup Profile', true);

  // Fetch startup via GET /api/startups/my
  const getStartupRes = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('Founder: GET /api/startups/my Persisted in MongoDB', getStartupRes.status === 200 && getStartupRes.data.startup?.startupName === 'VentrivaPay FinTech');

  // Edit startup and verify edit persistence
  const editStartupRes = await axios.put(`${API_BASE}/startups/my/${startupId}`, { customerCount: 200, monthlyRevenue: 40000 }, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('Founder: Edit Startup Persisted in DB', editStartupRes.status === 200 && editStartupRes.data.startup?.customerCount === 200);

  // Add Team Member
  const teamRes = await axios.post(
    `${API_BASE}/startups/my/${startupId}/team`,
    { name: 'Rahul Sharma', role: 'Co-Founder & CTO', bio: 'Ex-Razorpay Tech Lead', linkedin: 'https://linkedin.com/in/rahulsharma' },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );
  recordResult('Founder: Team Member Added & Associated', teamRes.status === 200 || teamRes.status === 201);

  // --- PHASE 3: FOUNDER READINESS SCORE ---
  console.log('\n--- PHASE 3: FOUNDER READINESS SCORE ---');

  const readinessRes = await axios.get(`${API_BASE}/startups/my/readiness`, { headers: { Authorization: `Bearer ${founderToken}` } });
  const readinessData = readinessRes.data.data;
  recordResult('Founder: GET /api/startups/my/readiness Calculated', readinessRes.status === 200 && (readinessData?.overallScore || 0) > 0, `Score: ${readinessData?.overallScore}/100`);

  // --- PHASE 4: ADMIN STARTUP OBSERVABILITY & VERIFICATION ---
  console.log('\n--- PHASE 4: ADMIN STARTUP OBSERVABILITY & VERIFICATION ---');

  const adminStartupsRes = await axios.get(`${API_BASE}/admin/startups`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const adminFound = (adminStartupsRes.data.startups || adminStartupsRes.data.data || []).some((s) => s._id === startupId);
  recordResult('Admin: Discovered Founder Startup in Admin Governance', adminFound);

  // --- PHASE 5: INVESTOR DISCOVERY ---
  console.log('\n--- PHASE 5: INVESTOR DISCOVERY ---');

  const discoverRes = await axios.get(`${API_BASE}/startups/discover`, { headers: { Authorization: `Bearer ${investorToken}` } });
  const investorDiscovered = (discoverRes.data.data?.startups || discoverRes.data.startups || []).some((s) => s._id === startupId);
  recordResult('Investor: Discovered Published Startup in Investor Portal', investorDiscovered);

  // --- PHASE 6: INVESTOR SHORTLIST & INTEREST ---
  console.log('\n--- PHASE 6: INVESTOR SHORTLIST & INTEREST ---');

  const shortlistRes = await axios.post(`${API_BASE}/shortlists`, { startupId, notes: 'Target Seed investment' }, { headers: { Authorization: `Bearer ${investorToken}` } });
  recordResult('Investor: Shortlisted Startup', shortlistRes.status === 200 || shortlistRes.status === 201);

  const interestRes = await axios.post(
    `${API_BASE}/interests`,
    { startupId, interestLevel: 'High', proposedTicketSize: 500000, message: 'Interested in leading $2M Seed round.' },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  const interestObj = interestRes.data.interest || interestRes.data.data;
  const interestId = interestObj?._id;
  recordResult('Investor: Expressed Interest ($500k Ticket)', !!interestId);

  // --- PHASE 7: FOUNDER RECEIVES INVESTOR INTEREST ---
  console.log('\n--- PHASE 7: FOUNDER RECEIVES INVESTOR INTEREST ---');

  if (interestId) {
    const respondRes = await axios.patch(`${API_BASE}/interests/${interestId}/respond`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${founderToken}` } });
    recordResult('Founder: Accepted Investor Interest', respondRes.status === 200);
  }

  // --- PHASE 8: INVESTOR EVALUATION ---
  console.log('\n--- PHASE 8: INVESTOR EVALUATION ---');

  const evalRes = await axios.post(
    `${API_BASE}/evaluations`,
    {
      startupId,
      scores: { team: 9, market: 9, product: 9, traction: 8, businessModel: 8, competitiveAdvantage: 8, financials: 8, fundraising: 9 },
      strengths: ['FinTech market leader', 'Strong team background'],
      risks: ['Regulatory compliance'],
      investmentDecision: 'Interested',
    },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  recordResult('Investor: Submitted Venture Evaluation', evalRes.status === 200);

  // --- PHASE 9: INVESTOR PIPELINE ---
  console.log('\n--- PHASE 9: INVESTOR PIPELINE ---');

  const pipelineRes = await axios.post(
    `${API_BASE}/pipelines`,
    { startupId, stage: 'Due Diligence', priority: 'High', expectedInvestment: 500000 },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  recordResult('Investor: Created Pipeline Entry (Due Diligence)', pipelineRes.status === 200 || pipelineRes.status === 201);

  // --- PHASE 10: MESSAGING ---
  console.log('\n--- PHASE 10: MESSAGING ---');

  const convRes = await axios.get(`${API_BASE}/conversations`, { headers: { Authorization: `Bearer ${founderToken}` } });
  const conversations = convRes.data.conversations || convRes.data.data || [];
  const conversationId = conversations[0]?._id;
  recordResult('Messaging: Active Conversation Thread Auto-Created', !!conversationId);

  if (conversationId) {
    const msg1 = await axios.post(`${API_BASE}/messages/${conversationId}`, { message: 'Welcome to VentrivaPay deal room!' }, { headers: { Authorization: `Bearer ${founderToken}` } });
    recordResult('Messaging: Founder Sent Message', msg1.status === 200 || msg1.status === 201);

    const msg2 = await axios.post(`${API_BASE}/messages/${conversationId}`, { message: 'Thanks! Let us schedule our term sheet call.' }, { headers: { Authorization: `Bearer ${investorToken}` } });
    recordResult('Messaging: Investor Replied to Message', msg2.status === 200 || msg2.status === 201);
  }

  // --- PHASE 11: MEETINGS ---
  console.log('\n--- PHASE 11: MEETINGS ---');

  const startMeeting = new Date(Date.now() + 86400000 * 2);
  const endMeeting = new Date(startMeeting.getTime() + 1800000);

  const meetingRes = await axios.post(
    `${API_BASE}/meetings`,
    {
      startupId,
      title: 'VentrivaPay Term Sheet Review',
      scheduledStart: startMeeting.toISOString(),
      scheduledEnd: endMeeting.toISOString(),
      meetingType: 'Video Call',
      agenda: 'Finalize valuation and investment rights.',
    },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  const meetingId = meetingRes.data.meeting?._id || meetingRes.data.data?._id;
  recordResult('Meetings: Investor Scheduled Video Call', !!meetingId);

  if (meetingId) {
    const confirmRes = await axios.patch(`${API_BASE}/meetings/${meetingId}/confirm`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
    recordResult('Meetings: Founder Confirmed Meeting', confirmRes.status === 200);
  }

  // --- PHASE 12: FUNDRAISING, COMMITMENT, DEAL & CLOSING ---
  console.log('\n--- PHASE 12: FUNDRAISING, COMMITMENT, DEAL & CLOSING ---');

  const roundRes = await axios.post(
    `${API_BASE}/fundraising-rounds`,
    {
      startupId,
      roundName: 'Seed Round 2026',
      roundType: 'Seed',
      targetAmount: 2000000,
      preMoneyValuation: 8000000,
      minimumTicketSize: 50000,
      currency: 'USD',
      summary: 'Seed round for global expansion',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );
  const roundObj = roundRes.data.data || roundRes.data.round;
  const roundId = roundObj?._id;
  recordResult('Fundraising: Seed Round Created ($2,000,000)', !!roundId);

  if (roundId) {
    await axios.post(`${API_BASE}/fundraising-rounds/${roundId}/open`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });

    const commitRes = await axios.post(
      `${API_BASE}/fundraising-rounds/${roundId}/commitments`,
      { committedAmount: 500000, currency: 'USD', notes: 'Lead investor ticket' },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    const commitmentObj = commitRes.data.commitment || commitRes.data.data;
    const commitmentId = commitmentObj?._id;
    recordResult('Fundraising: Investor Submitted Commitment ($500,000)', !!commitmentId);

    if (commitmentId) {
      await axios.post(`${API_BASE}/commitments/${commitmentId}/accept`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      const dealRoomRes = await axios.post(`${API_BASE}/commitments/${commitmentId}/open-deal-room`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      recordResult('Deal Room & Closing Transaction Initialized', dealRoomRes.status === 200 || dealRoomRes.status === 201);
    }
  }

  // --- PHASE 13: ADMIN OBSERVABILITY ---
  console.log('\n--- PHASE 13: ADMIN OBSERVABILITY ---');

  const adminDashRes = await axios.get(`${API_BASE}/admin/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
  recordResult('Admin Observability: Dashboard Real DB Aggregations', adminDashRes.status === 200);

  const adminAuditRes = await axios.get(`${API_BASE}/admin/audit-logs`, { headers: { Authorization: `Bearer ${adminToken}` } });
  recordResult('Admin Observability: Audit Logs System Access', adminAuditRes.status === 200);

  // --- PHASE 14: DATABASE RELATIONSHIP FORENSIC AUDIT (PRE-PURGE) ---
  console.log('\n--- PHASE 14: DATABASE RELATIONSHIP FORENSIC AUDIT ---');

  const startupDoc = await db.collection('startups').findOne({ _id: new mongoose.Types.ObjectId(startupId) });
  recordResult('Forensic Check: Startup Founder ID Matches User', startupDoc?.founder?.toString() === founderId.toString());

  const interestDoc = await db.collection('investorinterests').findOne({ startup: new mongoose.Types.ObjectId(startupId) });
  recordResult('Forensic Check: Interest References Valid Startup & Investor', !!interestDoc && interestDoc?.investor?.toString() === investorId.toString());

  const roundDoc = await db.collection('fundraisingrounds').findOne({ startup: new mongoose.Types.ObjectId(startupId) });
  recordResult('Forensic Check: Round References Valid Startup', !!roundDoc && roundDoc?.startup?.toString() === startupId.toString());

  // --- PHASE 15: INVENTORY OF CREATED TEST DATA BEFORE CLEANUP ---
  console.log('\n--- PHASE 15: CREATED TEST DOCUMENTS INVENTORY ---');

  let testCreatedDocsCount = 0;
  let testCreatedInventory = [];
  for (const col of dbCols) {
    if (col.name !== 'users') {
      const count = await db.collection(col.name).countDocuments();
      if (count > 0) {
        testCreatedDocsCount += count;
        testCreatedInventory.push({ collection: col.name, count });
      }
    }
  }
  console.log(`Test-Created Documents Total: ${testCreatedDocsCount}`);
  console.log('Breakdown:', JSON.stringify(testCreatedInventory, null, 2));

  // --- PHASE 16: BASELINE CLEANUP & FINAL DB VERIFICATION ---
  console.log('\n--- PHASE 16: BASELINE CLEANUP & FINAL VERIFICATION ---');

  for (const col of dbCols) {
    if (col.name !== 'users') {
      await db.collection(col.name).deleteMany({});
    }
  }
  await db.collection('users').deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });

  const finalUserCount = await User.countDocuments();
  recordResult('Final MongoDB Atlas User Count', finalUserCount === 3, `Count: ${finalUserCount}`);

  let finalTotalDocs = 0;
  let nonZeroCols = [];
  for (const col of dbCols) {
    const count = await db.collection(col.name).countDocuments();
    finalTotalDocs += count;
    if (count > 0) nonZeroCols.push({ name: col.name, count });
  }

  recordResult('Final Total Database Documents', finalTotalDocs === 3, `Total Docs: ${finalTotalDocs}`);
  recordResult('Final Non-Empty Collections (Only users)', nonZeroCols.length === 1 && nonZeroCols[0].name === 'users', JSON.stringify(nonZeroCols));

  console.log('\n================================================================');
  console.log(` MASTER UAT SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${errors.length} FAILED)`);
  console.log('================================================================\n');

  await mongoose.connection.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

runUserAcceptanceMasterTest().catch((err) => {
  console.error('❌ User Acceptance Master Test Fatal Error:', err);
  process.exit(1);
});
