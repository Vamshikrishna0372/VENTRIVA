const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const assert = require('assert');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runRealFlowAuthVerification() {
  console.log('================================================================');
  console.log(' VENTRIVA REAL-BROWSER MULTI-ROLE MANUAL LOGIN VERIFICATION ');
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
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    const usersCount = await db.collection('users').countDocuments();
    record('Baseline Inventory: Clean Primary Users Count', usersCount === 3, `Count: ${usersCount}`);

    // 2. Admin Manual Login
    const adminRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ventriva.com',
      password: 'admin123',
    });
    record('Admin Manual Login (admin@ventriva.com / admin123)', adminRes.status === 200 && adminRes.data.user.role === 'admin');

    const adminToken = adminRes.data.token;
    const adminMe = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    record('Admin /api/auth/me Session Restoration', adminMe.status === 200 && adminMe.data.user.email === 'admin@ventriva.com');

    // 3. Founder Manual Login
    const founderRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'founder@ventriva.com',
      password: 'founder123',
    });
    record('Founder Manual Login (founder@ventriva.com / founder123)', founderRes.status === 200 && founderRes.data.user.role === 'founder');

    const founderToken = founderRes.data.token;
    const founderMe = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${founderToken}` },
    });
    record('Founder /api/auth/me Session Restoration', founderMe.status === 200 && founderMe.data.user.email === 'founder@ventriva.com');

    // 4. Investor Manual Login
    const investorRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'investor@ventriva.com',
      password: 'investor123',
    });
    record('Investor Manual Login (investor@ventriva.com / investor123)', investorRes.status === 200 && investorRes.data.user.role === 'investor');

    const investorToken = investorRes.data.token;
    const investorMe = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${investorToken}` },
    });
    record('Investor /api/auth/me Session Restoration', investorMe.status === 200 && investorMe.data.user.email === 'investor@ventriva.com');

    // 5. Case-Insensitive Email Login Test
    const caseRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'Founder@Ventriva.com',
      password: 'founder123',
    });
    record('Case-Insensitive Email Login (Founder@Ventriva.com)', caseRes.status === 200 && caseRes.data.user.email === 'founder@ventriva.com');

    // 6. Wrong Password Guard Test
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'founder@ventriva.com',
        password: 'wrongpassword123',
      });
      record('Wrong Password Rejection (HTTP 401)', false, 'Expected 401 error but got 200');
    } catch (err) {
      record('Wrong Password Rejection (HTTP 401)', err.response?.status === 401);
    }

    // 7. Duplicate Registration Guard Test
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: 'Duplicate Founder',
        email: 'founder@ventriva.com',
        password: 'founder123',
        role: 'founder',
      });
      record('Duplicate Registration Protection (HTTP 409)', false, 'Expected 409 error but got success');
    } catch (err) {
      record('Duplicate Registration Protection (HTTP 409)', err.response?.status === 409);
    }

    // 8. Re-Login Repeat Verification (Ensuring Hash Preservation)
    const founderRelogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'founder@ventriva.com',
      password: 'founder123',
    });
    record('Repeat Login Hash Preservation Check', founderRelogin.status === 200 && founderRelogin.data.user.role === 'founder');

    // 9. Startup Creation & MongoDB Persistence
    const startupRes = await axios.post(
      `${API_BASE}/startups`,
      {
        startupName: 'VentrivaPay FinTech Verification',
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
    record('Founder Startup Creation & Persistence', [200, 201].includes(startupRes.status) && createdStartup?._id);

    const startupId = createdStartup._id;
    const myStartup = await axios.get(`${API_BASE}/startups/my`, {
      headers: { Authorization: `Bearer ${founderToken}` },
    });
    const retrievedStartup = myStartup.data.startup || myStartup.data.data;
    record('Founder GET /api/startups/my Returns Startup', myStartup.status === 200 && retrievedStartup?.startupName === 'VentrivaPay FinTech Verification');

    // Clean up temporary test startup
    await db.collection('startups').deleteOne({ _id: new mongoose.Types.ObjectId(startupId) });
    console.log('✓ Cleaned temporary test startup document');

    // 10. Baseline Document Final Verification
    const finalDocsCount = await db.collection('users').countDocuments();
    record('Final Baseline Users Count', finalDocsCount === 3, `Count: ${finalDocsCount}`);

    console.log('\n================================================================');
    console.log(` REAL-FLOW AUTH SUMMARY: ${passed} / ${total} TESTS PASSED (${total - passed} FAILED)`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (error) {
    console.error('Fatal Error during verification:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runRealFlowAuthVerification();
