const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runMasterForensicAudit() {
  console.log('================================================================');
  console.log(' VENTRIVA MASTER FULL-STACK FORENSIC INTEGRITY & E2E REPAIR AUDIT ');
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

  // ----------------------------------------------------------------
  // 1. ENVIRONMENT & ARCHITECTURE AUDIT
  // ----------------------------------------------------------------
  console.log('\n--- 1. DATABASE ARCHITECTURE & MODEL REFS AUDIT ---');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const modelsDir = path.join(__dirname, '../models');
  const modelFiles = fs.readdirSync(modelsDir).filter((f) => f.endsWith('.js'));
  recordResult('Mongoose Model File Count', modelFiles.length === 50, `Found ${modelFiles.length} model files`);

  modelFiles.forEach((f) => require(path.join(modelsDir, f)));
  const registeredModels = Object.keys(mongoose.models);
  recordResult('Registered Mongoose Models Count', registeredModels.length === 50, `${registeredModels.length} models registered`);

  const dbCols = await db.listCollections().toArray();
  recordResult('MongoDB Atlas Collection Count', dbCols.length === 50, `${dbCols.length} collections in DB`);

  // Foreign Key ref target integrity check
  let invalidRefs = 0;
  for (const mName of registeredModels) {
    const schema = mongoose.model(mName).schema;
    for (const [pName, pObj] of Object.entries(schema.paths)) {
      const ref = pObj.options?.ref || pObj.caster?.options?.ref;
      if (ref && !registeredModels.includes(ref)) {
        invalidRefs++;
        console.error(`     Invalid Ref: ${mName}.${pName} -> ${ref}`);
      }
    }
  }
  recordResult('Foreign Key Ref Target Validation', invalidRefs === 0, `${invalidRefs} invalid references found`);

  // ----------------------------------------------------------------
  // 2. INITIAL CLEAN BASELINE VERIFICATION
  // ----------------------------------------------------------------
  console.log('\n--- 2. DATABASE CLEAN BASELINE AUDIT ---');
  const User = require('../models/User');

  // Reset clean baseline accounts
  await User.deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });

  const accountsSetup = [
    { name: 'System Administrator', email: 'admin@ventriva.com', password: 'admin123', role: 'admin' },
    { name: 'Demo Founder', email: 'founder@ventriva.com', password: 'founder123', role: 'founder' },
    { name: 'Demo Investor', email: 'investor@ventriva.com', password: 'investor123', role: 'investor' },
  ];

  for (const acc of accountsSetup) {
    let u = await User.findOne({ email: acc.email });
    if (!u) {
      await User.create({ ...acc, isVerified: true, isActive: true });
    } else {
      u.password = acc.password;
      u.isVerified = true;
      u.isActive = true;
      await u.save();
    }
  }

  // Clear any leftover business data
  for (const col of dbCols) {
    if (col.name !== 'users') {
      await db.collection(col.name).deleteMany({});
    }
  }

  const baselineUsers = await User.countDocuments();
  recordResult('Clean Users Count Baseline', baselineUsers === 3, `Count: ${baselineUsers}`);

  let baselineBusinessDocs = 0;
  for (const col of dbCols) {
    if (col.name !== 'users') {
      const c = await db.collection(col.name).countDocuments();
      baselineBusinessDocs += c;
    }
  }
  recordResult('Clean Business Collections Baseline', baselineBusinessDocs === 0, `Count: ${baselineBusinessDocs}`);

  // ----------------------------------------------------------------
  // 3. AUTHENTICATION & ROLE-BASED ACCESS CONTROL AUDIT
  // ----------------------------------------------------------------
  console.log('\n--- 3. AUTHENTICATION & RBAC MATRIX AUDIT ---');

  const adminAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  recordResult('Admin Login', adminAuth.status === 200 && adminAuth.data.user.role === 'admin', 'admin@ventriva.com');

  const founderAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('Founder Login', founderAuth.status === 200 && founderAuth.data.user.role === 'founder', 'founder@ventriva.com');

  const investorAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
  recordResult('Investor Login', investorAuth.status === 200 && investorAuth.data.user.role === 'investor', 'investor@ventriva.com');

  const adminToken = adminAuth.data.token;
  const founderToken = founderAuth.data.token;
  const investorToken = investorAuth.data.token;

  // Verify GET /api/auth/me for all roles
  const adminMe = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${adminToken}` } });
  recordResult('GET /api/auth/me (Admin)', (adminMe.data.user?.role || adminMe.data.data?.role) === 'admin');

  const founderMe = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('GET /api/auth/me (Founder)', (founderMe.data.user?.role || founderMe.data.data?.role) === 'founder');

  const investorMe = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${investorToken}` } });
  recordResult('GET /api/auth/me (Investor)', (investorMe.data.user?.role || investorMe.data.data?.role) === 'investor');

  // Verify Invalid Password Rejection (401)
  const invalidPassErr = await axios
    .post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'wrongpassword' })
    .catch((e) => e.response);
  recordResult('Wrong Password Rejection', invalidPassErr?.status === 401, 'Returned HTTP 401');

  // Verify RBAC Server-Side Enforcement (403)
  const founderAdminAccess = await axios
    .get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${founderToken}` } })
    .catch((e) => e.response);
  recordResult('RBAC: Founder blocked from Admin route', founderAdminAccess?.status === 403, 'Returned HTTP 403');

  const investorAdminAccess = await axios
    .get(`${API_BASE}/admin/system/health`, { headers: { Authorization: `Bearer ${investorToken}` } })
    .catch((e) => e.response);
  recordResult('RBAC: Investor blocked from Admin route', investorAdminAccess?.status === 403, 'Returned HTTP 403');

  // ----------------------------------------------------------------
  // 4. OWNERSHIP ISOLATION AUDIT
  // ----------------------------------------------------------------
  console.log('\n--- 4. OWNERSHIP ISOLATION AUDIT ---');
  // Create temporary Founder B
  const founderBAuth = await axios.post(`${API_BASE}/auth/register`, {
    name: 'Founder B',
    email: 'founder_b_temp@ventriva.org',
    password: 'password123',
    role: 'founder',
  });
  const founderBToken = founderBAuth.data.token;

  // Founder A creates startup
  const startupA = await axios.post(
    `${API_BASE}/startups`,
    {
      startupName: 'Vanguard Dynamics',
      tagline: 'Autonomous robotics infrastructure',
      description: 'Next-gen logistics robotics powered by computer vision.',
      foundedYear: 2024,
      sector: 'AI / Machine Learning',
      stage: 'Seed',
      businessModel: 'B2B',
      fundingRequired: 2000000,
      currency: 'USD',
      isPublished: true,
      profileVisibility: 'Investors Only',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );

  const startupAId = startupA.data.startup._id;

  // Founder B attempts to modify Founder A's startup -> Must be rejected (403/404)
  const unauthorizedUpdate = await axios
    .put(`${API_BASE}/startups/my/${startupAId}`, { tagline: 'Hacked tagline' }, { headers: { Authorization: `Bearer ${founderBToken}` } })
    .catch((e) => e.response);

  recordResult('Ownership Security: Founder B blocked from updating Founder A startup', [403, 404].includes(unauthorizedUpdate?.status), `Status: ${unauthorizedUpdate?.status}`);

  // Clean up Founder B user document
  await User.deleteOne({ email: 'founder_b_temp@ventriva.org' });

  // ----------------------------------------------------------------
  // 5. CROSS-ROLE WORKFLOW & PERSISTENCE AUDIT
  // ----------------------------------------------------------------
  console.log('\n--- 5. CROSS-ROLE FULL-STACK WORKFLOW AUDIT ---');

  // Founder A publishes startup
  await axios.put(`${API_BASE}/startups/my/${startupAId}`, { isPublished: true, profileVisibility: 'Investors Only' }, { headers: { Authorization: `Bearer ${founderToken}` } });

  // Investor discovers startup
  const discoverRes = await axios.get(`${API_BASE}/startups/discover`, { headers: { Authorization: `Bearer ${investorToken}` } });
  const foundInDiscovery = (discoverRes.data.data?.startups || discoverRes.data.startups || []).some((s) => s._id === startupAId);
  recordResult('Workflow 1: Investor Discovery', foundInDiscovery);

  // Investor shortlists startup
  const shortlistRes = await axios.post(`${API_BASE}/shortlists`, { startupId: startupAId, notes: 'Target investment candidate' }, { headers: { Authorization: `Bearer ${investorToken}` } });
  recordResult('Workflow 2: Investor Shortlist', shortlistRes.status === 201 || shortlistRes.status === 200);

  // Investor expresses interest
  const interestRes = await axios.post(
    `${API_BASE}/interests`,
    { startupId: startupAId, interestLevel: 'High', proposedTicketSize: 500000, message: 'Leading round' },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  recordResult('Workflow 3: Investor Interest Expression', interestRes.status === 201 || interestRes.status === 200);

  // Investor completes evaluation
  const evalRes = await axios.post(
    `${API_BASE}/evaluations`,
    {
      startupId: startupAId,
      scores: { team: 9, market: 9, product: 8, traction: 8, businessModel: 8, competitiveAdvantage: 9, financials: 7, fundraising: 8 },
      strengths: ['Great team'],
      risks: ['Competition'],
      privateNotes: 'Top candidate',
      investmentDecision: 'Interested',
    },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  recordResult('Workflow 4: Investor Evaluation', evalRes.status === 200 && (evalRes.data.evaluation?.overallScore || 0) > 0);

  // Investor adds to Pipeline
  const pipelineRes = await axios.post(`${API_BASE}/pipelines`, { startupId: startupAId, stage: 'Due Diligence', priority: 'High', expectedInvestment: 500000 }, { headers: { Authorization: `Bearer ${investorToken}` } });
  recordResult('Workflow 5: Investor Pipeline Entry', pipelineRes.status === 201 || pipelineRes.status === 200);

  // Founder reviews & accepts interest -> automatically creates active Conversation
  const interestId = interestRes.data.interest?._id || interestRes.data.data?._id;
  if (interestId) {
    await axios.patch(`${API_BASE}/interests/${interestId}/respond`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${founderToken}` } });
  }

  // Founder fetches active conversation
  const convListRes = await axios.get(`${API_BASE}/conversations`, { headers: { Authorization: `Bearer ${founderToken}` } });
  const conversations = convListRes.data.conversations || convListRes.data.data || [];
  const conversationId = conversations[0]?._id;
  recordResult('Workflow 6: Conversation Thread Creation', !!conversationId);

  if (conversationId) {
    const msgRes = await axios.post(
      `${API_BASE}/messages/${conversationId}`,
      { message: 'Excited to move forward with the round!' },
      { headers: { Authorization: `Bearer ${founderToken}` } }
    );
    recordResult('Workflow 7: Message Persistence', msgRes.status === 201 || msgRes.status === 200);
  }

  // Founder creates Fundraising Round
  const roundRes = await axios.post(
    `${API_BASE}/fundraising-rounds`,
    {
      startupId: startupAId,
      roundName: 'Seed Round 2026',
      roundType: 'Seed',
      targetAmount: 2000000,
      preMoneyValuation: 8000000,
      minimumTicketSize: 50000,
      currency: 'USD',
      summary: 'Seed round for expansion',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );
  const roundObj = roundRes.data.data || roundRes.data.round;
  const roundId = roundObj?._id;
  recordResult('Workflow 8: Fundraising Round Creation', !!roundId);

  // Founder opens Fundraising Round
  if (roundId) {
    await axios.post(`${API_BASE}/fundraising-rounds/${roundId}/open`, {}, { headers: { Authorization: `Bearer ${founderToken}` } });
  }

  // Investor submits commitment
  if (roundId) {
    const commitRes = await axios.post(
      `${API_BASE}/fundraising-rounds/${roundId}/commitments`,
      { committedAmount: 500000, currency: 'USD', notes: 'Co-leading Seed round' },
      { headers: { Authorization: `Bearer ${investorToken}` } }
    );
    recordResult('Workflow 9: Investor Commitment Submission', commitRes.status === 201 || commitRes.status === 200);
  }

  // ----------------------------------------------------------------
  // 6. PURGE TEST DATA & VERIFY FINAL CLEAN BASELINE
  // ----------------------------------------------------------------
  console.log('\n--- 6. DATA PURGE & FINAL DATABASE STATE VERIFICATION ---');

  // Purge business collections
  for (const col of dbCols) {
    if (col.name !== 'users') {
      await db.collection(col.name).deleteMany({});
    }
  }

  // Purge any temporary users
  await User.deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });

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
  console.log(` AUDIT SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${errors.length} FAILED)`);
  console.log('================================================================\n');

  await mongoose.connection.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

runMasterForensicAudit().catch((err) => {
  console.error('❌ Master Audit Fatal Error:', err);
  process.exit(1);
});
