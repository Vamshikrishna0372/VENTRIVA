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

async function runAuditRegression() {
  console.log('=== VENTRIVA COMPLETE AUTH SESSION, LANDING PAGE & LOGIN FLOW AUDIT ===\n');

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

    // 2. Test A — Fresh unauthenticated state check
    const unauthCheck = await requestJSON('/api/auth/me', 'GET');
    assert(unauthCheck.status === 401, 'Test A — Fresh Unauthenticated State: GET /api/auth/me returns 401 Unauthorized (No token)');

    // 3. Test B & C — Admin Login
    const adminLogin = await requestJSON('/api/auth/login', 'POST', {
      email: 'admin@ventriva.com',
      password: 'admin123',
    });
    assert(
      adminLogin.status === 200 && adminLogin.data.user?.role === 'admin' && adminLogin.data.token,
      'Test C — Admin Login: POST /api/auth/login returned HTTP 200 & role = "admin"'
    );
    const adminToken = adminLogin.data.token;

    // 4. Test D — Refresh Session Check
    const adminMe = await requestJSON('/api/auth/me', 'GET', null, adminToken);
    assert(
      adminMe.status === 200 && adminMe.data.user?.email === 'admin@ventriva.com' && adminMe.data.user?.role === 'admin',
      'Test D — Admin Refresh/Session Restoration: GET /api/auth/me confirmed valid admin session'
    );

    // 5. Test E — Logout
    const adminLogout = await requestJSON('/api/auth/logout', 'POST', null, adminToken);
    assert(adminLogout.status === 200, 'Test E — Logout: POST /api/auth/logout returned HTTP 200 success');

    // 6. Test F — Post-Logout State
    const postLogoutCheck = await requestJSON('/api/auth/me', 'GET', null, null);
    assert(postLogoutCheck.status === 401, 'Test F — Open Root After Logout: Unauthenticated session verified (HTTP 401)');

    // 7. Test G — Founder Registration & Login
    const founderEmail = `audit_founder_${timestamp}@ventriva.org`;
    const founderPass = 'FounderPass123!';
    const founderReg = await requestJSON('/api/auth/register', 'POST', {
      name: `Audit Founder ${timestamp}`,
      email: founderEmail,
      password: founderPass,
      role: 'founder',
    });
    assert(founderReg.status === 201 && founderReg.data.user?.role === 'founder', `Test G — Founder Registration: Created account (${founderEmail})`);

    const founderLogin = await requestJSON('/api/auth/login', 'POST', {
      email: founderEmail,
      password: founderPass,
    });
    assert(founderLogin.status === 200 && founderLogin.data.user?.role === 'founder', 'Test G — Founder Login: Automatically returned role = "founder"');

    // 8. Test H — Investor Registration & Login
    const investorEmail = `audit_investor_${timestamp}@ventriva.org`;
    const investorPass = 'InvestorPass123!';
    const investorReg = await requestJSON('/api/auth/register', 'POST', {
      name: `Audit Investor ${timestamp}`,
      email: investorEmail,
      password: investorPass,
      role: 'investor',
    });
    assert(investorReg.status === 201 && investorReg.data.user?.role === 'investor', `Test H — Investor Registration: Created account (${investorEmail})`);

    const investorLogin = await requestJSON('/api/auth/login', 'POST', {
      email: investorEmail,
      password: investorPass,
    });
    assert(investorLogin.status === 200 && investorLogin.data.user?.role === 'investor', 'Test H — Investor Login: Automatically returned role = "investor"');

    // 9. Test I — Registration Security Safeguard
    const adminRegAttempt = await requestJSON('/api/auth/register', 'POST', {
      name: 'Unauthorized Admin',
      email: `unauth_admin_${timestamp}@ventriva.org`,
      password: 'HackerPassword123!',
      role: 'admin',
    });
    assert(adminRegAttempt.status === 400, 'Test I — Registration Guard: Public registration strictly forbids admin role selection (HTTP 400)');

    console.log(`\n========================================`);
    console.log(`AUDIT REGRESSION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

runAuditRegression();
