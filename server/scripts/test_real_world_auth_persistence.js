const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runRealWorldAuthPersistenceTest() {
  console.log('================================================================');
  console.log(' VENTRIVA REAL-WORLD AUTHENTICATION & PERSISTENCE REGRESSION ');
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

  // CONNECT TO MONGOOSE TO INSPECT DB DIRECTLY
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const dbCols = await db.listCollections().toArray();
  const User = require('../models/User');

  // STEP 1: Existing Admin login
  const adminRes = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  recordResult('1. Existing Admin Login (admin@ventriva.com)', adminRes.status === 200 && adminRes.data.user.role === 'admin');

  // STEP 2: Existing Founder login
  const founderRes = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('2. Existing Founder Login (founder@ventriva.com)', founderRes.status === 200 && founderRes.data.user.role === 'founder');

  // STEP 3: Existing Investor login
  const investorRes = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
  recordResult('3. Existing Investor Login (investor@ventriva.com)', investorRes.status === 200 && investorRes.data.user.role === 'investor');

  const adminToken = adminRes.data.token;
  const founderToken = founderRes.data.token;
  const investorToken = investorRes.data.token;

  // STEP 4: Case-insensitive email handling
  const mixedEmailRes = await axios.post(`${API_BASE}/auth/login`, { email: 'Founder@Ventriva.com', password: 'founder123' });
  recordResult('4. Case-Insensitive Email Login (Founder@Ventriva.com)', mixedEmailRes.status === 200 && mixedEmailRes.data.user.email === 'founder@ventriva.com');

  // STEP 5: Wrong password rejection
  const wrongPassRes = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'WrongPassword99!' }).catch((e) => e.response);
  recordResult('5. Wrong Password Rejection (HTTP 401)', wrongPassRes?.status === 401 && wrongPassRes?.data?.message === 'Invalid email or password');

  // STEP 6: Unknown email rejection
  const unknownEmailRes = await axios.post(`${API_BASE}/auth/login`, { email: 'unknown_account_xyz@ventriva.com', password: 'SomePassword123' }).catch((e) => e.response);
  recordResult('6. Unknown Email Rejection (HTTP 401)', unknownEmailRes?.status === 401 && unknownEmailRes?.data?.message === 'Invalid email or password');

  // STEP 7: Existing email registration returns 409 Conflict
  const dupRegisterRes = await axios.post(`${API_BASE}/auth/register`, {
    name: 'Duplicate Founder',
    email: 'founder@ventriva.com',
    password: 'NewPassword123!',
    role: 'founder',
  }).catch((e) => e.response);
  recordResult('7. Existing Email Registration Protection (HTTP 409 Conflict)', dupRegisterRes?.status === 409 && dupRegisterRes?.data?.message?.includes('already exists'));

  // STEP 8: Login -> /api/auth/me session restoration
  const meRes = await axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('8. GET /api/auth/me Session Restoration', meRes.status === 200 && meRes.data.user.email === 'founder@ventriva.com');

  // STEP 9: Token persistence (verify repeated logins don't corrupt bcrypt password hash)
  const founderResRepeat = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('9. Token Persistence (Repeat Login Post-Save Check)', founderResRepeat.status === 200);

  // STEP 10: Founder startup creation & persistence check
  // Clean existing startup if any for test consistency
  const existingStartupRes = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${founderToken}` } });
  if (existingStartupRes.data.startup?._id) {
    await axios.delete(`${API_BASE}/startups/my/${existingStartupRes.data.startup._id}`, { headers: { Authorization: `Bearer ${founderToken}` } }).catch(() => null);
  }

  const createStartupRes = await axios.post(
    `${API_BASE}/startups`,
    {
      startupName: 'Ventriva Global FinTech',
      tagline: 'Autonomous venture payment infrastructure',
      description: 'Next-gen venture investment engine with automated matching and readiness scoring.',
      foundedYear: 2024,
      sector: 'FinTech',
      subSector: 'Payments',
      stage: 'Seed',
      businessModel: 'B2B',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      monthlyRevenue: 30000,
      annualRevenue: 360000,
      customerCount: 120,
      fundingRequired: 1500000,
      fundraisingStatus: 'Currently Raising',
      profileVisibility: 'Investors Only',
    },
    { headers: { Authorization: `Bearer ${founderToken}` } }
  );
  const startupObj = createStartupRes.data.startup;
  assert(startupObj?._id, 'Startup creation failed');
  recordResult('10. Founder Startup Creation & DB Persistence', !!startupObj._id);

  // Publish startup for discovery
  await axios.put(`${API_BASE}/startups/my/${startupObj._id}`, { isPublished: true, profileVisibility: 'Investors Only' }, { headers: { Authorization: `Bearer ${founderToken}` } });

  // Verify GET /api/startups/my returns same startup
  const getStartupRes = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('11. GET /api/startups/my Returns Persisted Startup', getStartupRes.data.startup?.startupName === 'Ventriva Global FinTech');

  // STEP 12: Readiness API response check (Calculated score)
  const readinessRes = await axios.get(`${API_BASE}/startups/my/readiness`, { headers: { Authorization: `Bearer ${founderToken}` } });
  recordResult('12. GET /api/startups/my/readiness Calculates DB Score', readinessRes.status === 200 && (readinessRes.data.data?.overallScore || 0) > 0);

  // STEP 13: Investor shortlist & interest persistence check
  const shortlistRes = await axios.post(`${API_BASE}/shortlists`, { startupId: startupObj._id, notes: 'Top priority target' }, { headers: { Authorization: `Bearer ${investorToken}` } });
  recordResult('13. Investor Shortlist Creation & DB Persistence', shortlistRes.status === 200 || shortlistRes.status === 201);

  const interestRes = await axios.post(
    `${API_BASE}/interests`,
    { startupId: startupObj._id, interestLevel: 'High', proposedTicketSize: 500000, message: 'Leading Seed round' },
    { headers: { Authorization: `Bearer ${investorToken}` } }
  );
  recordResult('14. Investor Interest Expression ($500k Ticket)', interestRes.status === 200 || interestRes.status === 201);

  // STEP 14: Cross-role access denied checks
  const founderAdminGuard = await axios.get(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${founderToken}` } }).catch((e) => e.response);
  recordResult('15. RBAC Isolation Guard (Founder -> Admin API returns 403)', founderAdminGuard?.status === 403);

  // STEP 15: Clean test-created business data and verify baseline state
  for (const col of dbCols) {
    if (col.name !== 'users') {
      await db.collection(col.name).deleteMany({});
    }
  }

  const finalUserCount = await User.countDocuments();
  recordResult('16. Final Clean Baseline Users Count', finalUserCount === 3, `Count: ${finalUserCount}`);

  let finalTotalDocs = 0;
  for (const col of dbCols) {
    finalTotalDocs += await db.collection(col.name).countDocuments();
  }
  recordResult('17. Final Total Database Document Baseline', finalTotalDocs === 3, `Total Docs: ${finalTotalDocs}`);

  console.log('\n================================================================');
  console.log(` AUTH & PERSISTENCE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${errors.length} FAILED)`);
  console.log('================================================================\n');

  await mongoose.connection.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

runRealWorldAuthPersistenceTest().catch((err) => {
  console.error('❌ Auth Persistence Audit Fatal Error:', err);
  process.exit(1);
});
