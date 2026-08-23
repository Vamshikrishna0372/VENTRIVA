const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Startup = require('../models/Startup');
const Investment = require('../models/Investment');
const ModerationFlag = require('../models/ModerationFlag');

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

async function runMasterRegression() {
  console.log('=== VENTRIVA FINAL POST-FIX REAL REGRESSION TEST SUITE ===\n');

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

    // 2. Admin Login & Session Restoration
    const adminLogin = await requestJSON('/api/auth/login', 'POST', {
      email: 'admin@ventriva.com',
      password: 'admin123',
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'POST /api/auth/login (admin@ventriva.com / admin123) returned HTTP 200 & JWT token');
    const adminToken = adminLogin.data.token;

    const adminMe = await requestJSON('/api/auth/me', 'GET', null, adminToken);
    assert(adminMe.status === 200 && adminMe.data.user?.role === 'admin', 'GET /api/auth/me returned HTTP 200 for role: admin');

    // 3. Test ALL Admin Endpoints mapped to Admin Routes
    const adminEndpoints = [
      { name: 'Admin Dashboard', path: '/api/admin/dashboard' },
      { name: 'System Health Diagnostics', path: '/api/admin/system/health' },
      { name: 'System Metrics', path: '/api/admin/system/metrics' },
      { name: 'System Jobs', path: '/api/admin/system/jobs' },
      { name: 'Deals Audit', path: '/api/deals' },
      { name: 'Portfolio Audit', path: '/api/investments' },
      { name: 'My Investments', path: '/api/investments/my-investments' },
      { name: 'Portfolio Intelligence Alerts', path: '/api/portfolio-intelligence/alerts' },
      { name: 'Portfolio Concentration', path: '/api/portfolio-intelligence/concentration' },
      { name: 'Strategy Governance', path: '/api/portfolio-strategy/health' },
      { name: 'Fundraising Rounds', path: '/api/admin/fundraising/rounds' },
      { name: 'Fundraising Analytics', path: '/api/admin/fundraising/analytics' },
      { name: 'Fundraising Activity', path: '/api/admin/fundraising/activity' },
      { name: 'Closings Transactions', path: '/api/admin/closings/transactions' },
      { name: 'Closings Analytics', path: '/api/admin/closings/analytics' },
      { name: 'Governance Analytics', path: '/api/admin/governance/analytics' },
      { name: 'Governance Activity', path: '/api/governance-activity' },
      { name: 'Users Governance', path: '/api/admin/users' },
      { name: 'Startups Governance', path: '/api/admin/startups' },
      { name: 'Moderation Flags', path: '/api/admin/flags' },
      { name: 'Audit Logs', path: '/api/admin/audit-logs' },
      { name: 'Platform Analytics', path: '/api/admin/analytics' },
    ];

    for (const ep of adminEndpoints) {
      const res = await requestJSON(ep.path, 'GET', null, adminToken);
      assert(res.status === 200, `GET ${ep.path} (${ep.name}) returned HTTP 200`);
    }

    // 4. Investments Endpoint Detailed Regression
    const myInvestments = await requestJSON('/api/investments/my-investments', 'GET', null, adminToken);
    const hasValidDataArray = Array.isArray(myInvestments.data?.data);
    assert(myInvestments.status === 200 && hasValidDataArray, `GET /api/investments/my-investments returned HTTP 200 & valid JSON array (Count: ${myInvestments.data?.data?.length || 0})`);

    // Verify records originate from MongoDB
    const mongoInvestments = await Investment.find({ isArchived: false }).lean();
    assert(mongoInvestments.length === myInvestments.data?.data?.length, `Investments Regression: API returned count (${myInvestments.data?.data?.length}) matches MongoDB document count (${mongoInvestments.length})`);

    // 5. Server-Side RBAC Enforcement
    const founderEmail = `rbac_founder_${timestamp}@ventriva.org`;
    await requestJSON('/api/auth/register', 'POST', { name: 'RBAC Founder', email: founderEmail, password: 'Password123!', role: 'founder' });
    const founderLogin = await requestJSON('/api/auth/login', 'POST', { email: founderEmail, password: 'Password123!' });
    const founderToken = founderLogin.data.token;

    const investorEmail = `rbac_investor_${timestamp}@ventriva.org`;
    await requestJSON('/api/auth/register', 'POST', { name: 'RBAC Investor', email: investorEmail, password: 'Password123!', role: 'investor' });
    const investorLogin = await requestJSON('/api/auth/login', 'POST', { email: investorEmail, password: 'Password123!' });
    const investorToken = investorLogin.data.token;

    const founderRbac = await requestJSON('/api/admin/dashboard', 'GET', null, founderToken);
    assert(founderRbac.status === 403, 'RBAC Guard: Founder blocked from GET /api/admin/dashboard (HTTP 403)');

    const investorRbac = await requestJSON('/api/admin/users', 'GET', null, investorToken);
    assert(investorRbac.status === 403, 'RBAC Guard: Investor blocked from GET /api/admin/users (HTTP 403)');

    // 6. Real Database Create → Save → Refresh → Read Persistence Test
    const flagData = {
      targetId: new mongoose.Types.ObjectId().toString(),
      targetType: 'founder',
      reason: `Regression test flag ${timestamp}`,
      description: 'Automated persistence verification flag',
      priority: 'High',
    };

    const createFlag = await requestJSON('/api/admin/flags', 'POST', flagData, adminToken);
    const createdFlagId = createFlag.data?.flag?._id || createFlag.data?.data?._id;
    assert(createFlag.status === 201 && createdFlagId, `Create/Save Flow: Admin created moderation flag (ID: ${createdFlagId})`);

    // Verify MongoDB document state directly
    const dbFlag = await ModerationFlag.findById(createdFlagId).lean();
    assert(dbFlag && dbFlag.reason === `Regression test flag ${timestamp}`, 'MongoDB Atlas Persistence: Verified document saved in MongoDB collection');

    // Simulate browser refresh by fetching list via API
    const readFlags = await requestJSON('/api/admin/flags', 'GET', null, adminToken);
    const foundInRead = readFlags.data?.flags?.some((f) => f._id.toString() === createdFlagId.toString());
    assert(readFlags.status === 200 && foundInRead, 'Refresh/Read Flow: API read-back returned the persisted record from MongoDB');

    // Clean up created test flag
    await ModerationFlag.findByIdAndDelete(createdFlagId);

    console.log(`\n========================================`);
    console.log(`REGRESSION EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`✗ FAIL: ${err.message}`);
    process.exit(1);
  }
}

runMasterRegression();
