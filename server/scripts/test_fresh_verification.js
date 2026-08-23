const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Startup = require('../models/Startup');

function postJSON(path, payload, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
      },
    };
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
    req.write(dataString);
    req.end();
  });
}

function getJSON(path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
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
    req.end();
  });
}

async function runFreshVerification() {
  console.log('=== FRESH ADVERSARIAL LIVE AUDIT EXECUTION ===\n');

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

    // 2. Health probes
    const health = await getJSON('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returned HTTP 200 ok');

    const ready = await getJSON('/api/health/ready');
    assert(ready.status === 200 && ready.data.data.database === 'ready', 'GET /api/health/ready returned HTTP 200 ready');

    // 3. Fresh Founder Registration & Login
    const founderEmail = `fresh_founder_${timestamp}@ventriva.org`;
    const founderReg = await postJSON('/api/auth/register', {
      name: `Fresh Founder ${timestamp}`,
      email: founderEmail,
      password: 'FreshPassword123!',
      role: 'founder',
    });
    assert(founderReg.status === 201 && founderReg.data.success, `POST /api/auth/register returned HTTP 201 for ${founderEmail}`);

    const founderLogin = await postJSON('/api/auth/login', {
      email: founderEmail,
      password: 'FreshPassword123!',
    });
    assert(founderLogin.status === 200 && founderLogin.data.token, `POST /api/auth/login returned HTTP 200 & JWT token`);
    const founderToken = founderLogin.data.token;

    // 4. Session Restoration Probe
    const me = await getJSON('/api/auth/me', founderToken);
    assert(me.status === 200 && me.data.user && me.data.user.email === founderEmail, `GET /api/auth/me returned HTTP 200 user context (${founderEmail})`);

    // 5. Fresh Startup Creation via API & Atlas Direct Read Verification
    const startupRes = await postJSON(
      '/api/startups',
      {
        startupName: `Fresh Startup ${timestamp}`,
        tagline: 'Empirical verification tech',
        description: 'Automated validation engine',
        foundedYear: 2026,
        businessModel: 'B2B',
        sector: 'AI / Machine Learning',
        stage: 'Seed',
        valuation: 5000000,
        targetRaise: 1000000,
      },
      founderToken
    );
    const createdStartup = startupRes.data.startup || startupRes.data.data;
    assert(startupRes.status === 201 && createdStartup && createdStartup._id, `POST /api/startups created dynamic startup (ID: ${createdStartup?._id})`);

    const createdStartupId = createdStartup?._id;
    const dbStartup = await Startup.findById(createdStartupId).lean();
    assert(dbStartup && dbStartup.startupName === `Fresh Startup ${timestamp}`, `Direct MongoDB Atlas Read: Verified startup persisted in collection`);

    // 6. Fresh Investor Account & RBAC / IDOR Security Test
    const investorEmail = `fresh_investor_${timestamp}@ventriva.org`;
    await postJSON('/api/auth/register', {
      name: `Fresh Investor ${timestamp}`,
      email: investorEmail,
      password: 'FreshPassword123!',
      role: 'investor',
    });

    const investorLogin = await postJSON('/api/auth/login', {
      email: investorEmail,
      password: 'FreshPassword123!',
    });
    const investorToken = investorLogin.data.token;

    // IDOR Attempt: Investor trying to edit Founder's startup
    const idorEdit = await postJSON(`/api/startups/${createdStartupId}`, { startupName: 'Hacked Name' }, investorToken);
    assert(idorEdit.status === 403 || idorEdit.status === 404, `IDOR Security: Cross-user mutation blocked (${idorEdit.status})`);

    // RBAC Attempt: Founder accessing Admin Endpoint
    const rbacAdmin = await getJSON('/api/admin/dashboard', founderToken);
    assert(rbacAdmin.status === 403, `RBAC Security: Founder blocked from Admin Dashboard (HTTP 403)`);

    // 7. Admin Endpoint Authorization Check
    const adminEmail = 'admin@ventriva.com';
    const adminPass = 'admin123';
    const adminLogin = await postJSON('/api/auth/login', { email: adminEmail, password: adminPass });

    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin login (admin@ventriva.com / admin123) returned HTTP 200 & token');
    if (adminLogin.status === 200) {
      const adminDashboard = await getJSON('/api/admin/dashboard', adminLogin.data.token);
      assert(adminDashboard.status === 200 && adminDashboard.data.metrics, `Admin Dashboard: GET /api/admin/dashboard returned HTTP 200 dynamic metrics`);
    }


    console.log(`\n========================================`);
    console.log(`FRESH AUDIT EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

runFreshVerification();
