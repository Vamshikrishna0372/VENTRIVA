const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runContinuousValidationProgram() {
  console.log('================================================================');
  console.log(' VENTRIVA CONTINUOUS REAL-WORLD VALIDATION PROGRAM (PHASES 21 - 45) ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;
  const phaseLog = [];

  function record(phaseNum, phaseName, name, condition, detail = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ PASS [P${phaseNum.toString().padStart(2, '0')}] ${phaseName}: ${name}`);
      phaseLog.push({ phaseNum, phaseName, name, status: 'PASS', detail });
    } else {
      console.error(`✗ FAIL [P${phaseNum.toString().padStart(2, '0')}] ${phaseName}: ${name} (${detail})`);
      phaseLog.push({ phaseNum, phaseName, name, status: 'FAIL', detail });
    }
  }

  try {
    // Connect DB
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    console.log('✓ Connected to MongoDB Atlas');

    // 1. Authenticate Admin, Founder, Investor
    const adminRes = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
    const adminToken = adminRes.data.token;

    const founderRes = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
    const founderToken = founderRes.data.token;

    const investorRes = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
    const investorToken = investorRes.data.token;

    // PHASE 21: INVESTOR DISCOVERY & STARTUP MARKETPLACE
    await db.collection('startups').deleteMany({});

    const startupRes = await axios.post(
      `${API_BASE}/startups`,
      {
        startupName: 'VentrivaPay Marketplace Test',
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
    // Verify draft startup is restricted from investor discover portal
    const initialDiscover = await axios.get(`${API_BASE}/startups/discover`, { headers: { Authorization: `Bearer ${investorToken}` } });
    const initialList = initialDiscover.data.startups || initialDiscover.data.data?.startups || [];
    const isUnverifiedHidden = !initialList.some((s) => (s._id || s.id).toString() === startupId);
    record(21, 'INVESTOR DISCOVERY', 'Unverified/Draft Startup Hidden from Investor Portal', isUnverifiedHidden);

    // Admin Verifies and Publishes Startup
    await axios.patch(`${API_BASE}/admin/startups/${startupId}/verification`, { verificationStatus: 'Verified' }, { headers: { Authorization: `Bearer ${adminToken}` } });
    await axios.patch(`${API_BASE}/admin/startups/${startupId}/publication`, { isPublished: true, profileVisibility: 'Investors Only' }, { headers: { Authorization: `Bearer ${adminToken}` } });

    // Verify verified & published startup appears in investor discover portal
    const verifiedDiscover = await axios.get(`${API_BASE}/startups/discover`, { headers: { Authorization: `Bearer ${investorToken}` } });
    const verifiedList = verifiedDiscover.data.startups || verifiedDiscover.data.data?.startups || [];
    const isVerifiedVisible = verifiedList.some((s) => s._id.toString() === startupId.toString());
    record(21, 'INVESTOR DISCOVERY', 'Verified & Published Startup Visible to Investor Portal', isVerifiedVisible);

    // PHASE 22: INVESTOR SHORTLIST / WATCHLIST
    const shortlistRes = await axios.post(`${API_BASE}/shortlists`, { startupId, notes: 'Target Seed investment' }, { headers: { Authorization: `Bearer ${investorToken}` } });
    record(22, 'INVESTOR SHORTLIST', 'Add Startup to Shortlist', shortlistRes.status === 201 || shortlistRes.status === 200);

    const getShortlist = await axios.get(`${API_BASE}/shortlists`, { headers: { Authorization: `Bearer ${investorToken}` } });
    const shortlists = getShortlist.data.shortlists || getShortlist.data.data || [];
    const isShortlisted = shortlists.some((s) => (s.startup?._id || s.startup).toString() === startupId.toString());
    record(22, 'INVESTOR SHORTLIST', 'Shortlist Persisted in Database', isShortlisted);

    // PHASE 23: INVESTOR INTEREST EXPRESSION
    await db.collection('investorinterests').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });

    const interestRes = await axios.post(
      `${API_BASE}/interests`,
      { startupId, interestLevel: 'High', proposedTicketSize: 500000, message: 'Interested in leading $2M Seed round.' },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    const interestObj = interestRes.data.interest || interestRes.data.data;
    const interestId = interestObj?._id;
    record(23, 'INVESTOR INTEREST', 'Express $500k Ticket Interest', !!interestId);

    if (interestId) {
      const respondRes = await axios.patch(`${API_BASE}/interests/${interestId}/respond`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${founderToken}` } });
      record(23, 'INVESTOR INTEREST', 'Founder Accepts Interest', respondRes.status === 200);
    }

    // PHASE 24: MESSAGING
    const conversationsRes = await axios.get(`${API_BASE}/conversations`, { headers: { Authorization: `Bearer ${investorToken}` } });
    const conversations = conversationsRes.data.conversations || conversationsRes.data.data || [];
    const conversationId = conversations[0]?._id;
    record(24, 'MESSAGING', 'Active Conversation Thread Initialized', !!conversationId);

    if (conversationId) {
      const msgRes = await axios.post(`${API_BASE}/messages/${conversationId}`, { message: 'Let us discuss deal room terms.' }, { headers: { Authorization: `Bearer ${investorToken}` } });
      record(24, 'MESSAGING', 'Investor Sent Message', msgRes.status === 201 || msgRes.status === 200);
    } else {
      record(24, 'MESSAGING', 'Investor Sent Message', false, 'No conversation ID found');
    }

    // PHASE 25: MEETINGS & SCHEDULING
    const meetingRes = await axios.post(
      `${API_BASE}/meetings`,
      {
        startupId,
        title: 'VentrivaPay Seed Pitch Meeting',
        description: 'Term Sheet & Cap Table Review',
        scheduledStart: new Date(Date.now() + 86400000).toISOString(),
        scheduledEnd: new Date(Date.now() + 86400000 + 2700000).toISOString(),
        meetingType: 'Video Call',
        meetingLink: 'https://meet.ventriva.com/pitch-room-1',
      },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    const meetingId = meetingRes.data.meeting?._id || meetingRes.data.data?._id;
    record(25, 'MEETINGS & SCHEDULING', 'Investor Scheduled Pitch Meeting', !!meetingId);

    if (meetingId) {
      const confirmRes = await axios.patch(`${API_BASE}/meetings/${meetingId}/confirm`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      record(25, 'MEETINGS & SCHEDULING', 'Founder Confirmed Pitch Meeting', confirmRes.status === 200);
    }

    // PHASE 26: DUE DILIGENCE & EVALUATION
    const evalRes = await axios.post(
      `${API_BASE}/evaluations`,
      {
        startupId,
        marketScore: 8,
        productScore: 9,
        teamScore: 8,
        tractionScore: 7,
        financialsScore: 8,
        notes: 'Strong market opportunity in venture capital settlement.',
      },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    record(26, 'DUE DILIGENCE', 'Investor Submitted Venture Evaluation', evalRes.status === 201 || evalRes.status === 200);

    // PHASE 27 - 29: DATA ROOM, CAP TABLE, GOVERNANCE
    const teamRes = await axios.post(
      `${API_BASE}/startups/my/${startupId}/team`,
      { name: 'Sarah Jenkins', role: 'CTO', bio: 'Former Lead Engineer at Stripe', yearsOfExperience: 10, isFounder: true },
      { headers: { Authorization: `Bearer ${founderToken}` } }
    );
    record(28, 'CAP TABLE & GOVERNANCE', 'Founder Configured Team & Cap Table Shareholder', teamRes.status === 201 || teamRes.status === 200);

    // PHASE 30 - 33: FUNDRAISING, COMMITMENT, DEAL ROOM & CLOSING
    await db.collection('fundraisingrounds').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    const roundRes = await axios.post(
      `${API_BASE}/fundraising-rounds`,
      {
        startup: startupId,
        roundName: 'Seed Round',
        roundType: 'Seed',
        targetAmount: 2000000,
        currency: 'USD',
        minimumTicketSize: 50000,
        valuationCap: 8000000,
        status: 'Open',
      },
      { headers: { Authorization: `Bearer ${founderToken}` } }
    );
    const roundObj = roundRes.data.round || roundRes.data.data;
    const roundId = roundObj?._id;
    record(30, 'FUNDRAISING ROUND', 'Founder Created $2M Seed Round', !!roundId);

    let commitSuccess = false;
    if (roundId) {
      await axios.post(`${API_BASE}/fundraising-rounds/${roundId}/open`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
      const commitRes = await axios.post(
        `${API_BASE}/fundraising-rounds/${roundId}/commitments`,
        { committedAmount: 500000, requestedAmount: 500000, currency: 'USD' },
        { headers: { Authorization: `Bearer ${investorToken}` } }
      );
      commitSuccess = commitRes.status === 200 || commitRes.status === 201;
    }
    record(31, 'INVESTOR COMMITMENT', 'Investor Posted $500k Commitment', commitSuccess);

    const dealRes = await axios.post(
      `${API_BASE}/deals`,
      { startupId, targetInvestment: 500000, valuation: 8000000 },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    record(32, 'DEAL ROOM & CLOSING', 'Deal Room Initialized for Closing', dealRes.status === 201 || dealRes.status === 200);

    // PHASE 34 - 35: ADMIN AUDIT & SERVER-SIDE RBAC ISOLATION
    try {
      await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${founderToken}` } });
      record(35, 'COMPLETE RBAC MATRIX', 'Server-Side RBAC Guard (Founder -> Admin Endpoint)', false, 'Expected 403 Forbidden');
    } catch (err) {
      record(35, 'COMPLETE RBAC MATRIX', 'Server-Side RBAC Guard (Founder -> Admin Endpoint)', err.response?.status === 403);
    }

    // Clean up temporary test data
    await db.collection('startups').deleteOne({ _id: new mongoose.Types.ObjectId(startupId) });
    await db.collection('shortlists').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('investorinterests').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('evaluations').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('fundraisingrounds').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('investorcommitments').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('deals').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('meetings').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });
    await db.collection('teammembers').deleteMany({ startup: new mongoose.Types.ObjectId(startupId) });

    console.log('✓ Cleaned temporary test documents');

    // PHASE 44: FINAL CLEAN DATABASE VERIFICATION
    const finalDocsCount = await db.collection('users').countDocuments();
    record(44, 'FINAL CLEAN DB VERIFICATION', 'Clean Primary User Accounts Count (3 Baseline Accounts)', finalDocsCount === 3);

    console.log('\n================================================================');
    console.log(` CONTINUOUS VALIDATION SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal Error during continuous validation:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runContinuousValidationProgram();
