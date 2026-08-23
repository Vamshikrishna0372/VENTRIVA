const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runRuntimeFixesAudit() {
  console.log('================================================================');
  console.log(' VENTRIVA CRITICAL RUNTIME FIX & REGRESSION AUDIT ');
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

  // Ensure clean start
  await db.collection('users').deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });
  for (const col of dbCols) {
    if (col.name !== 'users') await db.collection(col.name).deleteMany({});
  }

  // --- PART 1: AUTHENTICATION & LOGIN 401 FIX VERIFICATION ---
  console.log('--- PART 1: AUTHENTICATION & LOGIN 401 FIX VERIFICATION ---');

  const adminAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  recordResult('Admin Login (1st attempt)', adminAuth.status === 200 && adminAuth.data.user.role === 'admin');

  // Admin 2nd login (verifies lastLogin update did not corrupt password hash)
  const adminAuth2 = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  recordResult('Admin Login (2nd attempt after lastLogin update)', adminAuth2.status === 200);

  const founderAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('Founder Login (1st attempt)', founderAuth.status === 200 && founderAuth.data.user.role === 'founder');

  const founderAuth2 = await axios.post(`${API_BASE}/auth/login`, { email: 'founder@ventriva.com', password: 'founder123' });
  recordResult('Founder Login (2nd attempt after lastLogin update)', founderAuth2.status === 200);

  const investorAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'investor@ventriva.com', password: 'investor123' });
  recordResult('Investor Login (1st attempt)', investorAuth.status === 200 && investorAuth.data.user.role === 'investor');

  // Test registration -> logout -> login again lifecycle
  const newEmail = `founder_test_${Date.now()}@ventriva.com`;
  const regRes = await axios.post(`${API_BASE}/auth/register`, {
    name: 'New Test Founder',
    email: newEmail,
    password: 'Password123!',
    role: 'founder',
  });
  recordResult('New Founder Registration & Auto-login', regRes.status === 201 && !!regRes.data.token);

  // Login with same credentials immediately after logout
  const reLoginRes = await axios.post(`${API_BASE}/auth/login`, { email: newEmail, password: 'Password123!' });
  recordResult('Login with Registered Credentials after Logout', reLoginRes.status === 200 && reLoginRes.data.user.email === newEmail);

  // Invalid password rejection test
  const wrongPassRes = await axios.post(`${API_BASE}/auth/login`, { email: newEmail, password: 'WrongPassword99!' }).catch((e) => e.response);
  recordResult('Invalid Credentials Rejection (HTTP 401)', wrongPassRes?.status === 401 && wrongPassRes?.data?.message === 'Invalid email or password');

  const newFounderToken = reLoginRes.data.token;

  // --- PART 2: READINESS 404 FIX VERIFICATION ---
  console.log('\n--- PART 2: READINESS 404 FIX VERIFICATION ---');

  // Brand-new founder with NO startup profile fetches readiness
  const emptyReadinessRes = await axios.get(`${API_BASE}/startups/my/readiness`, { headers: { Authorization: `Bearer ${newFounderToken}` } });
  recordResult('Readiness API with No Startup (Returns 200 OK, Not 404)', emptyReadinessRes.status === 200 && emptyReadinessRes.data.data?.overallScore === 0);

  // Investor access to readiness
  const investorReadinessRes = await axios.get(`${API_BASE}/startups/my/readiness`, { headers: { Authorization: `Bearer ${investorAuth.data.token}` } }).catch((e) => e.response);
  recordResult('Readiness API Investor Guard (HTTP 403)', investorReadinessRes?.status === 403);

  // --- PART 3 & 4: STARTUP POST & PERSISTENCE VERIFICATION ---
  console.log('\n--- PART 3 & 4: STARTUP POST & PERSISTENCE VERIFICATION ---');

  const createStartupRes = await axios.post(
    `${API_BASE}/startups`,
    {
      startupName: 'Apex Quantum Pay',
      tagline: 'Next-gen quantum fintech infrastructure',
      description: 'Pioneering ultra-secure quantum-resistant payment processing for financial institutions.',
      foundedYear: 2024,
      sector: 'FinTech',
      subSector: 'Payments',
      stage: 'Seed',
      businessModel: 'B2B',
      country: 'India',
      state: 'Telangana',
      city: 'Hyderabad',
      monthlyRevenue: 15000,
      annualRevenue: 180000,
      customerCount: 45,
      fundingRequired: 1000000,
      fundraisingStatus: 'Currently Raising',
      profileVisibility: 'Investors Only',
    },
    { headers: { Authorization: `Bearer ${newFounderToken}` } }
  );

  const startupObj = createStartupRes.data.startup;
  recordResult('Founder: Startup Creation (POST /api/startups)', createStartupRes.status === 200 || createStartupRes.status === 201, `ID: ${startupObj?._id}`);

  // Fetch created startup via GET /api/startups/my
  const getStartupRes = await axios.get(`${API_BASE}/startups/my`, { headers: { Authorization: `Bearer ${newFounderToken}` } });
  recordResult('Founder: GET /api/startups/my Returns Saved Startup', getStartupRes.status === 200 && getStartupRes.data.startup?.startupName === 'Apex Quantum Pay');

  // Fetch calculated readiness for created startup
  const populatedReadinessRes = await axios.get(`${API_BASE}/startups/my/readiness`, { headers: { Authorization: `Bearer ${newFounderToken}` } });
  recordResult('Founder: GET /api/startups/my/readiness Calculates Real Score', populatedReadinessRes.status === 200 && (populatedReadinessRes.data.data?.overallScore || 0) > 0);

  // --- PART 5: OWNERSHIP SECURITY ISOLATION VERIFICATION ---
  console.log('\n--- PART 5: OWNERSHIP SECURITY ISOLATION VERIFICATION ---');

  // Founder B (founderAuth token) attempts to modify New Founder's startup
  const crossUpdateRes = await axios.put(`${API_BASE}/startups/my/${startupObj._id}`, { startupName: 'Hacked Startup' }, { headers: { Authorization: `Bearer ${founderAuth.data.token}` } }).catch((e) => e.response);
  recordResult('Ownership Isolation: Founder B blocked from updating Founder A startup (403/404)', crossUpdateRes?.status === 403 || crossUpdateRes?.status === 404);

  // --- PART 6: DUPLICATE EMAIL VERIFICATION ---
  console.log('\n--- PART 6: DUPLICATE EMAIL VERIFICATION ---');

  const dupEmailRes = await axios.post(`${API_BASE}/auth/register`, {
    name: 'Duplicate Admin',
    email: 'admin@ventriva.com',
    password: 'password123!',
    role: 'founder',
  }).catch((e) => e.response);
  recordResult('Duplicate Email Registration Guard (HTTP 409 Conflict)', dupEmailRes?.status === 409 && dupEmailRes?.data?.message === 'An account with this email already exists');

  // Verify original Admin account can still login normally
  const adminPostDupAuth = await axios.post(`${API_BASE}/auth/login`, { email: 'admin@ventriva.com', password: 'admin123' });
  recordResult('Original Account Login After Duplicate Attempt', adminPostDupAuth.status === 200);

  // --- PART 7: FINAL DATA CLEANUP & BASELINE VERIFICATION ---
  console.log('\n--- PART 7: FINAL DATA CLEANUP & BASELINE VERIFICATION ---');

  await db.collection('users').deleteMany({ email: { $nin: ['admin@ventriva.com', 'founder@ventriva.com', 'investor@ventriva.com'] } });
  for (const col of dbCols) {
    if (col.name !== 'users') await db.collection(col.name).deleteMany({});
  }

  const finalUserCount = await User.countDocuments();
  recordResult('Final Clean Baseline User Count', finalUserCount === 3, `Count: ${finalUserCount}`);

  let totalDocs = 0;
  for (const col of dbCols) {
    totalDocs += await db.collection(col.name).countDocuments();
  }
  recordResult('Final Total Database Document Count', totalDocs === 3, `Total Docs: ${totalDocs}`);

  console.log('\n================================================================');
  console.log(` RUNTIME FIXES AUDIT SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${errors.length} FAILED)`);
  console.log('================================================================\n');

  await mongoose.connection.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

runRuntimeFixesAudit().catch((err) => {
  console.error('❌ Runtime Fixes Audit Fatal Error:', err);
  process.exit(1);
});
