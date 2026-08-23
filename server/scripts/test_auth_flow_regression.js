const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');

function requestJSON(path, method = 'GET', payload = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = payload ? JSON.stringify(payload) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (dataString) options.headers['Content-Length'] = Buffer.byteLength(dataString);
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runAuthFlowRegression() {
  console.log('=== VENTRIVA AUTHENTICATION FLOW & ROLE REGRESSION ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    assert(mongoose.connection.readyState === 1, 'Connected to MongoDB Atlas');

    // 2. Founder Registration & Automatic Login Role Detection
    const founderEmail = `founder_reg_${timestamp}@ventriva.org`;
    const founderPass = 'FounderPass123!';
    const founderReg = await requestJSON('/api/auth/register', 'POST', {
      name: `Founder Test ${timestamp}`,
      email: founderEmail,
      password: founderPass,
      role: 'founder',
    });
    assert(founderReg.status === 201 && founderReg.data.user?.role === 'founder', `Founder Registration: POST /api/auth/register created founder (${founderEmail})`);

    // Verify MongoDB User Document directly
    const dbFounder = await User.findOne({ email: founderEmail }).lean();
    assert(dbFounder && dbFounder.role === 'founder', 'MongoDB Atlas Read: Verified founder user document role = "founder"');

    // Login using email + password only (NO role supplied)
    const founderLogin = await requestJSON('/api/auth/login', 'POST', {
      email: founderEmail,
      password: founderPass,
    });
    assert(
      founderLogin.status === 200 && founderLogin.data.user?.role === 'founder',
      'Founder Login: POST /api/auth/login (email+pass only) automatically returned user.role = "founder"'
    );

    // Verify /api/auth/me returns founder
    const founderMe = await requestJSON('/api/auth/me', 'GET', null, founderLogin.data.token);
    assert(founderMe.status === 200 && founderMe.data.user?.role === 'founder', 'GET /api/auth/me confirmed authenticated role = "founder"');

    // 3. Investor Registration & Automatic Login Role Detection
    const investorEmail = `investor_reg_${timestamp}@ventriva.org`;
    const investorPass = 'InvestorPass123!';
    const investorReg = await requestJSON('/api/auth/register', 'POST', {
      name: `Investor Test ${timestamp}`,
      email: investorEmail,
      password: investorPass,
      role: 'investor',
    });
    assert(investorReg.status === 201 && investorReg.data.user?.role === 'investor', `Investor Registration: POST /api/auth/register created investor (${investorEmail})`);

    // Verify MongoDB User Document directly
    const dbInvestor = await User.findOne({ email: investorEmail }).lean();
    assert(dbInvestor && dbInvestor.role === 'investor', 'MongoDB Atlas Read: Verified investor user document role = "investor"');

    // Login using email + password only (NO role supplied)
    const investorLogin = await requestJSON('/api/auth/login', 'POST', {
      email: investorEmail,
      password: investorPass,
    });
    assert(
      investorLogin.status === 200 && investorLogin.data.user?.role === 'investor',
      'Investor Login: POST /api/auth/login (email+pass only) automatically returned user.role = "investor"'
    );

    // Verify /api/auth/me returns investor
    const investorMe = await requestJSON('/api/auth/me', 'GET', null, investorLogin.data.token);
    assert(investorMe.status === 200 && investorMe.data.user?.role === 'investor', 'GET /api/auth/me confirmed authenticated role = "investor"');

    // 4. Admin Login & Security Safeguard Test
    const adminLogin = await requestJSON('/api/auth/login', 'POST', {
      email: 'admin@ventriva.com',
      password: 'admin123',
    });
    assert(
      adminLogin.status === 200 && adminLogin.data.user?.role === 'admin',
      'Admin Login: POST /api/auth/login (admin@ventriva.com / admin123) returned role = "admin"'
    );

    const adminMe = await requestJSON('/api/auth/me', 'GET', null, adminLogin.data.token);
    assert(adminMe.status === 200 && adminMe.data.user?.role === 'admin', 'GET /api/auth/me confirmed authenticated role = "admin"');

    // Attempt Public Registration with Admin role (Must fail via backend RBAC)
    const adminRegAttempt = await requestJSON('/api/auth/register', 'POST', {
      name: 'Hacker Admin',
      email: `hacker_admin_${timestamp}@ventriva.org`,
      password: 'HackerPassword123!',
      role: 'admin',
    });
    assert(
      adminRegAttempt.status === 400,
      'Backend RBAC Guard: Public registration strictly forbids admin account creation (HTTP 400)'
    );

    console.log(`\n========================================`);
    console.log(`AUTH FLOW REGRESSION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

runAuthFlowRegression();
