const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runRealWorldBusinessSimulation() {
  console.log('================================================================');
  console.log(' VENTRIVA REAL-WORLD BUSINESS SIMULATION & E2E REPAIR AUDIT ');
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

  // 1. CONNECT & VERIFY INITIAL BASELINE
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const dbCols = await db.listCollections().toArray();

  const User = require('../models/User');
  await db.collection('users').deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });
  for (const col of dbCols) {
    if (col.name !== 'users') await db.collection(col.name).deleteMany({});
  }

  const baselineUsers = await User.countDocuments();
  recordResult('Baseline Setup: Clean Users Count', baselineUsers === 3, `Count: ${baselineUsers}`);

  // 2. AUTHENTICATION TEST FOR ALL THREE ROLES
  console.log('\n--- PHASE 1: AUTHENTICATION & ROLE DASHBOARD ROUTING ---');

  const adminAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  recordResult('Admin Login', adminAuth.status === 200 && adminAuth.data.user.role === 'admin');

  const founderAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('Founder Login', founderAuth.status === 200 && founderAuth.data.user.role === 'founder');

  const investorAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
  recordResult('Investor Login', investorAuth.status === 200 && investorAuth.data.user.role === 'investor');

  const adminToken = adminAuth.data.token;
  const founderToken = founderAuth.data.token;
  const investorToken = investorAuth.data.token;

  const founderId = founderAuth.data.user._id;
  const investorId = investorAuth.data.user._id;

  // Session restoration test (/api/auth/me)
  const founderMe = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('Session Restoration (/api/auth/me)', founderMe.data.user?.email === 'founder@ventriva.com');

  // RBAC server-side protection
  const founderAdminGuard = await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${founderToken}` } }).catch((e) => e.response);
  recordResult('RBAC Server Protection (Founder -> Admin API)', founderAdminGuard?.status === 403);

  // 3. FOUNDER REAL BUSINESS WORKFLOW: CREATING VENTRIVAPAY
  console.log('\n--- PHASE 2: FOUNDER REAL BUSINESS WORKFLOW (VENTRIVAPAY) ---');

  // Check if startup exists
  const existingStartup = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${founderToken}` } }).catch(() => null);
  if (existingStartup?.data?.startup?._id) {
    await axios.delete(`${API_BASE}/startups/my/${existingStartup.data.startup._id}`, { headers: { Authorization: `Bearer ${founderToken}` } }).catch(() => null);
  }

  // Create Startup: VentrivaPay
  const startupRes = await axios.post(
    `${API_BASE}/startups`,
    {
      startupName: 'VentrivaPay',
      tagline: 'Smarter digital payments for growing businesses',
      description: 'VentrivaPay is a fintech platform helping small and mid-sized businesses manage digital payments, reconciliation, and financial operations from one unified platform.',
      foundedYear: 2024,
      sector: 'FinTech',
      subSector: 'Payments',
      stage: 'Pre-Seed',
      businessModel: 'B2B',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      monthlyRevenue: 25000,
      annualRevenue: 300000,
      revenueCurrency: 'USD',
      customerCount: 150,
      userCount: 1200,
      fundraisingStatus: 'Currently Raising',
      fundingRequired: 1500000,
      fundingCurrency: 'USD',
      profileVisibility: 'Investors Only',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );

  const startupObj = startupRes.data.startup || startupRes.data.data;
  assert(startupObj?._id, 'Startup creation failed');
  const startupId = startupObj._id;
  recordResult('Founder: Startup Creation (VentrivaPay)', !!startupId, `ID: ${startupId}`);

  // Publish Startup
  await axios.put(`${API_BASE}/startups/my/${startupId}`, { isPublished: true, profileVisibility: 'Investors Only' }, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('Founder: Startup Published for Investor Discovery', true);

  // Add Team Member
  const teamRes = await axios.post(
    `${API_BASE}/startups/my/${startupId}/team`,
    { name: 'Rahul Sharma', role: 'Co-Founder & CTO', bio: 'Former Senior Payments Engineer at Razorpay.', linkedin: 'https://linkedin.com/in/rahulsharma' },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );
  recordResult('Founder: Team Member Added', teamRes.status === 201 || teamRes.status === 200);

  // Readiness Score Computation
  const readinessRes = await axios.get(`${API_BASE}/startups/my/readiness`, { headers: { Authorization: `Bearer ${founderToken}` } });
  const score = readinessRes.data.data?.overallScore;
  recordResult('Founder: Startup Investment Readiness Score Calculated', typeof score === 'number' && score > 0, `Score: ${score}/100`);

  // 4. INVESTOR WORKFLOW: DISCOVERY, EVALUATION & PIPELINE
  console.log('\n--- PHASE 3: INVESTOR DISCOVERY, EVALUATION & PIPELINE WORKFLOW ---');

  // Discover Startup
  const discoverRes = await axios.get(`${API_BASE}/startups/discover`, { headers: { Authorization: `Bearer ${investorToken}` } });
  const discovered = (discoverRes.data.data?.startups || discoverRes.data.startups || []).some((s) => s._id === startupId);
  recordResult('Investor: Startup Discovery in Portal', discovered);

  // Shortlist Startup
  const shortlistRes = await axios.post(`${API_BASE}/shortlists`, { startupId, notes: 'High priority payments fintech target' }, { headers: { Authorization: `Bearer ${investorToken}` } });
  recordResult('Investor: Add Startup to Shortlist', shortlistRes.status === 201 || shortlistRes.status === 200);

  // Express Interest
  const interestRes = await axios.post(
    `${API_BASE}/interests`,
    { startupId, interestLevel: 'High', proposedTicketSize: 500000, message: 'Leading Seed round.' },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  const interestId = interestRes.data.interest?._id || interestRes.data.data?._id;
  recordResult('Investor: Express Interest ($500,000 proposed ticket)', !!interestId);

  // Evaluate Startup (Full 8-category scoring)
  const evalRes = await axios.post(
    `${API_BASE}/evaluations`,
    {
      startupId,
      scores: { team: 9, market: 9, product: 9, traction: 8, businessModel: 8, competitiveAdvantage: 8, financials: 8, fundraising: 9 },
      strengths: ['Experienced fintech team', 'Strong MRR growth'],
      risks: ['Regulatory hurdles in cross-border payments'],
      privateNotes: 'Top priority investment lead.',
      investmentDecision: 'Interested',
    },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  recordResult('Investor: Complete Venture Evaluation', evalRes.status === 200 && (evalRes.data.evaluation?.overallScore || 0) > 0);

  // Pipeline Entry
  const pipelineRes = await axios.post(
    `${API_BASE}/pipelines`,
    { startupId, stage: 'Due Diligence', priority: 'High', expectedInvestment: 500000 },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  recordResult('Investor: Pipeline Entry Created (Due Diligence)', pipelineRes.status === 201 || pipelineRes.status === 200);

  // 5. CROSS-ROLE ENGAGEMENT: MESSAGING & MEETINGS
  console.log('\n--- PHASE 4: FOUNDER ↔ INVESTOR MESSAGING & MEETINGS ---');

  // Founder accepts interest -> System auto-creates conversation thread
  if (interestId) {
    await axios.patch(`${API_BASE}/interests/${interestId}/respond`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${founderToken}` } });
  }

  // Founder fetches active conversation
  const convRes = await axios.get(`${API_BASE}/conversations`, { headers: { Authorization: `Bearer ${founderToken}` } });
  const conversations = convRes.data.conversations || convRes.data.data || [];
  const conversationId = conversations[0]?._id;
  recordResult('Cross-Role: Active Conversation Thread Verified', !!conversationId);

  if (conversationId) {
    // Founder sends message
    const msg1 = await axios.post(`${API_BASE}/messages/${conversationId}`, { message: 'Hi! Thanks for accepting. Looking forward to discussing terms.' }, { headers: { Authorization: `Bearer ${founderToken}` } });
    recordResult('Cross-Role: Founder Sent Message', msg1.status === 201 || msg1.status === 200);

    // Investor replies
    const msg2 = await axios.post(`${API_BASE}/messages/${conversationId}`, { message: 'Great! Let us schedule a term sheet review call.' }, { headers: { Authorization: `Bearer ${investorToken}` } });
    recordResult('Cross-Role: Investor Replied to Message', msg2.status === 201 || msg2.status === 200);
  }

  // Schedule Meeting
  const startMeeting = new Date(Date.now() + 86400000 * 2);
  const endMeeting = new Date(startMeeting.getTime() + 1800000); // 30 mins later

  const meetingRes = await axios.post(
    `${API_BASE}/meetings`,
    {
      startupId,
      title: 'VentrivaPay Seed Round Term Sheet Review',
      scheduledStart: startMeeting.toISOString(),
      scheduledEnd: endMeeting.toISOString(),
      meetingType: 'Video Call',
      agenda: 'Discuss pre-money valuation and syndicate terms.',
    },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  const meetingId = meetingRes.data.meeting?._id || meetingRes.data.data?._id;
  recordResult('Cross-Role: Investor Scheduled Meeting', !!meetingId);

  if (meetingId) {
    // Founder confirms meeting
    const confirmRes = await axios.patch(`${API_BASE}/meetings/${meetingId}/confirm`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
    recordResult('Cross-Role: Founder Confirmed Meeting', confirmRes.status === 200);
  }

  // 6. FUNDRAISING, COMMITMENT, DEAL & CLOSING WORKFLOW
  console.log('\n--- PHASE 5: FUNDRAISING, COMMITMENT, DEAL & CLOSING ---');

  // Founder creates Fundraising Round
  const roundRes = await axios.post(
    `${API_BASE}/fundraising-rounds`,
    {
      startupId,
      roundName: 'Seed Round 2026',
      roundType: 'Seed',
      targetAmount: 1500000,
      preMoneyValuation: 6000000,
      minimumTicketSize: 50000,
      currency: 'USD',
      summary: 'Expansion of payment gateway infrastructure',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );
  const roundObj = roundRes.data.data || roundRes.data.round;
  const roundId = roundObj?._id;
  recordResult('Fundraising: Seed Round Created', !!roundId);

  // Founder opens round
  if (roundId) {
    await axios.post(`${API_BASE}/fundraising-rounds/${roundId}/open`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
    recordResult('Fundraising: Round Opened', true);

    // Investor submits commitment
    const commitRes = await axios.post(
      `${API_BASE}/fundraising-rounds/${roundId}/commitments`,
      { committedAmount: 500000, currency: 'USD', notes: 'Lead investor commitment' },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    const commitObj = commitRes.data.commitment || commitRes.data.data;
    const commitmentId = commitObj?._id;
    recordResult('Fundraising: Investor Submitted Commitment ($500,000)', !!commitmentId);

    if (commitmentId) {
      // Founder accepts commitment
      await axios.post(`${API_BASE}/commitments/${commitmentId}/accept`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      recordResult('Fundraising: Founder Accepted Commitment', true);

      // Open Deal Room & create Deal
      const dealRoomRes = await axios.post(`${API_BASE}/commitments/${commitmentId}/open-deal-room`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      recordResult('Deal Room: Created Deal & Closing Transaction', dealRoomRes.status === 200 || dealRoomRes.status === 201);
    }
  }

  // 7. ADMIN OBSERVABILITY AUDIT
  console.log('\n--- PHASE 6: ADMIN OBSERVABILITY AUDIT ---');

  const adminDashboard = await axios.get(`${API_BASE}/admin/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
  recordResult('Admin: Dashboard Metrics Loaded', adminDashboard.status === 200);

  const adminStartups = await axios.get(`${API_BASE}/admin/startups`, { headers: { Authorization: `Bearer ${adminToken}` } });
  recordResult('Admin: Startups Governance View', adminStartups.status === 200);

  const adminAudit = await axios.get(`${API_BASE}/admin/audit-logs`, { headers: { Authorization: `Bearer ${adminToken}` } });
  recordResult('Admin: System Audit Logs Access', adminAudit.status === 200);

  // 8. DATABASE PERSISTENCE & RELATIONSHIP AUDIT BEFORE PURGE
  console.log('\n--- PHASE 7: DATABASE PERSISTENCE & RELATIONSHIP AUDIT ---');

  const startupDoc = await db.collection('startups').findOne({ _id: new mongoose.Types.ObjectId(startupId) });
  recordResult('DB Persistence: Startup Document Exists', !!startupDoc && startupDoc.startupName === 'VentrivaPay');

  const interestDocs = await db.collection('investorinterests').countDocuments({ startup: new mongoose.Types.ObjectId(startupId) });
  recordResult('DB Persistence: Investor Interest Document Exists', interestDocs > 0);

  const roundDocs = await db.collection('fundraisingrounds').countDocuments({ startup: new mongoose.Types.ObjectId(startupId) });
  recordResult('DB Persistence: Fundraising Round Document Exists', roundDocs > 0);

  const commitmentDocs = await db.collection('investorcommitments').countDocuments();
  recordResult('DB Persistence: Investor Commitment Document Exists', commitmentDocs > 0);

  const activityDocs = await db.collection('activitylogs').countDocuments();
  recordResult('DB Persistence: Activity Log Document Exists', activityDocs > 0);

  // 9. CLEANUP SIMULATION TEST DATA & VERIFY FINAL BASELINE
  console.log('\n--- PHASE 8: CLEANUP TEST DATA & FINAL BASELINE VERIFICATION ---');

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
  recordResult('Final Non-Empty Collections', nonZeroCols.length === 1 && nonZeroCols[0].name === 'users', JSON.stringify(nonZeroCols));

  console.log('\n================================================================');
  console.log(` REAL-WORLD SIMULATION SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${errors.length} FAILED)`);
  console.log('================================================================\n');

  await mongoose.connection.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

runRealWorldBusinessSimulation().catch((err) => {
  console.error('❌ Real-World Simulation Fatal Error:', err);
  process.exit(1);
});
